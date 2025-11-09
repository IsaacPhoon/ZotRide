from flask import Blueprint, request, jsonify
from sqlalchemy import select, and_
from datetime import datetime, timezone
from app.extensions import db
from app.models import Ride, DriverData, User, UserRideData, Organization
from app.auth_utils import token_required

ride_bp = Blueprint('ride', __name__)


@ride_bp.route('/rides', methods=['POST'])
@token_required
def create_ride(current_user):
    """
    Create a new ride (either a driver post or rider request).

    IMPORTANT: If driver_id is not provided (rider request), the current user
    is automatically added as a rider to the newly created ride.

    Authentication: Required
    Headers:
        Authorization: Bearer <JWT token>

    Expected JSON body:
    {
        "pickup_address": "123 Main St",
        "pickup_time": "2025-01-15T10:00:00",
        "destination_address": "456 Elm St",
        "max_riders": 4,  # Optional - defaults to 4
        "price_option": "free",  # Options: 'free', 'gas', 'gas with fee'
        "driver_id": 1,  # Optional - if provided, this is a driver post; if null, current user is added as rider
        "organization_id": 1,  # Optional - if this ride is for an organization
        "driver_comment": "I prefer quiet passengers",  # Optional - only for driver posts
        "rider_comment": "I am bringing snacks!"  # Optional - only for rider requests
    }

    Returns:
        201: Ride created successfully (with current user added as rider if no driver_id)
        400: Invalid request data or missing required fields
        401: Not authenticated
        404: Driver or organization not found
        403: Driver is not approved
    """
    try:
        data = request.get_json()

        # Validate required fields
        required_fields = ['pickup_address', 'pickup_time', 'destination_address', 'price_option']
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
            max_riders=data.get('max_riders', 4),  # Default to 4 if not provided
            price_option=data['price_option'],
            driver_id=data.get('driver_id'),
            organization_id=data.get('organization_id'),
            driver_comment=data.get('driver_comment')
        )

        db.session.add(ride)
        db.session.commit()

        # If no driver_id, this is a rider request - automatically add current user as a rider
        if not data.get('driver_id'):
            user_ride_data = UserRideData(
                user_id=current_user.id,
                ride_id=ride.id,
                user_comment=data.get('rider_comment', None)
            )
            db.session.add(user_ride_data)
            db.session.commit()

        return jsonify(ride.to_dict()), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400


@ride_bp.route('/rides', methods=['GET'])
@token_required
def get_rides(current_user):
    """
    Get all rides with optional filtering.

    Authentication: Required
    Headers:
        Authorization: Bearer <JWT token>

    Query parameters:
        - status: Filter by status (active/completed) (optional)
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
        else:
            # Exclude organization rides if no organization_id filter is provided
            query = query.where(Ride.organization_id.is_(None))

        # Apply pagination
        query = query.offset(offset)
        if limit:
            query = query.limit(limit)

        rides = db.session.execute(query).scalars().all()

        return jsonify([ride.to_dict() for ride in rides]), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 400


@ride_bp.route('/rides/<int:ride_id>', methods=['GET'])
@token_required
def get_ride(ride_id, current_user):
    """
    Get a specific ride by ID.

    Authentication: Required
    Headers:
        Authorization: Bearer <JWT token>

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
@token_required
def update_ride(ride_id, current_user):
    """
    Update a ride's information.

    Authentication: Required
    Headers:
        Authorization: Bearer <JWT token>

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
        403: Driver is not approved, ride is completed, or unauthorized
        400: Invalid request data
    """
    try:
        ride = db.session.get(Ride, ride_id)

        if not ride:
            return jsonify({'error': 'Ride not found'}), 404

        data = request.get_json()

        # Prevent updating most fields if ride is completed
        if ride.status == 'completed':
            # Only allow updating driver_comment for completed rides
            if any(key in data for key in ['pickup_address', 'pickup_time', 'destination_address', 
                                            'max_riders', 'price_option', 'driver_id']):
                return jsonify({'error': 'Cannot update ride details after completion. Only driver_comment can be updated.'}), 403

            if 'driver_comment' in data:
                ride.driver_comment = data['driver_comment']
        else:
            # Update allowed fields for active rides
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
@token_required
def delete_ride(ride_id, current_user):
    """
    Delete a ride.

    Authentication: Required
    Headers:
        Authorization: Bearer <JWT token>

    Args:
        ride_id: The ID of the ride to delete

    Returns:
        204: Ride deleted successfully
        404: Ride not found
        403: Unauthorized - only rider or driver can delete if there are no other riders and drivers

    Note: Deleting a ride will also delete all associated reviews and rider associations.
    """
    try:
        ride = db.session.get(Ride, ride_id)

        if not ride:
            return jsonify({'error': 'Ride not found'}), 404

        authorized_to_delete: bool = False
        if current_user.id == ride.driver_id and len(ride.riders) == 0: # if current_user is driver and there's no riders
            authorized_to_delete = True
        elif len(ride.riders) == 1 and ride.riders[0].user_id == current_user.id: # if current_user is the only rider and there's no driver
            authorized_to_delete = True

        if not authorized_to_delete:
            return jsonify({'error': 'Unauthorized - only rider or driver can delete if there are no other riders or drivers'}), 403

        db.session.delete(ride)
        db.session.commit()

        return '', 204

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400


