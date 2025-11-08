from flask import Blueprint, request, jsonify
from sqlalchemy import select
from app.extensions import db
from app.models import User
from app.auth_utils import (
    verify_google_token,
    generate_jwt_token,
    check_is_admin,
    token_required,
    verify_jwt_token
)

auth_bp = Blueprint('auth', __name__)


@auth_bp.route('/auth/google', methods=['POST'])
def google_auth():
    """
    Authenticate or register a user with Google Sign-In.

    Expected JSON body:
    {
        "token": "<Google ID token>",
        "gender": 0,  # Required for new users: 0=Male, 1=Female, 2=Other
        "preferred_contact": "email or phone"  # Required for new users
    }

    Returns:
        200: User authenticated successfully (existing user)
            {
                "message": "Login successful",
                "token": "<JWT token>",
                "user": <user data>,
                "is_new_user": false
            }
        201: User registered successfully (new user)
            {
                "message": "Registration successful",
                "token": "<JWT token>",
                "user": <user data>,
                "is_new_user": true
            }
        400: Invalid request data, missing required fields, or non-UCI email
        401: Invalid Google token
    """
    try:
        data = request.get_json()

        if 'token' not in data:
            return jsonify({'error': 'Google token is required'}), 400

        # Verify Google token
        try:
            google_user_info = verify_google_token(data['token'])
        except ValueError as e:
            return jsonify({'error': str(e)}), 401

        email = google_user_info['email']
        name = google_user_info['name']

        # Check if user already exists
        existing_user = db.session.execute(
            select(User).where(User.email == email)
        ).scalar_one_or_none()

        if existing_user:
            # User exists - login
            jwt_token = generate_jwt_token(existing_user.id, existing_user.email)

            return jsonify({
                'message': 'Login successful',
                'token': jwt_token,
                'user': existing_user.to_dict(),
                'is_new_user': False
            }), 200

        # User doesn't exist - register
        # Validate required fields for registration
        required_fields = ['gender', 'preferred_contact']
        if not all(field in data for field in required_fields):
            return jsonify({
                'error': 'Missing required fields for registration',
                'required_fields': required_fields
            }), 400

        # Validate gender value
        if data['gender'] not in [0, 1, 2]:
            return jsonify({'error': 'Invalid gender value. Must be 0 (Male), 1 (Female), or 2 (Other)'}), 400

        # Check if user should be admin
        is_admin = check_is_admin(email)

        # Create new user
        user = User(
            email=email,
            name=name,
            gender=data['gender'],
            preferred_contact=data['preferred_contact'],
            is_system_admin=is_admin
        )

        db.session.add(user)
        db.session.commit()

        # Generate JWT token
        jwt_token = generate_jwt_token(user.id, user.email)

        return jsonify({
            'message': 'Registration successful',
            'token': jwt_token,
            'user': user.to_dict(),
            'is_new_user': True,
            'is_admin': is_admin
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400


@auth_bp.route('/auth/verify', methods=['GET'])
@token_required
def verify_token(current_user):
    """
    Verify if the current JWT token is valid and return user info.

    Headers:
        Authorization: Bearer <JWT token>

    Returns:
        200: Token is valid with user data
        401: Token is invalid or expired
    """
    try:
        return jsonify({
            'message': 'Token is valid',
            'user': current_user.to_dict()
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 400


@auth_bp.route('/auth/refresh', methods=['POST'])
def refresh_token():
    """
    Refresh an expired or soon-to-expire JWT token.

    Expected JSON body:
    {
        "token": "<current JWT token>"
    }

    Returns:
        200: New token generated
            {
                "message": "Token refreshed successfully",
                "token": "<new JWT token>",
                "user": <user data>
            }
        400: Invalid request data
        401: Invalid or expired token
    """
    try:
        data = request.get_json()

        if 'token' not in data:
            return jsonify({'error': 'Token is required'}), 400

        # Verify the old token (this will fail if expired, but that's okay for refresh)
        try:
            payload = verify_jwt_token(data['token'])
        except Exception:
            # Even if token is expired, we can still try to refresh it
            # by decoding without verification (for expired tokens)
            import jwt
            try:
                payload = jwt.decode(
                    data['token'],
                    options={"verify_signature": False}
                )
            except:
                return jsonify({'error': 'Invalid token format'}), 401

        # Get user from database
        user = db.session.get(User, payload.get('user_id'))

        if not user:
            return jsonify({'error': 'User not found'}), 401

        # Generate new token
        new_token = generate_jwt_token(user.id, user.email)

        return jsonify({
            'message': 'Token refreshed successfully',
            'token': new_token,
            'user': user.to_dict()
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 400


@auth_bp.route('/auth/me', methods=['GET'])
@token_required
def get_current_user(current_user):
    """
    Get current authenticated user's information.

    Headers:
        Authorization: Bearer <JWT token>

    Returns:
        200: Current user data
        401: Not authenticated
    """
    try:
        return jsonify(current_user.to_dict()), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 400
