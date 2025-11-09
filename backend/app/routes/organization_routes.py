from flask import Blueprint, request, jsonify
from sqlalchemy import select, and_
from app.extensions import db
from app.models import Organization, UserOrganizationData, User
from app.auth_utils import token_required

organization_bp = Blueprint('organization', __name__)


@organization_bp.route('/organizations', methods=['POST'])
@token_required
def create_organization(current_user):
    """
    Create a new organization. Requires authentication.
    The authenticated user will become the owner of the organization.

    Headers:
        Authorization: Bearer <JWT token>

    Expected JSON body:
    {
        "name": "UCI Hiking Club",
        "description": "A club for hiking enthusiasts at UCI"  # Optional
    }

    Returns:
        201: Organization created successfully
        400: Invalid request data or missing required fields
        401: Authentication required
        409: Organization with this name already exists
    """
    try:
        data = request.get_json()

        # Validate required fields
        if 'name' not in data:
            return jsonify({'error': 'Missing required field: name'}), 400

        # Check if organization name already exists
        existing_org = db.session.execute(
            select(Organization).where(Organization.name == data['name'])
        ).scalar_one_or_none()

        if existing_org:
            return jsonify({'error': 'Organization with this name already exists'}), 409

        # Create new organization
        organization = Organization(
            name=data['name'],
            description=data.get('description')
        )

        db.session.add(organization)
        db.session.flush()  # Get the organization ID

        # Add authenticated user as owner with owner privileges
        owner_data = UserOrganizationData(
            user_id=current_user.id,
            organization_id=organization.id,
            is_owner=True,
            is_admin=True,  # Owners are also admins
            is_driver=False
        )

        db.session.add(owner_data)
        db.session.commit()

        return jsonify(organization.to_dict()), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400


@organization_bp.route('/organizations', methods=['GET'])
@token_required
def get_organizations(current_user):
    """
    Get all organizations. Requires authentication.

    Headers:
        Authorization: Bearer <JWT token>

    Query parameters:
        - limit: Maximum number of organizations to return (optional)
        - offset: Number of organizations to skip (optional)

    Returns:
        200: List of all organizations
        401: Authentication required
    """
    try:
        limit = request.args.get('limit', type=int)
        offset = request.args.get('offset', type=int, default=0)

        query = select(Organization).offset(offset)
        if limit:
            query = query.limit(limit)

        organizations = db.session.execute(query).scalars().all()

        return jsonify([org.to_dict() for org in organizations]), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 400


@organization_bp.route('/organizations/<int:org_id>', methods=['GET'])
@token_required
def get_organization(org_id, current_user):
    """
    Get a specific organization by ID. Requires authentication.

    Headers:
        Authorization: Bearer <JWT token>

    Args:
        org_id: The ID of the organization to retrieve

    Returns:
        200: Organization data
        401: Authentication required
        404: Organization not found
    """
    try:
        organization = db.session.get(Organization, org_id)

        if not organization:
            return jsonify({'error': 'Organization not found'}), 404

        return jsonify(organization.to_dict()), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 400


@organization_bp.route('/organizations/<int:org_id>', methods=['PUT'])
@token_required
def update_organization(org_id, current_user):
    """
    Update an organization's information (owner/admin only). Requires authentication.

    Headers:
        Authorization: Bearer <JWT token>

    Args:
        org_id: The ID of the organization to update

    Expected JSON body:
    {
        "name": "Updated Club Name",  # Optional
        "description": "Updated description"  # Optional
    }

    Returns:
        200: Organization updated successfully
        401: Authentication required
        403: User is not authorized to update this organization
        404: Organization not found
        400: Invalid request data
    """
    try:
        organization = db.session.get(Organization, org_id)

        if not organization:
            return jsonify({'error': 'Organization not found'}), 404

        data = request.get_json()

        # Check if authenticated user is owner or admin
        user_org_data = db.session.execute(
            select(UserOrganizationData).where(
                and_(
                    UserOrganizationData.user_id == current_user.id,
                    UserOrganizationData.organization_id == org_id
                )
            )
        ).scalar_one_or_none()

        if not user_org_data or (not user_org_data.is_owner and not user_org_data.is_admin):
            return jsonify({'error': 'User is not authorized to update this organization'}), 403

        # Update allowed fields
        if 'name' in data:
            organization.name = data['name']
        if 'description' in data:
            organization.description = data['description']

        db.session.commit()

        return jsonify(organization.to_dict()), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400


