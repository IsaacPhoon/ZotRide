# ZotRide Backend API

A Flask-based REST API for a university rideshare platform, restricted to UC Irvine students (uci.edu emails only).

## Table of Contents
- [Setup](#setup)
- [Authentication](#authentication)
- [API Endpoints](#api-endpoints)
  - [Auth Routes](#auth-routes)
  - [User Routes](#user-routes)
  - [Driver Routes](#driver-routes)
  - [Ride Routes](#ride-routes)
  - [Organization Routes](#organization-routes)
  - [Review Routes](#review-routes)
- [Database Models](#database-models)
- [Admin Features](#admin-features)

## Setup

### Prerequisites
- Python 3.8+
- pip

### Installation

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Create a `.env` file in the backend directory:
```bash
cp .env.example .env
```

3. Configure your `.env` file with required values:
```env
FLASK_ENV=development
SECRET_KEY=your-secret-key-here
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_REDIRECT_URI=http://localhost:5173
```

4. Run the application:
```bash
python run.py
```

The API will be available at `http://localhost:5000`

## Authentication

This API uses **JWT (JSON Web Token)** authentication with **Google Sign-In**.

### How Authentication Works

1. User signs in with Google (frontend)
2. Frontend sends Google ID token to `/api/auth/google/verify`
3. Backend verifies token and returns JWT if user exists, or prompts for registration
4. For new users, frontend collects additional info and calls `/api/auth/google/register`
5. Include JWT token in all subsequent requests via `Authorization` header

### Protected Routes

Most routes require authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### Email Restrictions

- Only **@uci.edu** email addresses are allowed
- System admins: `kennl21@uci.edu`, `bdkeenan@uci.edu`

---

## API Endpoints

All endpoints are prefixed with `/api`

### Auth Routes

#### `POST /auth/google/verify`
Verify Google token and check if user exists.

**Request Body:**
```json
{
  "token": "<Google ID token>"
}
```

**Response (Existing User - 200):**
```json
{
  "exists": true,
  "message": "Login successful",
  "token": "<JWT token>",
  "user": { /* user data */ }
}
```

**Response (New User - 200):**
```json
{
  "exists": false,
  "message": "Please complete registration",
  "email": "user@uci.edu",
  "name": "John Doe",
  "google_id": "..."
}
```

---

#### `POST /auth/google/register`
Complete registration for new users.

**Request Body:**
```json
{
  "token": "<Google ID token>",
  "gender": 0,  // 0=Male, 1=Female, 2=Other
  "preferred_contact": "email@uci.edu or phone"
}
```

**Response (201):**
```json
{
  "message": "Registration successful",
  "token": "<JWT token>",
  "user": { /* user data */ },
  "is_admin": false
}
```

---

#### `GET /auth/verify`
Verify if current JWT token is valid.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "message": "Token is valid",
  "user": { /* user data */ }
}
```

---

#### `POST /auth/refresh`
Refresh an expired or soon-to-expire JWT token.

**Request Body:**
```json
{
  "token": "<current JWT token>"
}
```

**Response (200):**
```json
{
  "message": "Token refreshed successfully",
  "token": "<new JWT token>",
  "user": { /* user data */ }
}
```

---

#### `GET /auth/me`
Get current authenticated user's information.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "id": 1,
  "email": "user@uci.edu",
  "name": "John Doe",
  "gender": 0,
  "preferred_contact": "user@uci.edu",
  "is_driver": false,
  "driver_id": null,
  "total_reviews_authored": 0
}
```

---

### User Routes

#### `GET /users`
Get all users with pagination.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `limit` (optional): Maximum number of users to return
- `offset` (optional): Number of users to skip

**Response (200):**
```json
[
  {
    "id": 1,
    "email": "user@uci.edu",
    "name": "John Doe",
    ...
  }
]
```

---

#### `GET /users/:user_id`
Get a specific user by ID.

**Headers:** `Authorization: Bearer <token>`

**Response (200):** User object

---

#### `PUT /users/:user_id`
Update user information. Users can only update their own profile (or admins can update any).

**Headers:** `Authorization: Bearer <token>`

**Request Body (all optional):**
```json
{
  "name": "New Name",
  "gender": 1,
  "preferred_contact": "new contact"
}
```

**Response (200):** Updated user object

---

#### `DELETE /users/:user_id`
Delete a user account. Users can only delete their own account (or admins can delete any).

**Headers:** `Authorization: Bearer <token>`

**Response (204):** No content

---

#### `GET /users/:user_id/organizations`
Get all organizations a user belongs to.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
[
  {
    "organization_id": 1,
    "organization_name": "UCI Cycling Club",
    "is_owner": false,
    "is_admin": false,
    "is_driver": true
  }
]
```

---

#### `GET /users/:user_id/rides`
Get all rides a user has joined.

**Headers:** `Authorization: Bearer <token>`

**Response (200):** Array of ride objects with user's comment and join time

---

#### `GET /users/:user_id/driver-data`
Get driver data for a specific user.

**Headers:** `Authorization: Bearer <token>`

**Response (200):** Driver data object or 404 if user is not a driver

---

### Driver Routes

#### `POST /drivers`
Register as a driver. Creates driver data for the authenticated user.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "license_image": "https://cloudinary.com/...",
  "vehicle_data": "2020 Honda Accord",
  "license_plate": "ABC1234"
}
```

**Response (201):**
```json
{
  "id": 1,
  "user_id": 1,
  "license_image": "https://...",
  "vehicle_data": "2020 Honda Accord",
  "license_plate": "ABC1234",
  "is_approved": false,
  "approved_at": null,
  "average_rating": 0.0
}
```

---

#### `GET /drivers`
Get all drivers with optional filtering.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `approved` (optional): Filter by approval status (true/false)
- `limit` (optional): Maximum number to return
- `offset` (optional): Number to skip

**Response (200):** Array of driver objects

---

#### `GET /drivers/:driver_id`
Get a specific driver by ID.

**Headers:** `Authorization: Bearer <token>`

**Response (200):** Driver object

---

#### `PUT /drivers/:driver_id`
Update driver information. Drivers can only update their own data (or admins can update any).

**Headers:** `Authorization: Bearer <token>`

**Request Body (all optional):**
```json
{
  "license_image": "https://...",
  "vehicle_data": "2021 Honda Accord",
  "license_plate": "XYZ5678"
}
```

**Response (200):** Updated driver object

---

#### `DELETE /drivers/:driver_id`
Delete driver data. Drivers can only delete their own data (or admins can delete any).

**Headers:** `Authorization: Bearer <token>`

**Response (204):** No content

---

#### `POST /drivers/:driver_id/approve`
**ADMIN ONLY** - Approve or reject a driver.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "approved": true
}
```

**Response (200):**
```json
{
  "message": "Driver approved successfully",
  "driver": { /* driver data */ }
}
```

---

#### `GET /drivers/:driver_id/rides`
Get all rides hosted by a specific driver.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `status` (optional): Filter by ride status (active/completed/cancelled)

**Response (200):** Array of ride objects

---

#### `GET /drivers/pending-approval`
**ADMIN ONLY** - Get all drivers pending approval.

**Headers:** `Authorization: Bearer <token>`

**Response (200):** Array of pending driver objects

---

### Ride Routes

#### `POST /rides`
Create a new ride (driver post or rider request).

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "pickup_address": "123 Main St",
  "pickup_time": "2025-01-15T10:00:00",
  "destination_address": "456 Elm St",
  "max_riders": 4,
  "price_option": "free",  // Options: 'free', 'gas', 'gas with fee'
  "driver_id": 1,  // Optional - if provided, this is a driver post
  "organization_id": 1,  // Optional
  "driver_comment": "I prefer quiet passengers"  // Optional
}
```

**Response (201):** Created ride object

---

#### `GET /rides`
Get all rides with optional filtering.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `status` (optional): active/completed/cancelled
- `has_driver` (optional): true/false
- `organization_id` (optional): Filter by organization
- `limit` (optional): Maximum number to return
- `offset` (optional): Number to skip

**Response (200):** Array of ride objects

---

#### `GET /rides/:ride_id`
Get a specific ride by ID.

**Headers:** `Authorization: Bearer <token>`

**Response (200):** Ride object

---

#### `PUT /rides/:ride_id`
Update ride information.

**Headers:** `Authorization: Bearer <token>`

**Request Body (all optional):**
```json
{
  "pickup_address": "789 Oak St",
  "pickup_time": "2025-01-15T11:00:00",
  "destination_address": "321 Pine St",
  "max_riders": 3,
  "price_option": "gas",
  "status": "active",
  "driver_id": 2,
  "driver_comment": "Updated comment"
}
```

**Note:** Completed rides can only update `driver_comment`

**Response (200):** Updated ride object

---

#### `DELETE /rides/:ride_id`
Delete a ride. Only ride creator or assigned driver can delete.

**Headers:** `Authorization: Bearer <token>`

**Response (204):** No content

---

#### `POST /rides/:ride_id/complete`
Mark a ride as completed. Only the assigned driver can complete their ride.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "message": "Ride completed successfully. Riders can now leave reviews.",
  "ride": { /* ride data */ }
}
```

---

#### `POST /rides/:ride_id/join`
Join a ride as a rider.

**Headers:** `Authorization: Bearer <token>`

**Request Body (optional):**
```json
{
  "user_comment": "Looking forward to the ride!"
}
```

**Response (200):**
```json
{
  "message": "Successfully joined the ride",
  "ride": { /* ride data */ }
}
```

---

#### `POST /rides/:ride_id/leave`
Leave a ride as a rider.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "message": "Successfully left the ride",
  "ride": { /* ride data */ }
}
```

---

#### `GET /rides/:ride_id/riders`
Get all riders for a specific ride.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
[
  {
    "user_id": 1,
    "name": "John Doe",
    "email": "user@uci.edu",
    "comment": "Looking forward to it!",
    "joined_at": "2025-01-10T10:00:00"
  }
]
```

---

#### `GET /rides/search`
Search for rides based on various criteria.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `pickup_address` (optional): Partial match
- `destination_address` (optional): Partial match
- `date` (optional): YYYY-MM-DD format
- `min_seats` (optional): Minimum available seats
- `status` (optional): Default is 'active'

**Response (200):** Array of matching ride objects

---

#### `GET /rides/rider-requests`
Get all rider requests (rides without a driver).

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `limit` (optional)
- `offset` (optional)

**Response (200):** Array of rider request ride objects

---

#### `GET /rides/driver-posts`
Get all driver posts (rides with a driver).

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `limit` (optional)
- `offset` (optional)

**Response (200):** Array of driver post ride objects

---

### Organization Routes

#### `POST /organizations`
Create a new organization. The authenticated user becomes the owner.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "name": "UCI Cycling Club",
  "description": "For cyclists at UCI"  // Optional
}
```

**Response (201):** Created organization object

---

#### `GET /organizations`
Get all organizations.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `limit` (optional)
- `offset` (optional)

**Response (200):** Array of organization objects

---

#### `GET /organizations/:org_id`
Get a specific organization by ID.

**Headers:** `Authorization: Bearer <token>`

**Response (200):** Organization object

---

#### `PUT /organizations/:org_id`
Update organization information. Only owner or admin can update.

**Headers:** `Authorization: Bearer <token>`

**Request Body (all optional):**
```json
{
  "name": "New Name",
  "description": "New description"
}
```

**Response (200):** Updated organization object

---

#### `DELETE /organizations/:org_id`
Delete an organization. Only the owner can delete.

**Headers:** `Authorization: Bearer <token>`

**Response (204):** No content

---

#### `GET /organizations/:org_id/members`
Get all members of an organization with their roles.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
[
  {
    "user_id": 1,
    "name": "John Doe",
    "email": "user@uci.edu",
    "is_owner": true,
    "is_admin": true,
    "is_driver": false
  }
]
```

---

#### `POST /organizations/:org_id/members`
Add a member to an organization. Only owner or admin can add members.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "user_id": 2,
  "is_admin": false,  // Optional, default false
  "is_driver": false  // Optional, default false
}
```

**Response (201):**
```json
{
  "message": "Member added successfully",
  "member": { /* member data */ }
}
```

---

#### `DELETE /organizations/:org_id/members/:user_id`
Remove a member from an organization. Only owner or admin can remove members.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "message": "Member removed successfully"
}
```

---

#### `PUT /organizations/:org_id/members/:user_id/role`
Update a member's role in an organization. Only owner or admin can update roles.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "is_admin": true,  // Optional
  "is_driver": true   // Optional
}
```

**Note:** Only owners can grant admin privileges.

**Response (200):**
```json
{
  "message": "Member role updated successfully",
  "member": { /* updated member data */ }
}
```

---

#### `GET /organizations/:org_id/drivers`
Get all approved drivers in an organization.

**Headers:** `Authorization: Bearer <token>`

**Response (200):** Array of driver objects

---

#### `GET /organizations/:org_id/rides`
Get all rides associated with an organization.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `status` (optional): Filter by ride status

**Response (200):** Array of ride objects

---

### Review Routes

#### `POST /reviews`
Create a review for a driver after completing a ride.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "driver_id": 1,
  "ride_id": 1,
  "stars": 4.5,  // 0.5 to 5.0 in 0.5 increments
  "comment": "Great driver!"  // Optional
}
```

**Notes:**
- Can only review after ride is completed
- One review per ride per user

**Response (201):** Created review object

---

#### `GET /reviews`
Get all reviews with optional filtering.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `driver_id` (optional): Filter by driver
- `author_id` (optional): Filter by review author
- `ride_id` (optional): Filter by ride
- `min_stars` (optional): Minimum star rating
- `limit` (optional)
- `offset` (optional)

**Response (200):** Array of review objects

---

#### `GET /reviews/:review_id`
Get a specific review by ID.

**Headers:** `Authorization: Bearer <token>`

**Response (200):** Review object

---

#### `PUT /reviews/:review_id`
Update a review. Only the author can update their own review.

**Headers:** `Authorization: Bearer <token>`

**Request Body (all optional):**
```json
{
  "stars": 5.0,
  "comment": "Updated comment"
}
```

**Response (200):** Updated review object

---

#### `DELETE /reviews/:review_id`
Delete a review. Only the author can delete their own review.

**Headers:** `Authorization: Bearer <token>`

**Response (204):** No content

---

#### `GET /drivers/:driver_id/reviews`
Get all reviews for a specific driver with average rating.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "driver_id": 1,
  "average_rating": 4.5,
  "total_reviews": 10,
  "reviews": [ /* array of review objects */ ]
}
```

---

#### `GET /rides/:ride_id/reviews`
Get all reviews for a specific ride.

**Headers:** `Authorization: Bearer <token>`

**Response (200):** Array of review objects

---

#### `GET /users/:user_id/reviews`
Get all reviews authored by a specific user.

**Headers:** `Authorization: Bearer <token>`

**Response (200):** Array of review objects

---

## Database Models

### User
- `id`: Integer (Primary Key)
- `email`: String (Unique, @uci.edu only)
- `name`: String
- `is_system_admin`: Boolean
- `gender`: Integer (0=Male, 1=Female, 2=Other)
- `preferred_contact`: String
- `created_at`: DateTime
- `updated_at`: DateTime

### DriverData
- `id`: Integer (Primary Key)
- `user_id`: Integer (Foreign Key, Unique)
- `license_image`: String (Unique)
- `vehicle_data`: String
- `license_plate`: String (Unique)
- `is_approved`: Boolean
- `approved_at`: DateTime
- Computed: `average_rating`

### Ride
- `id`: Integer (Primary Key)
- `pickup_address`: String
- `pickup_time`: DateTime (Indexed)
- `destination_address`: String
- `max_riders`: Integer (Default: 4)
- `price_option`: String (free/gas/gas with fee)
- `status`: String (active/completed/cancelled)
- `driver_comment`: String (Optional)
- `driver_id`: Integer (Foreign Key, Optional)
- `organization_id`: Integer (Foreign Key, Optional)
- Computed: `available_seats`, `is_full`

### Organization
- `id`: Integer (Primary Key)
- `name`: String (Unique)
- `description`: String (Optional)
- `created_at`: DateTime
- `updated_at`: DateTime

### Review
- `id`: Integer (Primary Key)
- `driver_id`: Integer (Foreign Key)
- `author_id`: Integer (Foreign Key)
- `ride_id`: Integer (Foreign Key)
- `stars`: Float (0.5 to 5.0)
- `comment`: String (Optional)
- `created_at`: DateTime
- `updated_at`: DateTime
- Constraint: Unique (ride_id, author_id)

### UserRideData
Junction table for User-Ride many-to-many relationship
- `id`: Integer (Primary Key)
- `user_id`: Integer (Foreign Key)
- `ride_id`: Integer (Foreign Key)
- `user_comment`: String (Optional)
- `joined_at`: DateTime
- Constraint: Unique (user_id, ride_id)

### UserOrganizationData
Junction table for User-Organization many-to-many relationship
- `id`: Integer (Primary Key)
- `user_id`: Integer (Foreign Key)
- `organization_id`: Integer (Foreign Key)
- `is_owner`: Boolean
- `is_admin`: Boolean
- `is_driver`: Boolean
- Constraint: Unique (user_id, organization_id)

---

## Admin Features

System administrators (`kennl21@uci.edu`, `bdkeenan@uci.edu`) have special privileges:

- Approve/reject driver applications
- View all pending driver applications
- Update any user's profile
- Delete any user account
- Update any driver's information
- Delete any driver data

Admin status is automatically assigned during registration if the email matches the hardcoded admin list.

---

## Error Responses

All error responses follow this format:

```json
{
  "error": "Error message description"
}
```

### Common Status Codes
- `200`: Success
- `201`: Created
- `204`: No Content (successful deletion)
- `400`: Bad Request (invalid data)
- `401`: Unauthorized (authentication required or invalid token)
- `403`: Forbidden (insufficient permissions)
- `404`: Not Found
- `409`: Conflict (duplicate resource)

---

## Development

### Running Tests
```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=app
```

### Database Migrations
The application automatically creates tables on startup via `db.create_all()`.

For production, consider using Flask-Migrate:
```bash
flask db init
flask db migrate -m "Initial migration"
flask db upgrade
```

---

## Production Deployment

### Environment Variables (Production)
```env
FLASK_ENV=production
SECRET_KEY=<strong-random-secret-key>
DATABASE_URL=postgresql://user:password@host/database
CORS_ORIGINS=https://yourdomain.com
GOOGLE_CLIENT_ID=<production-google-client-id>
GOOGLE_REDIRECT_URI=https://yourdomain.com
```

### Deployment Platforms
- Heroku
- AWS Elastic Beanstalk
- Google Cloud Run
- DigitalOcean App Platform

---

## Tech Stack

- **Framework**: Flask 3.1.2
- **ORM**: SQLAlchemy 2.0.44
- **Database**: SQLite (dev), PostgreSQL (production)
- **Authentication**: Google OAuth 2.0 + JWT
- **CORS**: Flask-CORS

---

## License

MIT License - UC Irvine Rideshare Platform
