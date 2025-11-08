from flask import Blueprint, request, jsonify
from sqlalchemy import select
from app.extensions import db
from app.models import DriverData, User
from app.auth_utils import token_required, admin_required

driver_bp = Blueprint('driver', __name__)


@driver_bp.route('/drivers', methods=['POST'])
@token_required
def create_driver_data(current_user):
    """
    Create driver data for a user (register as a driver). Requires authentication.
    Users can only create driver data for themselves.

    Headers:
        Authorization: Bearer <JWT token>

    Expected JSON body:
    {
        "license_image": "https://cloudinary.com/...",
        "vehicle_data": "2020 Honda Accord",
        "license_plate": "ABC1234"
    }

    Returns:
        201: Driver data created successfully
        400: Invalid request data or missing required fields
        401: Not authenticated
        403: Trying to create driver data for another user
        409: Driver data already exists for this user
    """
    try:
        data = request.get_json()

        # Validate required fields
        required_fields = ['license_image', 'vehicle_data', 'license_plate']
        if not all(field in data for field in required_fields):
            return jsonify({'error': 'Missing required fields'}), 400

        # Check if driver data already exists for this user
        existing_driver = db.session.execute(
            select(DriverData).where(DriverData.user_id == current_user.id)
        ).scalar_one_or_none()

        if existing_driver:
            return jsonify({'error': 'Driver data already exists for this user'}), 409

        # Create new driver data (always starts as unapproved)
        driver_data = DriverData(
            user_id=current_user.id,
            license_image=data['license_image'],
            vehicle_data=data['vehicle_data'],
            license_plate=data['license_plate'],
            is_approved=False
        )

        db.session.add(driver_data)
        db.session.commit()

        return jsonify(driver_data.to_dict()), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400


@driver_bp.route('/drivers', methods=['GET'])
@token_required
def get_all_drivers(current_user):
    """
    Get all drivers. Requires authentication.

    Headers:
        Authorization: Bearer <JWT token>

    Query parameters:
        - approved: Filter by approval status (true/false) (optional)
        - limit: Maximum number of drivers to return (optional)
        - offset: Number of drivers to skip (optional)

    Returns:
        200: List of all drivers
        401: Not authenticated
    """
    try:
        approved = request.args.get('approved', type=lambda v: v.lower() == 'true')
        limit = request.args.get('limit', type=int)
        offset = request.args.get('offset', type=int, default=0)

        query = select(DriverData)

        if approved is not None:
            query = query.where(DriverData.is_approved == approved)

        query = query.offset(offset)
        if limit:
            query = query.limit(limit)

        drivers = db.session.execute(query).scalars().all()

        return jsonify([driver.to_dict() for driver in drivers]), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 400


@driver_bp.route('/drivers/<int:driver_id>', methods=['GET'])
@token_required
def get_driver(current_user, driver_id):
    """
    Get a specific driver by ID. Requires authentication.

    Headers:
        Authorization: Bearer <JWT token>

    Args:
        driver_id: The ID of the driver data to retrieve

    Returns:
        200: Driver data
        401: Not authenticated
        404: Driver not found
    """
    try:
        driver = db.session.get(DriverData, driver_id)

        if not driver:
            return jsonify({'error': 'Driver not found'}), 404

        return jsonify(driver.to_dict()), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 400


@driver_bp.route('/drivers/<int:driver_id>', methods=['PUT'])
@token_required
def update_driver(current_user, driver_id):
    """
    Update driver information. Requires authentication.
    Drivers can only update their own information unless they are system admins.

    Headers:
        Authorization: Bearer <JWT token>

    Args:
        driver_id: The ID of the driver data to update

    Expected JSON body (all fields optional):
    {
        "license_image": "https://cloudinary.com/...",
        "vehicle_data": "2021 Honda Accord",
        "license_plate": "XYZ5678"
    }

    Note: Approval status can only be changed via the approve endpoint.

    Returns:
        200: Driver data updated successfully
        401: Not authenticated
        403: Forbidden - trying to update another driver's data
        404: Driver not found
        400: Invalid request data
    """
    try:
        driver = db.session.get(DriverData, driver_id)

        if not driver:
            return jsonify({'error': 'Driver not found'}), 404

        # Check if user is updating their own driver data or is an admin
        if driver.user_id != current_user.id and not current_user.is_system_admin:
            return jsonify({'error': 'You can only update your own driver information'}), 403

        data = request.get_json()

        # Update allowed fields
        if 'license_image' in data:
            driver.license_image = data['license_image']
        if 'vehicle_data' in data:
            driver.vehicle_data = data['vehicle_data']
        if 'license_plate' in data:
            driver.license_plate = data['license_plate']

        db.session.commit()

        return jsonify(driver.to_dict()), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400


