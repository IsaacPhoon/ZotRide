from flask import Blueprint, request, jsonify
from sqlalchemy import select
from app.extensions import db
from app.models import User

user_bp = Blueprint('user', __name__)


@user_bp.route('/users', methods=['POST'])
def create_user():
    """
    Create a new user.

    Expected JSON body:
    {
        "email": "user@example.edu",
        "name": "John Doe",
        "gender": 0,  # 0: Male, 1: Female, 2: Other
        "preferred_contact": "email or phone",
        "is_system_admin": false  # Optional, defaults to False
    }

    Returns:
        201: User created successfully with user data
        400: Invalid request data or missing required fields
        409: User with this email already exists
    """
    try:
        data = request.get_json()

        # Validate required fields
        required_fields = ['email', 'name', 'gender', 'preferred_contact']
        if not all(field in data for field in required_fields):
            return jsonify({'error': 'Missing required fields'}), 400

        # Check if user already exists
        existing_user = db.session.execute(
            select(User).where(User.email == data['email'])
        ).scalar_one_or_none()

        if existing_user:
            return jsonify({'error': 'User with this email already exists'}), 409

        # Create new user
        user = User(
            email=data['email'],
            name=data['name'],
            gender=data['gender'],
            preferred_contact=data['preferred_contact'],
            is_system_admin=data.get('is_system_admin', False)
        )

        db.session.add(user)
        db.session.commit()

        return jsonify(user.to_dict()), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400


@user_bp.route('/users', methods=['GET'])
def get_users():
    """
    Get all users.

    Query parameters:
        - limit: Maximum number of users to return (optional)
        - offset: Number of users to skip (optional)

    Returns:
        200: List of all users
    """
    try:
        limit = request.args.get('limit', type=int)
        offset = request.args.get('offset', type=int, default=0)

        query = select(User).offset(offset)
        if limit:
            query = query.limit(limit)

        users = db.session.execute(query).scalars().all()

        return jsonify([user.to_dict() for user in users]), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 400


@user_bp.route('/users/<int:user_id>', methods=['GET'])
def get_user(user_id):
    """
    Get a specific user by ID.

    Args:
        user_id: The ID of the user to retrieve

    Returns:
        200: User data
        404: User not found
    """
    try:
        user = db.session.get(User, user_id)

        if not user:
            return jsonify({'error': 'User not found'}), 404

        return jsonify(user.to_dict()), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 400


@user_bp.route('/users/<int:user_id>', methods=['PUT'])
def update_user(user_id):
    """
    Update a user's information.

    Args:
        user_id: The ID of the user to update

    Expected JSON body (all fields optional):
    {
        "name": "New Name",
        "gender": 1,
        "preferred_contact": "new contact info"
    }

    Returns:
        200: User updated successfully with updated user data
        404: User not found
        400: Invalid request data
    """
    try:
        user = db.session.get(User, user_id)

        if not user:
            return jsonify({'error': 'User not found'}), 404

        data = request.get_json()

        # Update allowed fields
        if 'name' in data:
            user.name = data['name']
        if 'gender' in data:
            user.gender = data['gender']
        if 'preferred_contact' in data:
            user.preferred_contact = data['preferred_contact']

        db.session.commit()

        return jsonify(user.to_dict()), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400


@user_bp.route('/users/<int:user_id>', methods=['DELETE'])
def delete_user(user_id):
    """
    Delete a user.

    Args:
        user_id: The ID of the user to delete

    Returns:
        204: User deleted successfully
        404: User not found
    """
    try:
        user = db.session.get(User, user_id)

        if not user:
            return jsonify({'error': 'User not found'}), 404

        db.session.delete(user)
        db.session.commit()

        return '', 204

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400


@user_bp.route('/users/<int:user_id>/organizations', methods=['GET'])
def get_user_organizations(user_id):
    """
    Get all organizations a user belongs to.

    Args:
        user_id: The ID of the user

    Returns:
        200: List of organizations with user's role in each
        404: User not found
    """
    try:
        user = db.session.get(User, user_id)

        if not user:
            return jsonify({'error': 'User not found'}), 404

        organizations = []
        for user_org_data in user.organizations:
            org_info = {
                'organization_id': user_org_data.organization_id,
                'organization_name': user_org_data.organization.name,
                'is_owner': user_org_data.is_owner,
                'is_admin': user_org_data.is_admin,
                'is_driver': user_org_data.is_driver
            }
            organizations.append(org_info)

        return jsonify(organizations), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 400


@user_bp.route('/users/<int:user_id>/rides', methods=['GET'])
def get_user_rides(user_id):
    """
    Get all rides a user has joined.

    Args:
        user_id: The ID of the user

    Returns:
        200: List of rides the user has joined
        404: User not found
    """
    try:
        user = db.session.get(User, user_id)

        if not user:
            return jsonify({'error': 'User not found'}), 404

        rides = []
        for user_ride_data in user.taken_rides:
            ride_info = user_ride_data.ride.to_dict()
            ride_info['user_comment'] = user_ride_data.user_comment
            ride_info['joined_at'] = user_ride_data.joined_at.isoformat()
            rides.append(ride_info)

        return jsonify(rides), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 400


@user_bp.route('/users/<int:user_id>/driver-data', methods=['GET'])
def get_user_driver_data(user_id):
    """
    Get driver data for a specific user.

    Args:
        user_id: The ID of the user

    Returns:
        200: Driver data if exists
        404: User not found or user is not a driver
    """
    try:
        user = db.session.get(User, user_id)

        if not user:
            return jsonify({'error': 'User not found'}), 404

        if not user.driver_data:
            return jsonify({'error': 'User is not a driver'}), 404

        return jsonify(user.driver_data.to_dict()), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 400
