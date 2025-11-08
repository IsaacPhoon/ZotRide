from flask import Blueprint, request, jsonify
from sqlalchemy import select, or_, and_
from datetime import datetime, timezone
from app.extensions import db
from app.models import Ride, DriverData, User, UserRideData, Organization

ride_bp = Blueprint('ride', __name__)


@ride_bp.route('/rides', methods=['POST'])
def create_ride():
    """
    Create a new ride (either a driver post or rider request).

    Expected JSON body:
    {
        "pickup_address": "123 Main St",
        "pickup_time": "2025-01-15T10:00:00",
        "destination_address": "456 Elm St",
        "max_riders": 4,
        "price_option": "free",  # Options: 'free', 'gas', 'gas with fee'
        "driver_id": 1,  # Optional - if provided, this is a driver post; if null, this is a rider request
        "organization_id": 1,  # Optional - if this ride is for an organization
        "driver_comment": "I prefer quiet passengers"  # Optional
    }

    Returns:
        201: Ride created successfully
        400: Invalid request data or missing required fields
        404: Driver or organization not found
        403: Driver is not approved
    """
    try:
        data = request.get_json()

        # Validate required fields
        required_fields = ['pickup_address', 'pickup_time', 'destination_address', 'max_riders', 'price_option']
        if not all(field in data for field in required_fields):
            return jsonify({'error': 'Missing required fields'}), 400

        # If driver_id is provided, validate driver exists and is approved
        if data.get('driver_id'):
            driver = db.session.get(DriverData, data['driver_id'])
            if not driver:
                return jsonify({'error': 'Driver not found'}), 404
            if not driver.is_approved:
                return jsonify({'error': 'Driver is not approved'}), 403

        # If organization_id is provided, validate organization exists
        if data.get('organization_id'):
            organization = db.session.get(Organization, data['organization_id'])
            if not organization:
                return jsonify({'error': 'Organization not found'}), 404

        # Parse datetime
        pickup_time = datetime.fromisoformat(data['pickup_time'].replace('Z', '+00:00'))

        # Create new ride
        ride = Ride(
            pickup_address=data['pickup_address'],
            pickup_time=pickup_time,
            destination_address=data['destination_address'],
            max_riders=data['max_riders'],
            price_option=data['price_option'],
            driver_id=data.get('driver_id'),
            organization_id=data.get('organization_id'),
            driver_comment=data.get('driver_comment')
        )

        db.session.add(ride)
        db.session.commit()

        return jsonify(ride.to_dict()), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400


@ride_bp.route('/rides', methods=['GET'])
def get_rides():
    """
    Get all rides with optional filtering.

    Query parameters:
        - status: Filter by status (active/completed/cancelled) (optional)
        - has_driver: Filter rides with/without driver (true/false) (optional)
        - organization_id: Filter by organization (optional)
        - limit: Maximum number of rides to return (optional)
        - offset: Number of rides to skip (optional)

    Returns:
        200: List of rides matching the filters
    """
    try:
        status = request.args.get('status')
        has_driver = request.args.get('has_driver', type=lambda v: v.lower() == 'true')
        organization_id = request.args.get('organization_id', type=int)
        limit = request.args.get('limit', type=int)
        offset = request.args.get('offset', type=int, default=0)

        query = select(Ride)

        # Apply filters
        if status:
            query = query.where(Ride.status == status)
        if has_driver is not None:
            if has_driver:
                query = query.where(Ride.driver_id.isnot(None))
            else:
                query = query.where(Ride.driver_id.is_(None))
        if organization_id:
            query = query.where(Ride.organization_id == organization_id)

        # Apply pagination
        query = query.offset(offset)
        if limit:
            query = query.limit(limit)

        rides = db.session.execute(query).scalars().all()

        return jsonify([ride.to_dict() for ride in rides]), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 400


@ride_bp.route('/rides/<int:ride_id>', methods=['GET'])
def get_ride(ride_id):
    """
    Get a specific ride by ID.

    Args:
        ride_id: The ID of the ride to retrieve

    Returns:
        200: Ride data
        404: Ride not found
    """
    try:
        ride = db.session.get(Ride, ride_id)

        if not ride:
            return jsonify({'error': 'Ride not found'}), 404

        return jsonify(ride.to_dict()), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 400


