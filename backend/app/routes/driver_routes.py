from flask import Blueprint, request, jsonify
from sqlalchemy import select
from app.extensions import db
from app.models import DriverData, User

driver_bp = Blueprint('driver', __name__)


@driver_bp.route('/drivers', methods=['POST'])
def create_driver_data():
    """
    Create driver data for a user (register as a driver).

    Expected JSON body:
    {
        "user_id": 1,
        "license_image": "https://cloudinary.com/...",
        "vehicle_data": "2020 Honda Accord",
        "license_plate": "ABC1234",
        "is_approved": false  # Optional, defaults to False
    }

    Returns:
        201: Driver data created successfully
        400: Invalid request data or missing required fields
        404: User not found
        409: Driver data already exists for this user
    """
    try:
        data = request.get_json()

        # Validate required fields
        required_fields = ['user_id', 'license_image', 'vehicle_data', 'license_plate']
        if not all(field in data for field in required_fields):
            return jsonify({'error': 'Missing required fields'}), 400

        # Check if user exists
        user = db.session.get(User, data['user_id'])
        if not user:
            return jsonify({'error': 'User not found'}), 404

        # Check if driver data already exists for this user
        existing_driver = db.session.execute(
            select(DriverData).where(DriverData.user_id == data['user_id'])
        ).scalar_one_or_none()

        if existing_driver:
            return jsonify({'error': 'Driver data already exists for this user'}), 409

        # Create new driver data
        driver_data = DriverData(
            user_id=data['user_id'],
            license_image=data['license_image'],
            vehicle_data=data['vehicle_data'],
            license_plate=data['license_plate'],
            is_approved=data.get('is_approved', False)
        )

        db.session.add(driver_data)
        db.session.commit()

        return jsonify(driver_data.to_dict()), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400


@driver_bp.route('/drivers', methods=['GET'])
def get_all_drivers():
    """
    Get all drivers.

    Query parameters:
        - approved: Filter by approval status (true/false) (optional)
        - limit: Maximum number of drivers to return (optional)
        - offset: Number of drivers to skip (optional)

    Returns:
        200: List of all drivers
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
def get_driver(driver_id):
    """
    Get a specific driver by ID.

    Args:
        driver_id: The ID of the driver data to retrieve

    Returns:
        200: Driver data
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
def update_driver(driver_id):
    """
    Update driver information.

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
        404: Driver not found
        400: Invalid request data
    """
    try:
        driver = db.session.get(DriverData, driver_id)

        if not driver:
            return jsonify({'error': 'Driver not found'}), 404

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
def delete_driver(driver_id):
    """
    Delete driver data.

    Args:
        driver_id: The ID of the driver data to delete

    Returns:
        204: Driver data deleted successfully
        404: Driver not found
        400: Cannot delete driver with active rides
    """
    try:
        driver = db.session.get(DriverData, driver_id)

        if not driver:
            return jsonify({'error': 'Driver not found'}), 404

        # Check if driver has active rides
        if driver.hosted_rides:
            return jsonify({
                'error': 'Cannot delete driver with existing rides. Please delete all rides first.'
            }), 400

        db.session.delete(driver)
        db.session.commit()

        return '', 204

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400


@driver_bp.route('/drivers/<int:driver_id>/approve', methods=['POST'])
def approve_driver(driver_id):
    """
    Approve or reject a driver (admin only endpoint).

    Args:
        driver_id: The ID of the driver data to approve/reject

    Expected JSON body:
    {
        "approved": true,
        "admin_user_id": 1  # ID of the system admin performing this action
    }

    Returns:
        200: Driver approval status updated successfully
        403: User is not a system admin
        404: Driver or admin user not found
        400: Invalid request data
    """
    try:
        data = request.get_json()

        if 'approved' not in data or 'admin_user_id' not in data:
            return jsonify({'error': 'Missing required fields'}), 400

        # Check if admin user exists and is a system admin
        admin_user = db.session.get(User, data['admin_user_id'])
        if not admin_user:
            return jsonify({'error': 'Admin user not found'}), 404

        if not admin_user.is_system_admin:
            return jsonify({'error': 'User is not authorized to approve drivers'}), 403

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
def get_driver_rides(driver_id):
    """
    Get all rides hosted by a specific driver.

    Args:
        driver_id: The ID of the driver

    Query parameters:
        - status: Filter by ride status (active/completed/cancelled) (optional)

    Returns:
        200: List of rides hosted by the driver
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
def get_pending_drivers():
    """
    Get all drivers pending approval (admin only endpoint).

    Query parameters:
        - admin_user_id: ID of the system admin requesting this data

    Returns:
        200: List of drivers pending approval
        403: User is not a system admin
        404: Admin user not found
        400: Missing admin_user_id parameter
    """
    try:
        admin_user_id = request.args.get('admin_user_id', type=int)

        if not admin_user_id:
            return jsonify({'error': 'Missing admin_user_id parameter'}), 400

        # Check if admin user exists and is a system admin
        admin_user = db.session.get(User, admin_user_id)
        if not admin_user:
            return jsonify({'error': 'Admin user not found'}), 404

        if not admin_user.is_system_admin:
            return jsonify({'error': 'User is not authorized to view pending drivers'}), 403

        # Get all pending drivers
        pending_drivers = db.session.execute(
            select(DriverData).where(DriverData.is_approved == False)
        ).scalars().all()

        return jsonify([driver.to_dict() for driver in pending_drivers]), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 400