@organization_bp.route('/organizations/<int:org_id>', methods=['DELETE'])
@token_required
def delete_organization(org_id, current_user):
    """
    Delete an organization (owner only). Requires authentication.

    Headers:
        Authorization: Bearer <JWT token>

    Args:
        org_id: The ID of the organization to delete

    Returns:
        204: Organization deleted successfully
        401: Authentication required
        403: User is not the owner of this organization
        404: Organization not found
    """
    try:
        organization = db.session.get(Organization, org_id)

        if not organization:
            return jsonify({'error': 'Organization not found'}), 404

        # Check if authenticated user is owner
        user_org_data = db.session.execute(
            select(UserOrganizationData).where(
                and_(
                    UserOrganizationData.user_id == current_user.id,
                    UserOrganizationData.organization_id == org_id
                )
            )
        ).scalar_one_or_none()

        if not user_org_data or not user_org_data.is_owner:
            return jsonify({'error': 'User is not authorized to delete this organization'}), 403

        db.session.delete(organization)
        db.session.commit()

        return '', 204

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400


@organization_bp.route('/organizations/<int:org_id>/members', methods=['GET'])
@token_required
def get_organization_members(org_id, current_user):
    """
    Get all members of an organization. Requires authentication.

    Headers:
        Authorization: Bearer <JWT token>

    Args:
        org_id: The ID of the organization

    Returns:
        200: List of members with their roles
        401: Authentication required
        404: Organization not found
    """
    try:
        organization = db.session.get(Organization, org_id)

        if not organization:
            return jsonify({'error': 'Organization not found'}), 404

        members = []
        for user_org_data in organization.members:
            member_info = {
                'user_id': user_org_data.user_id,
                'name': user_org_data.user.name,
                'email': user_org_data.user.email,
                'is_owner': user_org_data.is_owner,
                'is_admin': user_org_data.is_admin,
                'is_driver': user_org_data.is_driver
            }
            members.append(member_info)

        return jsonify(members), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 400


