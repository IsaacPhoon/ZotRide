from flask import Blueprint, request, jsonify
from sqlalchemy import select
from app.extensions import db
from app.models import Review, DriverData, User, Ride, UserRideData
from app.auth_utils import token_required

review_bp = Blueprint('review', __name__)


@review_bp.route('/reviews', methods=['POST'])
@token_required
def create_review(current_user):
    """
    Create a new review for a driver after completing a ride.

    Authentication: Required
    Headers:
        Authorization: Bearer <JWT token>

    Expected JSON body:
    {
        "driver_id": 1,
        "ride_id": 3,
        "stars": 4.5,
        "comment": "Great driver, very friendly!"
    }

    Note: author_id is automatically set from the authenticated user.

    Returns:
        201: Review created successfully
        400: Invalid request data or missing required fields
        401: Authentication required
        404: Driver or ride not found
        409: Review already exists for this ride and author
        403: Author was not a rider on this ride or ride is not completed
    """
    try:
        data = request.get_json()

        # Validate required fields (author_id is now taken from current_user)
        required_fields = ['driver_id', 'ride_id', 'stars', 'comment']
        if not all(field in data for field in required_fields):
            return jsonify({'error': 'Missing required fields'}), 400

        # Validate stars range
        if not (0.5 <= data['stars'] <= 5):
            return jsonify({'error': 'Stars must be between 0.5 and 5'}), 400

        # Check if driver exists
        driver = db.session.get(DriverData, data['driver_id'])
        if not driver:
            return jsonify({'error': 'Driver not found'}), 404

        # Check if ride exists
        ride = db.session.get(Ride, data['ride_id'])
        if not ride:
            return jsonify({'error': 'Ride not found'}), 404

        # Verify that the ride belongs to this driver
        if ride.driver_id != data['driver_id']:
            return jsonify({'error': 'This ride was not hosted by the specified driver'}), 400

        # Verify that the ride is completed
        if ride.status != 'completed':
            return jsonify({'error': 'Cannot review a ride that is not completed'}), 403

        # Verify that the author was a rider on this ride
        rider_data = db.session.execute(
            select(UserRideData).where(
                UserRideData.ride_id == data['ride_id'],
                UserRideData.user_id == current_user.id
            )
        ).scalar_one_or_none()

        if not rider_data:
            return jsonify({'error': 'You must have been a rider on this ride to review it'}), 403

        # Check if review already exists for this ride and author
        existing_review = db.session.execute(
            select(Review).where(
                Review.ride_id == data['ride_id'],
                Review.author_id == current_user.id
            )
        ).scalar_one_or_none()

        if existing_review:
            return jsonify({'error': 'You have already reviewed this ride'}), 409

        # Create new review (using current_user.id as author_id)
        review = Review(
            driver_id=data['driver_id'],
            author_id=current_user.id,
            ride_id=data['ride_id'],
            stars=data['stars'],
            comment=data['comment']
        )

        db.session.add(review)
        db.session.commit()

        return jsonify(review.to_dict()), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400


@review_bp.route('/reviews', methods=['GET'])
@token_required
def get_reviews(current_user):
    """
    Get all reviews with optional filtering.

    Authentication: Required
    Headers:
        Authorization: Bearer <JWT token>

    Query parameters:
        - driver_id: Filter by driver (optional)
        - author_id: Filter by author (optional)
        - ride_id: Filter by ride (optional)
        - min_stars: Filter by minimum star rating (optional)
        - limit: Maximum number of reviews to return (optional)
        - offset: Number of reviews to skip (optional)

    Returns:
        200: List of reviews matching the filters
        401: Authentication required
    """
    try:
        driver_id = request.args.get('driver_id', type=int)
        author_id = request.args.get('author_id', type=int)
        ride_id = request.args.get('ride_id', type=int)
        min_stars = request.args.get('min_stars', type=float)
        limit = request.args.get('limit', type=int)
        offset = request.args.get('offset', type=int, default=0)

        query = select(Review)

        if driver_id is not None:
            query = query.where(Review.driver_id == driver_id)
        if author_id is not None:
            query = query.where(Review.author_id == author_id)
        if ride_id is not None:
            query = query.where(Review.ride_id == ride_id)
        if min_stars is not None:
            query = query.where(Review.stars >= min_stars)

        query = query.offset(offset)
        if limit:
            query = query.limit(limit)

        reviews = db.session.execute(query).scalars().all()

        return jsonify([review.to_dict() for review in reviews]), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 400


@review_bp.route('/reviews/<int:review_id>', methods=['GET'])
@token_required
def get_review(review_id, current_user):
    """
    Get a specific review by ID.

    Authentication: Required
    Headers:
        Authorization: Bearer <JWT token>

    Args:
        review_id: The ID of the review to retrieve

    Returns:
        200: Review data
        401: Authentication required
        404: Review not found
    """
    try:
        review = db.session.get(Review, review_id)

        if not review:
            return jsonify({'error': 'Review not found'}), 404

        return jsonify(review.to_dict()), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 400