@ride_bp.route('/rides/<int:ride_id>', methods=['PUT'])
def update_ride(ride_id):
    """
    Update a ride's information.

    Args:
        ride_id: The ID of the ride to update

    Expected JSON body (all fields optional):
    {
        "pickup_address": "789 Oak St",
        "pickup_time": "2025-01-15T11:00:00",
        "destination_address": "321 Pine St",
        "max_riders": 3,
        "price_option": "gas",
        "status": "active",  # Options: 'active', 'completed', 'cancelled'
        "driver_id": 2,  # Can be set to add a driver to a rider request
        "driver_comment": "Updated comment"
    }

    Returns:
        200: Ride updated successfully
        404: Ride not found
        403: Driver is not approved
        400: Invalid request data
    """
    try:
        ride = db.session.get(Ride, ride_id)

        if not ride:
            return jsonify({'error': 'Ride not found'}), 404

        data = request.get_json()

        # Update allowed fields
        if 'pickup_address' in data:
            ride.pickup_address = data['pickup_address']
        if 'pickup_time' in data:
            ride.pickup_time = datetime.fromisoformat(data['pickup_time'].replace('Z', '+00:00'))
        if 'destination_address' in data:
            ride.destination_address = data['destination_address']
        if 'max_riders' in data:
            ride.max_riders = data['max_riders']
        if 'price_option' in data:
            ride.price_option = data['price_option']
        if 'status' in data:
            ride.status = data['status']
        if 'driver_comment' in data:
            ride.driver_comment = data['driver_comment']

        # If updating driver_id, validate driver exists and is approved
        if 'driver_id' in data:
            if data['driver_id']:
                driver = db.session.get(DriverData, data['driver_id'])
                if not driver:
                    return jsonify({'error': 'Driver not found'}), 404
                if not driver.is_approved:
                    return jsonify({'error': 'Driver is not approved'}), 403
            ride.driver_id = data['driver_id']

        db.session.commit()

        return jsonify(ride.to_dict()), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400


@ride_bp.route('/rides/<int:ride_id>', methods=['DELETE'])
def delete_ride(ride_id):
    """
    Delete a ride.

    Args:
        ride_id: The ID of the ride to delete

    Returns:
        204: Ride deleted successfully
        404: Ride not found
    """
    try:
        ride = db.session.get(Ride, ride_id)

        if not ride:
            return jsonify({'error': 'Ride not found'}), 404

        db.session.delete(ride)
        db.session.commit()

        return '', 204

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400