@organization_bp.route('/organizations/<int:org_id>/members', methods=['POST'])
@token_required
def add_organization_member(org_id, current_user):
    """
    Add a member to an organization. Requires authentication.
    Only owners and admins can add members.

    Headers:
        Authorization: Bearer <JWT token>

    Args:
        org_id: The ID of the organization

    Expected JSON body:
    {
        "user_id": 2,  # User to add
        "is_admin": false,  # Optional
        "is_driver": false  # Optional
    }

    Returns:
        200: Member added successfully
        401: Authentication required
        403: User is not authorized to add members
        404: Organization or user not found
        409: User is already a member
        400: Invalid request data
    """
    try:
        organization = db.session.get(Organization, org_id)

        if not organization:
            return jsonify({'error': 'Organization not found'}), 404

        data = request.get_json()

        # Validate required fields
        if 'user_id' not in data:
            return jsonify({'error': 'Missing required field: user_id'}), 400

        # Check if authenticated user is owner or admin
        requesting_user_data = db.session.execute(
            select(UserOrganizationData).where(
                and_(
                    UserOrganizationData.user_id == current_user.id,
                    UserOrganizationData.organization_id == org_id
                )
            )
        ).scalar_one_or_none()

        if not requesting_user_data or (not requesting_user_data.is_owner and not requesting_user_data.is_admin):
            return jsonify({'error': 'User is not authorized to add members'}), 403

        # Check if user to add exists
        user = db.session.get(User, data['user_id'])
        if not user:
            return jsonify({'error': 'User not found'}), 404

        # Check if user is already a member
        existing = db.session.execute(
            select(UserOrganizationData).where(
                and_(
                    UserOrganizationData.user_id == data['user_id'],
                    UserOrganizationData.organization_id == org_id
                )
            )
        ).scalar_one_or_none()

        if existing:
            return jsonify({'error': 'User is already a member of this organization'}), 409

        # Add new member
        member_data = UserOrganizationData(
            user_id=data['user_id'],
            organization_id=org_id,
            is_owner=False,
            is_admin=data.get('is_admin', False),
            is_driver=data.get('is_driver', False)
        )

        db.session.add(member_data)
        db.session.commit()

        return jsonify({'message': 'Member added successfully'}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400


@organization_bp.route('/organizations/<int:org_id>/members/<int:user_id>', methods=['DELETE'])
@token_required
def remove_organization_member(org_id, user_id, current_user):
    """
    Remove a member from an organization (owner/admin only). Requires authentication.

    Headers:
        Authorization: Bearer <JWT token>

    Args:
        org_id: The ID of the organization
        user_id: The ID of the user to remove

    Returns:
        204: Member removed successfully
        401: Authentication required
        403: User is not authorized to remove members
        404: Organization or membership not found
        400: Cannot remove the owner
    """
    try:
        organization = db.session.get(Organization, org_id)

        if not organization:
            return jsonify({'error': 'Organization not found'}), 404

        # Check if authenticated user is owner or admin
        requesting_user_data = db.session.execute(
            select(UserOrganizationData).where(
                and_(
                    UserOrganizationData.user_id == current_user.id,
                    UserOrganizationData.organization_id == org_id
                )
            )
        ).scalar_one_or_none()

        if not requesting_user_data or (not requesting_user_data.is_owner and not requesting_user_data.is_admin):
            return jsonify({'error': 'User is not authorized to remove members'}), 403

        # Get member data to remove
        member_data = db.session.execute(
            select(UserOrganizationData).where(
                and_(
                    UserOrganizationData.user_id == user_id,
                    UserOrganizationData.organization_id == org_id
                )
            )
        ).scalar_one_or_none()

        if not member_data:
            return jsonify({'error': 'User is not a member of this organization'}), 404

        # Cannot remove the owner
        if member_data.is_owner:
            return jsonify({'error': 'Cannot remove the organization owner'}), 400

        db.session.delete(member_data)
        db.session.commit()

        return '', 204

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400


@organization_bp.route('/organizations/<int:org_id>/members/<int:user_id>/role', methods=['PUT'])
@token_required
def update_member_role(org_id, user_id, current_user):
    """
    Update a member's role in an organization (owner/admin only). Requires authentication.

    Headers:
        Authorization: Bearer <JWT token>

    Args:
        org_id: The ID of the organization
        user_id: The ID of the user to update

    Expected JSON body:
    {
        "is_admin": true,  # Optional
        "is_driver": true  # Optional
    }

    Note: Only the owner can make other members admins.

    Returns:
        200: Member role updated successfully
        401: Authentication required
        403: User is not authorized to update member roles
        404: Organization or member not found
        400: Invalid request data or attempting to modify owner status
    """
    try:
        organization = db.session.get(Organization, org_id)

        if not organization:
            return jsonify({'error': 'Organization not found'}), 404

        data = request.get_json()

        # Check if authenticated user is owner or admin
        requesting_user_data = db.session.execute(
            select(UserOrganizationData).where(
                and_(
                    UserOrganizationData.user_id == current_user.id,
                    UserOrganizationData.organization_id == org_id
                )
            )
        ).scalar_one_or_none()

        if not requesting_user_data or (not requesting_user_data.is_owner and not requesting_user_data.is_admin):
            return jsonify({'error': 'User is not authorized to update member roles'}), 403

        # Get member data to update
        member_data = db.session.execute(
            select(UserOrganizationData).where(
                and_(
                    UserOrganizationData.user_id == user_id,
                    UserOrganizationData.organization_id == org_id
                )
            )
        ).scalar_one_or_none()

        if not member_data:
            return jsonify({'error': 'User is not a member of this organization'}), 404

        # Only owner can make admins
        if 'is_admin' in data and not requesting_user_data.is_owner:
            return jsonify({'error': 'Only the owner can grant admin privileges'}), 403

        # Cannot modify owner status
        if member_data.is_owner:
            return jsonify({'error': 'Cannot modify owner status'}), 400

        # Update allowed fields
        if 'is_admin' in data:
            member_data.is_admin = data['is_admin']
        if 'is_driver' in data:
            member_data.is_driver = data['is_driver']

        db.session.commit()

        return jsonify(member_data.to_dict()), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400


@organization_bp.route('/organizations/<int:org_id>/drivers', methods=['GET'])
@token_required
def get_organization_drivers(org_id, current_user):
    """
    Get all approved drivers in an organization. Requires authentication.

    Headers:
        Authorization: Bearer <JWT token>

    Args:
        org_id: The ID of the organization

    Returns:
        200: List of approved drivers in the organization
        401: Authentication required
        404: Organization not found
    """
    try:
        organization = db.session.get(Organization, org_id)

        if not organization:
            return jsonify({'error': 'Organization not found'}), 404

        drivers = []
        for user_org_data in organization.members:
            if user_org_data.is_driver and user_org_data.user.driver_data and user_org_data.user.driver_data.is_approved:
                driver_info = {
                    'user_id': user_org_data.user_id,
                    'name': user_org_data.user.name,
                    'email': user_org_data.user.email,
                    'driver_data': user_org_data.user.driver_data.to_dict()
                }
                drivers.append(driver_info)

        return jsonify(drivers), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 400


@organization_bp.route('/organizations/<int:org_id>/rides', methods=['GET'])
@token_required
def get_organization_rides(org_id, current_user):
    """
    Get all rides associated with an organization. Requires authentication.

    Headers:
        Authorization: Bearer <JWT token>

    Args:
        org_id: The ID of the organization

    Query parameters:
        - status: Filter by ride status (active/completed/cancelled) (optional)

    Returns:
        200: List of rides for the organization
        401: Authentication required
        404: Organization not found
    """
    try:
        organization = db.session.get(Organization, org_id)

        if not organization:
            return jsonify({'error': 'Organization not found'}), 404

        status_filter = request.args.get('status')

        rides = organization.organization_rides
        if status_filter:
            rides = [ride for ride in rides if ride.status == status_filter]

        return jsonify([ride.to_dict() for ride in rides]), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 400

#Add Transfer Ownership Route