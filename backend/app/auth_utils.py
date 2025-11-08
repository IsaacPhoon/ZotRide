import jwt
from datetime import datetime, timedelta, timezone
from functools import wraps
from flask import request, jsonify, current_app
from google.auth.transport import requests as google_requests
from google.oauth2 import id_token
from sqlalchemy import select
from app.extensions import db
from app.models import User

# Hardcoded list of admin emails
ADMIN_EMAILS = ['kennl21@uci.edu', 'bdkeenan@uci.edu']


def verify_google_token(token: str) -> dict:
    """
    Verify Google ID token and return user info.

    Args:
        token: Google ID token from frontend

    Returns:
        dict: User info from Google (email, name, etc.)

    Raises:
        ValueError: If token is invalid
    """
    try:
        # Verify the token
        idinfo = id_token.verify_oauth2_token(
            token,
            google_requests.Request(),
            current_app.config['GOOGLE_CLIENT_ID']
        )

        # Verify the issuer
        if idinfo['iss'] not in ['accounts.google.com', 'https://accounts.google.com']:
            raise ValueError('Wrong issuer.')

        # Check if email is from uci.edu domain
        email = idinfo.get('email', '')
        if not email.endswith('@uci.edu'):
            raise ValueError('Only UC Irvine email addresses (@uci.edu) are allowed.')

        return {
            'email': email,
            'name': idinfo.get('name', ''),
            'google_id': idinfo.get('sub', '')
        }

    except Exception as e:
        raise ValueError(f'Invalid Google token: {str(e)}')


def generate_jwt_token(user_id: int, email: str) -> str:
    """
    Generate JWT access token for authenticated user.

    Args:
        user_id: User's database ID
        email: User's email address

    Returns:
        str: JWT token
    """
    payload = {
        'user_id': user_id,
        'email': email,
        'exp': datetime.now(timezone.utc) + timedelta(days=7),  # Token expires in 7 days
        'iat': datetime.now(timezone.utc)
    }

    token = jwt.encode(
        payload,
        current_app.config['SECRET_KEY'],
        algorithm='HS256'
    )

    return token


def verify_jwt_token(token: str) -> dict:
    """
    Verify JWT token and return payload.

    Args:
        token: JWT token

    Returns:
        dict: Token payload containing user_id and email

    Raises:
        jwt.InvalidTokenError: If token is invalid or expired
    """
    try:
        payload = jwt.decode(
            token,
            current_app.config['SECRET_KEY'],
            algorithms=['HS256']
        )
        return payload
    except jwt.ExpiredSignatureError:
        raise jwt.InvalidTokenError('Token has expired')
    except jwt.InvalidTokenError as e:
        raise jwt.InvalidTokenError(f'Invalid token: {str(e)}')


def token_required(f):
    """
    Decorator to protect routes that require authentication.
    Extracts and verifies JWT token from Authorization header.
    Adds 'current_user' to the kwargs passed to the route function.

    Usage:
        @app.route('/protected')
        @token_required
        def protected_route(current_user):
            return jsonify({'user': current_user.to_dict()})
    """
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None

        # Get token from Authorization header
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            try:
                # Expected format: "Bearer <token>"
                token = auth_header.split(' ')[1]
            except IndexError:
                return jsonify({'error': 'Invalid token format. Use: Bearer <token>'}), 401

        if not token:
            return jsonify({'error': 'Authentication token is missing'}), 401

        try:
            # Verify token
            payload = verify_jwt_token(token)

            # Get user from database
            current_user = db.session.get(User, payload['user_id'])

            if not current_user:
                return jsonify({'error': 'User not found'}), 401

            # Add current_user to kwargs
            kwargs['current_user'] = current_user

        except jwt.InvalidTokenError as e:
            return jsonify({'error': str(e)}), 401
        except Exception as e:
            return jsonify({'error': f'Authentication failed: {str(e)}'}), 401

        return f(*args, **kwargs)

    return decorated


def admin_required(f):
    """
    Decorator to protect routes that require system admin privileges.
    Must be used in combination with @token_required.
    Checks if current_user is a system admin.

    Usage:
        @app.route('/admin-only')
        @token_required
        @admin_required
        def admin_route(current_user):
            return jsonify({'message': 'Admin access granted'})
    """
    @wraps(f)
    def decorated(*args, **kwargs):
        current_user = kwargs.get('current_user')

        if not current_user:
            return jsonify({'error': 'Authentication required'}), 401

        if not current_user.is_system_admin:
            return jsonify({'error': 'Admin privileges required'}), 403

        return f(*args, **kwargs)

    return decorated


def optional_auth(f):
    """
    Decorator for routes that work with or without authentication.
    If token is provided and valid, adds 'current_user' to kwargs.
    If no token or invalid token, current_user will be None.

    Usage:
        @app.route('/optional')
        @optional_auth
        def optional_route(current_user=None):
            if current_user:
                return jsonify({'message': f'Hello {current_user.name}'})
            return jsonify({'message': 'Hello guest'})
    """
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        current_user = None

        # Get token from Authorization header
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            try:
                token = auth_header.split(' ')[1]
            except IndexError:
                pass

        if token:
            try:
                payload = verify_jwt_token(token)
                current_user = db.session.get(User, payload['user_id'])
            except:
                pass  # Silently fail for optional auth

        kwargs['current_user'] = current_user
        return f(*args, **kwargs)

    return decorated


def check_is_admin(email: str) -> bool:
    """
    Check if an email is in the admin list.

    Args:
        email: Email address to check

    Returns:
        bool: True if email is in admin list, False otherwise
    """
    return email.lower() in [admin.lower() for admin in ADMIN_EMAILS]