@review_bp.route('/reviews/<int:review_id>', methods=['PUT'])
@token_required
def update_review(review_id, current_user):
    """
    Update an existing review.

    Authentication: Required
    Headers:
        Authorization: Bearer <JWT token>

    Args:
        review_id: The ID of the review to update

    Expected JSON body (all fields optional):
    {
        "stars": 5.0,
        "comment": "Updated comment"
    }

    Note: Only the author of the review can update it.

    Returns:
        200: Review updated successfully
        400: Invalid request data
        401: Authentication required
        403: Not authorized to update this review
        404: Review not found
    """
    try:
        review = db.session.get(Review, review_id)

        if not review:
            return jsonify({'error': 'Review not found'}), 404

        # Check if the current user is the author of the review
        if review.author_id != current_user.id:
            return jsonify({'error': 'You are not authorized to update this review'}), 403

        data = request.get_json()

        # Update fields if provided
        if 'stars' in data:
            if not (0.5 <= data['stars'] <= 5):
                return jsonify({'error': 'Stars must be between 0.5 and 5'}), 400
            review.stars = data['stars']

        if 'comment' in data:
            review.comment = data['comment']

        db.session.commit()

        return jsonify(review.to_dict()), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400


@review_bp.route('/reviews/<int:review_id>', methods=['DELETE'])
@token_required
def delete_review(review_id, current_user):
    """
    Delete a review.

    Authentication: Required
    Headers:
        Authorization: Bearer <JWT token>

    Args:
        review_id: The ID of the review to delete

    Note: Only the author of the review can delete it.

    Returns:
        200: Review deleted successfully
        401: Authentication required
        403: Not authorized to delete this review
        404: Review not found
    """
    try:
        review = db.session.get(Review, review_id)

        if not review:
            return jsonify({'error': 'Review not found'}), 404

        # Check if the current user is the author of the review
        if review.author_id != current_user.id:
            return jsonify({'error': 'You are not authorized to delete this review'}), 403

        db.session.delete(review)
        db.session.commit()

        return jsonify({'message': 'Review deleted successfully'}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400


@review_bp.route('/drivers/<int:driver_id>/reviews', methods=['GET'])
@token_required
def get_driver_reviews(driver_id, current_user):
    """
    Get all reviews for a specific driver.

    Authentication: Required
    Headers:
        Authorization: Bearer <JWT token>

    Args:
        driver_id: The ID of the driver

    Query parameters:
        - limit: Maximum number of reviews to return (optional)
        - offset: Number of reviews to skip (optional)
        - min_stars: Filter by minimum star rating (optional)

    Returns:
        200: List of reviews for the driver with average rating
        401: Authentication required
        404: Driver not found
    """
    try:
        driver = db.session.get(DriverData, driver_id)

        if not driver:
            return jsonify({'error': 'Driver not found'}), 404

        limit = request.args.get('limit', type=int)
        offset = request.args.get('offset', type=int, default=0)
        min_stars = request.args.get('min_stars', type=float)

        query = select(Review).where(Review.driver_id == driver_id)

        if min_stars is not None:
            query = query.where(Review.stars >= min_stars)

        query = query.offset(offset)
        if limit:
            query = query.limit(limit)

        reviews = db.session.execute(query).scalars().all()

        return jsonify({
            'driver_id': driver_id,
            'average_rating': driver.average_rating,
            'total_reviews': len(driver.reviews),
            'reviews': [review.to_dict() for review in reviews]
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 400


@review_bp.route('/rides/<int:ride_id>/reviews', methods=['GET'])
@token_required
def get_ride_reviews(ride_id, current_user):
    """
    Get all reviews for a specific ride.

    Authentication: Required
    Headers:
        Authorization: Bearer <JWT token>

    Args:
        ride_id: The ID of the ride

    Returns:
        200: List of reviews for the ride
        401: Authentication required
        404: Ride not found
    """
    try:
        ride = db.session.get(Ride, ride_id)

        if not ride:
            return jsonify({'error': 'Ride not found'}), 404

        reviews = db.session.execute(
            select(Review).where(Review.ride_id == ride_id)
        ).scalars().all()

        return jsonify({
            'ride_id': ride_id,
            'total_reviews': len(reviews),
            'reviews': [review.to_dict() for review in reviews]
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 400


@review_bp.route('/users/<int:user_id>/reviews', methods=['GET'])
@token_required
def get_user_authored_reviews(user_id, current_user):
    """
    Get all reviews authored by a specific user.

    Authentication: Required
    Headers:
        Authorization: Bearer <JWT token>

    Args:
        user_id: The ID of the user

    Query parameters:
        - limit: Maximum number of reviews to return (optional)
        - offset: Number of reviews to skip (optional)

    Returns:
        200: List of reviews authored by the user
        401: Authentication required
        404: User not found
    """
    try:
        user = db.session.get(User, user_id)

        if not user:
            return jsonify({'error': 'User not found'}), 404

        limit = request.args.get('limit', type=int)
        offset = request.args.get('offset', type=int, default=0)

        query = select(Review).where(Review.author_id == user_id)
        query = query.offset(offset)
        if limit:
            query = query.limit(limit)

        reviews = db.session.execute(query).scalars().all()

        return jsonify({
            'user_id': user_id,
            'total_reviews': len(user.ratings_authored),
            'reviews': [review.to_dict() for review in reviews]
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 400