@ride_bp.route('/rides/<int:ride_id>/complete', methods=['POST'])
@token_required
def complete_ride(ride_id, current_user):
    """
    Mark a ride as completed. This enables riders to review the driver.

    Authentication: Required
    Headers:
        Authorization: Bearer <JWT token>

    Args:
        ride_id: The ID of the ride to complete

    Returns:
        200: Ride marked as completed
        404: Ride not found or driver not found
        403: Unauthorized - only the assigned driver can complete or ride already completed
        400: Invalid request data or ride has no driver
    """
    try:
        ride = db.session.get(Ride, ride_id)

        if not ride:
            return jsonify({'error': 'Ride not found'}), 404

        # Verify ride has a driver
        if not ride.driver_id:
            return jsonify({'error': 'Cannot complete a ride without a driver'}), 400

        # Get driver data to verify the current user is the driver
        driver = db.session.get(DriverData, ride.driver_id)
        if not driver:
            return jsonify({'error': 'Driver not found'}), 404

        # Verify the current user is the assigned driver
        if driver.user_id != current_user.id:
            return jsonify({'error': 'Only the assigned driver can complete this ride'}), 403

        # Check if already completed
        if ride.status == 'completed':
            return jsonify({'error': 'Ride is already completed'}), 403

        # Mark ride as completed
        ride.status = 'completed'
        db.session.commit()

        return jsonify({
            'message': 'Ride completed successfully. Riders can now leave reviews.',
            'ride': ride.to_dict()
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400


@ride_bp.route('/rides/<int:ride_id>/join_rider', methods=['POST'])
@token_required
def join_ride_rider(ride_id, current_user):
    """
    Join a ride as a rider.

    Authentication: Required
    Headers:
        Authorization: Bearer <JWT token>

    Args:
        ride_id: The ID of the ride to join

    Expected JSON body:
    {
        "user_comment": "Looking forward to the ride!"  # Optional
    }

    Returns:
        200: Successfully joined the ride
        400: Ride is full, user already joined, or invalid request
        404: Ride not found
        403: Driver cannot join their own ride
    """
    try:
        data = request.get_json() or {}

        # Get ride
        ride = db.session.get(Ride, ride_id)
        if not ride:
            return jsonify({'error': 'Ride not found'}), 404

        # Check if ride is active
        if ride.status != 'active':
            return jsonify({'error': 'Cannot join a ride that is not active'}), 400

        # Check if ride is full
        if ride.is_full:
            return jsonify({'error': 'Ride is full'}), 400

        # Check if user is the driver (prevent driver from joining their own ride)
        if ride.driver_id:
            driver = db.session.get(DriverData, ride.driver_id)
            if driver and driver.user_id == current_user.id:
                return jsonify({'error': 'Driver cannot join their own ride as a rider'}), 403

        # Check if user already joined this ride
        existing = db.session.execute(
            select(UserRideData).where(
                and_(
                    UserRideData.user_id == current_user.id,
                    UserRideData.ride_id == ride_id
                )
            )
        ).scalar_one_or_none()

        if existing:
            return jsonify({'error': 'User has already joined this ride'}), 400

        # Create user-ride association
        user_ride_data = UserRideData(
            user_id=current_user.id,
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


@ride_bp.route('/rides/<int:ride_id>/join_driver', methods=['POST'])
@token_required
def join_ride_driver(ride_id, current_user):
    """
    Join a ride as a driver (accept a rider request).

    Authentication: Required
    Headers:
        Authorization: Bearer <JWT token>

    Args:
        ride_id: The ID of the ride to join

    Expected JSON body:
    {
        "driver_comment": "Looking forward to the ride!"  # Optional
    }

    Returns:
        200: Successfully joined the ride as driver
        400: Ride has driver already, user is not an approved driver, or invalid request
        404: Ride not found
        403: Cannot accept your own ride request as a driver
    """
    try:
        data = request.get_json() or {}

        # Get ride
        ride = db.session.get(Ride, ride_id)
        if not ride:
            return jsonify({'error': 'Ride not found'}), 404

        # Check if ride is active
        if ride.status != 'active':
            return jsonify({'error': 'Cannot join a ride that is not active'}), 400

        # Check if ride already has a driver
        if ride.driver_id is not None:
            return jsonify({'error': 'Ride already has a driver'}), 400

        # Check if user is an approved driver
        driver_data = db.session.execute(
            select(DriverData).where(DriverData.user_id == current_user.id)
        ).scalar_one_or_none()

        if not driver_data:
            return jsonify({'error': 'User is not registered as a driver'}), 400
        
        if not driver_data.is_approved:
            return jsonify({'error': 'Driver is not approved'}), 403

        # Check if user is already a rider on this ride (the original requester)
        existing_rider = db.session.execute(
            select(UserRideData).where(
                and_(
                    UserRideData.user_id == current_user.id,
                    UserRideData.ride_id == ride_id
                )
            )
        ).scalar_one_or_none()

        if existing_rider:
            return jsonify({'error': 'Cannot accept your own ride request as a driver'}), 403

        # Assign the driver to the ride
        ride.driver_id = driver_data.id

        # Add driver comment if provided
        if 'driver_comment' in data:
            ride.driver_comment = data['driver_comment']

        db.session.commit()

        return jsonify({
            'message': 'Successfully joined the ride as driver',
            'ride': ride.to_dict()
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400


@ride_bp.route('/rides/<int:ride_id>/leave', methods=['POST'])
@token_required
def leave_ride(ride_id, current_user):
    """
    Leave a ride as a rider.

    Authentication: Required
    Headers:
        Authorization: Bearer <JWT token>

    Args:
        ride_id: The ID of the ride to leave

    Returns:
        200: Successfully left the ride
        404: Ride or user-ride association not found
        400: Invalid request data
    """
    try:
        # Get ride
        ride = db.session.get(Ride, ride_id)
        if not ride:
            return jsonify({'error': 'Ride not found'}), 404

        # Find user-ride association
        user_ride_data = db.session.execute(
            select(UserRideData).where(
                and_(
                    UserRideData.user_id == current_user.id,
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
@token_required
def get_ride_riders(ride_id, current_user):
    """
    Get all riders for a specific ride.

    Authentication: Required
    Headers:
        Authorization: Bearer <JWT token>

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
@token_required
def search_rides(current_user):
    """
    Search for rides based on various criteria.

    Authentication: Required
    Headers:
        Authorization: Bearer <JWT token>

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
@token_required
def get_rider_requests(current_user):
    """
    Get all rider requests (rides without a driver).

    Authentication: Required
    Headers:
        Authorization: Bearer <JWT token>

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
@token_required
def get_driver_posts(current_user):
    """
    Get all driver posts (rides with a driver).

    Authentication: Required
    Headers:
        Authorization: Bearer <JWT token>

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