@ride_bp.route('/rides/<int:ride_id>/join', methods=['POST'])
def join_ride(ride_id):
    """
    Join a ride as a rider.

    Args:
        ride_id: The ID of the ride to join

    Expected JSON body:
    {
        "user_id": 1,
        "user_comment": "Looking forward to the ride!"  # Optional
    }

    Returns:
        200: Successfully joined the ride
        400: Ride is full, user already joined, or invalid request
        404: Ride or user not found
    """
    try:
        data = request.get_json()

        if 'user_id' not in data:
            return jsonify({'error': 'Missing user_id'}), 400

        # Get ride and user
        ride = db.session.get(Ride, ride_id)
        if not ride:
            return jsonify({'error': 'Ride not found'}), 404

        user = db.session.get(User, data['user_id'])
        if not user:
            return jsonify({'error': 'User not found'}), 404

        # Check if ride is active
        if ride.status != 'active':
            return jsonify({'error': 'Cannot join a ride that is not active'}), 400

        # Check if ride is full
        if ride.is_full:
            return jsonify({'error': 'Ride is full'}), 400

        # Check if user already joined this ride
        existing = db.session.execute(
            select(UserRideData).where(
                and_(
                    UserRideData.user_id == data['user_id'],
                    UserRideData.ride_id == ride_id
                )
            )
        ).scalar_one_or_none()

        if existing:
            return jsonify({'error': 'User has already joined this ride'}), 400

        # Create user-ride association
        user_ride_data = UserRideData(
            user_id=data['user_id'],
            ride_id=ride_id,
            user_comment=data.get('user_comment')
        )

        db.session.add(user_ride_data)
        db.session.commit()

        return jsonify({
            'message': 'Successfully joined the ride',
            'ride': ride.to_dict()
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400


@ride_bp.route('/rides/<int:ride_id>/leave', methods=['POST'])
def leave_ride(ride_id):
    """
    Leave a ride as a rider.

    Args:
        ride_id: The ID of the ride to leave

    Expected JSON body:
    {
        "user_id": 1
    }

    Returns:
        200: Successfully left the ride
        404: Ride, user, or user-ride association not found
        400: Invalid request data
    """
    try:
        data = request.get_json()

        if 'user_id' not in data:
            return jsonify({'error': 'Missing user_id'}), 400

        # Get ride
        ride = db.session.get(Ride, ride_id)
        if not ride:
            return jsonify({'error': 'Ride not found'}), 404

        # Find user-ride association
        user_ride_data = db.session.execute(
            select(UserRideData).where(
                and_(
                    UserRideData.user_id == data['user_id'],
                    UserRideData.ride_id == ride_id
                )
            )
        ).scalar_one_or_none()

        if not user_ride_data:
            return jsonify({'error': 'User has not joined this ride'}), 404

        db.session.delete(user_ride_data)
        db.session.commit()

        return jsonify({
            'message': 'Successfully left the ride',
            'ride': ride.to_dict()
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400


@ride_bp.route('/rides/<int:ride_id>/riders', methods=['GET'])
def get_ride_riders(ride_id):
    """
    Get all riders for a specific ride.

    Args:
        ride_id: The ID of the ride

    Returns:
        200: List of riders with their information
        404: Ride not found
    """
    try:
        ride = db.session.get(Ride, ride_id)

        if not ride:
            return jsonify({'error': 'Ride not found'}), 404

        riders = []
        for user_ride_data in ride.riders:
            rider_info = {
                'user_id': user_ride_data.user_id,
                'name': user_ride_data.user.name,
                'email': user_ride_data.user.email,
                'comment': user_ride_data.user_comment,
                'joined_at': user_ride_data.joined_at.isoformat()
            }
            riders.append(rider_info)

        return jsonify(riders), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 400


@ride_bp.route('/rides/search', methods=['GET'])
def search_rides():
    """
    Search for rides based on various criteria.

    Query parameters:
        - pickup_address: Search in pickup address (partial match) (optional)
        - destination_address: Search in destination address (partial match) (optional)
        - date: Filter rides on a specific date (YYYY-MM-DD) (optional)
        - min_seats: Minimum available seats (optional)
        - status: Filter by status (active/completed/cancelled) (optional)

    Returns:
        200: List of rides matching the search criteria
    """
    try:
        pickup_address = request.args.get('pickup_address')
        destination_address = request.args.get('destination_address')
        date_str = request.args.get('date')
        min_seats = request.args.get('min_seats', type=int)
        status = request.args.get('status', default='active')

        query = select(Ride).where(Ride.status == status)

        # Apply search filters
        if pickup_address:
            query = query.where(Ride.pickup_address.ilike(f'%{pickup_address}%'))
        if destination_address:
            query = query.where(Ride.destination_address.ilike(f'%{destination_address}%'))
        if date_str:
            target_date = datetime.fromisoformat(date_str)
            next_day = datetime(target_date.year, target_date.month, target_date.day + 1, tzinfo=timezone.utc)
            query = query.where(
                and_(
                    Ride.pickup_time >= target_date,
                    Ride.pickup_time < next_day
                )
            )

        rides = db.session.execute(query).scalars().all()

        # Filter by minimum available seats if specified
        if min_seats:
            rides = [ride for ride in rides if ride.available_seats >= min_seats]

        return jsonify([ride.to_dict() for ride in rides]), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 400


@ride_bp.route('/rides/rider-requests', methods=['GET'])
def get_rider_requests():
    """
    Get all rider requests (rides without a driver).

    Query parameters:
        - limit: Maximum number of rides to return (optional)
        - offset: Number of rides to skip (optional)

    Returns:
        200: List of rider requests
    """
    try:
        limit = request.args.get('limit', type=int)
        offset = request.args.get('offset', type=int, default=0)

        query = select(Ride).where(
            and_(
                Ride.driver_id.is_(None),
                Ride.status == 'active'
            )
        ).offset(offset)

        if limit:
            query = query.limit(limit)

        rides = db.session.execute(query).scalars().all()

        return jsonify([ride.to_dict() for ride in rides]), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 400


@ride_bp.route('/rides/driver-posts', methods=['GET'])
def get_driver_posts():
    """
    Get all driver posts (rides with a driver).

    Query parameters:
        - limit: Maximum number of rides to return (optional)
        - offset: Number of rides to skip (optional)

    Returns:
        200: List of driver posts
    """
    try:
        limit = request.args.get('limit', type=int)
        offset = request.args.get('offset', type=int, default=0)

        query = select(Ride).where(
            and_(
                Ride.driver_id.isnot(None),
                Ride.status == 'active'
            )
        ).offset(offset)

        if limit:
            query = query.limit(limit)

        rides = db.session.execute(query).scalars().all()

        return jsonify([ride.to_dict() for ride in rides]), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 400
