from flask import Blueprint, request, jsonify
from sqlalchemy import select
from app.extensions import db
from app.models import User
from app.auth_utils import token_required, admin_required

user_bp = Blueprint('user', __name__)


@user_bp.route('/users', methods=['POST'])
def create_user():
    """
    DEPRECATED: Use /api/auth/google instead for user registration.

    This endpoint is kept for backward compatibility and testing purposes only.

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

        # Validate UCI email
        if not data['email'].endswith('@uci.edu'):
            return jsonify({'error': 'Only UC Irvine email addresses (@uci.edu) are allowed'}), 400

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
@token_required
def get_users(current_user):
    """
    Get all users. Requires authentication.

    Headers:
        Authorization: Bearer <JWT token>

    Query parameters:
        - limit: Maximum number of users to return (optional)
        - offset: Number of users to skip (optional)

    Returns:
        200: List of all users
        401: Not authenticated
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
@token_required
def get_user(current_user, user_id):
    """
    Get a specific user by ID. Requires authentication.

    Headers:
        Authorization: Bearer <JWT token>

    Args:
        user_id: The ID of the user to retrieve

    Returns:
        200: User data
        401: Not authenticated
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
@token_required
def update_user(current_user, user_id):
    """
    Update a user's information. Requires authentication.
    Users can only update their own profile unless they are system admins.

    Headers:
        Authorization: Bearer <JWT token>

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
        401: Not authenticated
        403: Forbidden - trying to update another user's profile
        404: User not found
        400: Invalid request data
    """
    try:
        # Check if user is trying to update their own profile or is an admin
        if current_user.id != user_id and not current_user.is_system_admin:
            return jsonify({'error': 'You can only update your own profile'}), 403

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
@token_required
def delete_user(current_user, user_id):
    """
    Delete a user. Requires authentication.
    Users can only delete their own account unless they are system admins.

    Headers:
        Authorization: Bearer <JWT token>

    Args:
        user_id: The ID of the user to delete

    Returns:
        204: User deleted successfully
        401: Not authenticated
        403: Forbidden - trying to delete another user's account
        404: User not found
    """
    try:
        # Check if user is trying to delete their own account or is an admin
        if current_user.id != user_id and not current_user.is_system_admin:
            return jsonify({'error': 'You can only delete your own account'}), 403

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
@token_required
def get_user_organizations(current_user, user_id):
    """
    Get all organizations a user belongs to. Requires authentication.

    Headers:
        Authorization: Bearer <JWT token>

    Args:
        user_id: The ID of the user

    Returns:
        200: List of organizations with user's role in each
        401: Not authenticated
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
@token_required
def get_user_rides(current_user, user_id):
    """
    Get all rides a user has joined. Requires authentication.

    Headers:
        Authorization: Bearer <JWT token>

    Args:
        user_id: The ID of the user

    Returns:
        200: List of rides the user has joined
        401: Not authenticated
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
@token_required
def get_user_driver_data(current_user, user_id):
    """
    Get driver data for a specific user. Requires authentication.

    Headers:
        Authorization: Bearer <JWT token>

    Args:
        user_id: The ID of the user

    Returns:
        200: Driver data if exists
        401: Not authenticated
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