@driver_bp.route('/drivers/<int:driver_id>', methods=['DELETE'])
@token_required
def delete_driver(current_user, driver_id):
    """
    Delete driver data. Requires authentication.
    Drivers can only delete their own data unless they are system admins.

    Headers:
        Authorization: Bearer <JWT token>

    Args:
        driver_id: The ID of the driver data to delete

    Returns:
        204: Driver data deleted successfully
        401: Not authenticated
        403: Forbidden - trying to delete another driver's data
        404: Driver not found
        400: Cannot delete driver with active rides

    Note: Deleting a driver will also delete all their reviews (cascade delete).
    """
    try:
        driver = db.session.get(DriverData, driver_id)

        if not driver:
            return jsonify({'error': 'Driver not found'}), 404

        # Check if user is deleting their own driver data or is an admin
        if driver.user_id != current_user.id and not current_user.is_system_admin:
            return jsonify({'error': 'You can only delete your own driver information'}), 403

        # Check if driver has active rides
        if driver.hosted_rides:
            return jsonify({
                'error': 'Cannot delete driver with existing rides. Please delete all rides first.'
            }), 400

        # Reviews will be cascade deleted automatically
        db.session.delete(driver)
        db.session.commit()

        return '', 204

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400


@driver_bp.route('/drivers/<int:driver_id>/approve', methods=['POST'])
@token_required
@admin_required
def approve_driver(current_user, driver_id):
    """
    Approve or reject a driver (admin only endpoint). Requires admin authentication.

    Headers:
        Authorization: Bearer <JWT token>

    Args:
        driver_id: The ID of the driver data to approve/reject

    Expected JSON body:
    {
        "approved": true
    }

    Returns:
        200: Driver approval status updated successfully
        401: Not authenticated
        403: User is not a system admin
        404: Driver not found
        400: Invalid request data
    """
    try:
        data = request.get_json()

        if 'approved' not in data:
            return jsonify({'error': 'Missing required field: approved'}), 400

        # Get driver data
        driver = db.session.get(DriverData, driver_id)
        if not driver:
            return jsonify({'error': 'Driver not found'}), 404

        # Update approval status
        driver.set_as_approved(data['approved'])
        db.session.commit()

        return jsonify({
            'message': f"Driver {'approved' if data['approved'] else 'rejected'} successfully",
            'driver': driver.to_dict()
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400


@driver_bp.route('/drivers/<int:driver_id>/rides', methods=['GET'])
@token_required
def get_driver_rides(current_user, driver_id):
    """
    Get all rides hosted by a specific driver. Requires authentication.

    Headers:
        Authorization: Bearer <JWT token>

    Args:
        driver_id: The ID of the driver

    Query parameters:
        - status: Filter by ride status (active/completed/cancelled) (optional)

    Returns:
        200: List of rides hosted by the driver
        401: Not authenticated
        404: Driver not found
    """
    try:
        driver = db.session.get(DriverData, driver_id)

        if not driver:
            return jsonify({'error': 'Driver not found'}), 404

        status_filter = request.args.get('status')

        rides = driver.hosted_rides
        if status_filter:
            rides = [ride for ride in rides if ride.status == status_filter]

        return jsonify([ride.to_dict() for ride in rides]), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 400


@driver_bp.route('/drivers/pending-approval', methods=['GET'])
@token_required
@admin_required
def get_pending_drivers(current_user):
    """
    Get all drivers pending approval (admin only endpoint). Requires admin authentication.

    Headers:
        Authorization: Bearer <JWT token>

    Returns:
        200: List of drivers pending approval
        401: Not authenticated
        403: User is not a system admin
    """
    try:
        # Get all pending drivers
        pending_drivers = db.session.execute(
            select(DriverData).where(DriverData.is_approved.is_(False))
        ).scalars().all()

        return jsonify([driver.to_dict() for driver in pending_drivers]), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 400
