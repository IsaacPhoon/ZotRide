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

**Error Responses:**
- `400`: Invalid request data - Missing Google token
- `401`: Invalid Google token or non-UCI email

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

**Error Responses:**
- `400`: Missing required fields (token, gender, preferred_contact), invalid gender value (must be 0, 1, or 2), or user already exists
- `401`: Invalid Google token

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

**Error Responses:**
- `401`: Token is invalid or expired

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

**Error Responses:**
- `400`: Token is required
- `401`: Invalid token format or user not found

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

**Error Responses:**
- `401`: Not authenticated

---

### User Routes

#### `POST /users`
**DEPRECATED**: Use `/api/auth/google/register` instead for user registration.

This endpoint is kept for backward compatibility and testing purposes only.

Create a new user.

**Request Body:**
```json
{
  "email": "user@example.edu",
  "name": "John Doe",
  "gender": 0,  // 0: Male, 1: Female, 2: Other
  "preferred_contact": "email or phone",
  "is_system_admin": false  // Optional, defaults to False
}
```

**Response (201):** User created successfully with user data

**Error Responses:**
- `400`: Invalid request data, missing required fields, or non-UCI email
- `409`: User with this email already exists

---

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

**Error Responses:**
- `401`: Not authenticated

---

#### `GET /users/:user_id`
Get a specific user by ID.

**Headers:** `Authorization: Bearer <token>`

**Response (200):** User object

**Error Responses:**
- `401`: Not authenticated
- `404`: User not found

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

**Error Responses:**
- `401`: Not authenticated
- `403`: Forbidden - trying to update another user's profile
- `404`: User not found

---

#### `DELETE /users/:user_id`
Delete a user account. Users can only delete their own account (or admins can delete any).

**Headers:** `Authorization: Bearer <token>`

**Response (204):** No content

**Error Responses:**
- `401`: Not authenticated
- `403`: Forbidden - trying to delete another user's account
- `404`: User not found

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

**Error Responses:**
- `401`: Not authenticated
- `404`: User not found

---

#### `GET /users/:user_id/rides`
Get all rides a user has joined.

**Headers:** `Authorization: Bearer <token>`

**Response (200):** Array of ride objects with user's comment and join time

**Error Responses:**
- `401`: Not authenticated
- `404`: User not found

---

#### `GET /users/:user_id/driver-data`
Get driver data for a specific user.

**Headers:** `Authorization: Bearer <token>`

**Response (200):** Driver data object or 404 if user is not a driver

**Error Responses:**
- `401`: Not authenticated
- `404`: User not found or user is not a driver

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

**Error Responses:**
- `400`: Missing required fields (license_image, vehicle_data, license_plate)
- `401`: Not authenticated
- `409`: Driver data already exists for this user

---

#### `GET /drivers`
Get all drivers with optional filtering.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `approved` (optional): Filter by approval status (true/false)
- `limit` (optional): Maximum number to return
- `offset` (optional): Number to skip

**Response (200):** Array of driver objects

**Error Responses:**
- `401`: Not authenticated

---

#### `GET /drivers/:driver_id`
Get a specific driver by ID.

**Headers:** `Authorization: Bearer <token>`

**Response (200):** Driver object

**Error Responses:**
- `401`: Not authenticated
- `404`: Driver not found

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

**Note:** Approval status can only be changed via the approve endpoint.

**Response (200):** Updated driver object

**Error Responses:**
- `401`: Not authenticated
- `403`: Forbidden - trying to update another driver's data
- `404`: Driver not found

---

#### `DELETE /drivers/:driver_id`
Delete driver data. Drivers can only delete their own data (or admins can delete any).

**Headers:** `Authorization: Bearer <token>`

**Response (204):** No content

**Error Responses:**
- `400`: Cannot delete driver with active rides
- `401`: Not authenticated
- `403`: Forbidden - trying to delete another driver's data
- `404`: Driver not found

**Note:** Deleting a driver will also delete all their reviews (cascade delete).

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

**Error Responses:**
- `400`: Missing required field: approved
- `401`: Not authenticated
- `403`: User is not a system admin
- `404`: Driver not found

---

#### `GET /drivers/:driver_id/rides`
Get all rides hosted by a specific driver.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `status` (optional): Filter by ride status (active/completed/cancelled)

**Response (200):** Array of ride objects

**Error Responses:**
- `401`: Not authenticated
- `404`: Driver not found

---

#### `GET /drivers/pending-approval`
**ADMIN ONLY** - Get all drivers pending approval.

**Headers:** `Authorization: Bearer <token>`

**Response (200):** Array of pending driver objects

**Error Responses:**
- `401`: Not authenticated
- `403`: User is not a system admin

---

### Ride Routes

#### `POST /rides`
Create a new ride (driver post or rider request).

**IMPORTANT:** If `driver_id` is not provided (rider request), the current authenticated user is automatically added as a rider to the newly created ride.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "pickup_address": "123 Main St",
  "pickup_time": "2025-01-15T10:00:00",
  "destination_address": "456 Elm St",
  "max_riders": 4,  // Optional - defaults to 4
  "price_option": "free",  // Options: 'free', 'gas', 'gas with fee'
  "driver_id": 1,  // Optional - if null, current user is added as rider
  "organization_id": 1,  // Optional
  "driver_comment": "I prefer quiet passengers" , // Optional - only for driver posts
  "rider_comment": "I am bringing snacks!" // Optional - only for rider requests
}
```

**Response (201):** Created ride object (with current user added as rider if no driver_id)

**Error Responses:**
- `400`: Missing required fields (pickup_address, pickup_time, destination_address, price_option)
- `401`: Not authenticated
- `403`: Driver is not approved
- `404`: Driver or organization not found

---

#### `GET /rides`
Get all rides with optional filtering.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `status` (optional): active/completed
- `has_driver` (optional): true/false
- `organization_id` (optional): Filter by organization; if not provided, excludes organization rides
- `limit` (optional): Maximum number to return
- `offset` (optional): Number to skip

**Response (200):** Array of ride objects

**Error Responses:**
- `401`: Not authenticated

---

#### `GET /rides/:ride_id`
Get a specific ride by ID.

**Headers:** `Authorization: Bearer <token>`

**Response (200):** Ride object

**Error Responses:**
- `401`: Not authenticated
- `404`: Ride not found

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
  "status": "active",  // Options: 'active', 'completed', 'cancelled'
  "driver_id": 2,  // Can be set to add a driver to a rider request
  "driver_comment": "Updated comment"
}
```

**Note:** Completed rides can only update `driver_comment`

**Response (200):** Updated ride object

**Error Responses:**
- `400`: Invalid request data
- `401`: Not authenticated
- `403`: Cannot update ride details after completion (only driver_comment allowed), or driver is not approved
- `404`: Ride not found or driver not found

---

#### `DELETE /rides/:ride_id`
Delete a ride. Only allowed if the current user is the only rider with no driver, or is a driver with no riders.

**Headers:** `Authorization: Bearer <token>`

**Response (204):** No content

**Error Responses:**
- `401`: Not authenticated
- `403`: Unauthorized - only rider or driver can delete if there are no other riders or drivers
- `404`: Ride not found

**Note:** Deleting a ride will also delete all associated reviews and rider associations.

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

**Error Responses:**
- `400`: Cannot complete a ride without a driver
- `401`: Not authenticated
- `403`: Only the assigned driver can complete this ride, or ride already completed
- `404`: Ride not found or driver not found

---

#### `POST /rides/:ride_id/join_rider`
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

**Error Responses:**
- `400`: Ride is full, user already joined, or ride is not active
- `401`: Not authenticated
- `403`: Driver cannot join their own ride as a rider
- `404`: Ride not found

---

#### `POST /rides/:ride_id/join_driver`
Accept a ride request as a driver (join a ride as the driver).

**Headers:** `Authorization: Bearer <token>`

**Request Body (optional):**
```json
{
  "driver_comment": "Looking forward to driving!"
}
```

**Response (200):**
```json
{
  "message": "Successfully joined the ride as driver",
  "ride": { /* ride data */ }
}
```

**Error Responses:**
- `400`: Ride already has a driver, ride is not active, or user is not registered as a driver
- `401`: Not authenticated
- `403`: Cannot accept your own ride request as a driver, or driver is not approved
- `404`: Ride not found

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

**Error Responses:**
- `401`: Not authenticated
- `404`: Ride not found or user has not joined this ride

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

**Error Responses:**
- `401`: Not authenticated
- `404`: Ride not found

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

**Error Responses:**
- `401`: Not authenticated

---

#### `GET /rides/rider-requests`
Get all rider requests (rides without a driver).

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `limit` (optional)
- `offset` (optional)

**Response (200):** Array of rider request ride objects

**Error Responses:**
- `401`: Not authenticated

---

#### `GET /rides/driver-posts`
Get all driver posts (rides with a driver).

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `limit` (optional)
- `offset` (optional)

**Response (200):** Array of driver post ride objects

**Error Responses:**
- `401`: Not authenticated

---

### Organization Routes

#### `POST /organizations`
Create a new organization. The authenticated user becomes the owner. A unique 6-character alphanumeric access code is automatically generated.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "name": "UCI Cycling Club",
  "description": "For cyclists at UCI"  // Optional
}
```

**Response (201):**
```json
{
  "id": 1,
  "name": "UCI Cycling Club",
  "description": "For cyclists at UCI",
  "organization_rides": [],
  "access_code": "A3K9M2"  // Automatically generated
}
```

**Error Responses:**
- `400`: Missing required field: name
- `401`: Authentication required
- `409`: Organization with this name already exists

---

#### `GET /organizations`
Get all organizations.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `limit` (optional)
- `offset` (optional)

**Response (200):** Array of organization objects

**Error Responses:**
- `401`: Authentication required

---

#### `GET /organizations/:org_id`
Get a specific organization by ID.

**Headers:** `Authorization: Bearer <token>`

**Response (200):** Organization object

**Error Responses:**
- `401`: Authentication required
- `404`: Organization not found

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

**Error Responses:**
- `401`: Authentication required
- `403`: User is not authorized to update this organization
- `404`: Organization not found

---

#### `DELETE /organizations/:org_id`
Delete an organization. Only the owner can delete.

**Headers:** `Authorization: Bearer <token>`

**Response (204):** No content

**Error Responses:**
- `401`: Authentication required
- `403`: User is not the owner of this organization
- `404`: Organization not found

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

**Error Responses:**
- `401`: Authentication required
- `404`: Organization not found

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

**Response (200):**
```json
{
  "message": "Member added successfully"
}
```

**Error Responses:**
- `400`: Missing required field: user_id
- `401`: Authentication required
- `403`: User is not authorized to add members
- `404`: Organization or user not found
- `409`: User is already a member of this organization

---

#### `DELETE /organizations/:org_id/members/:user_id`
Remove a member from an organization. Only owner or admin can remove members.

**Headers:** `Authorization: Bearer <token>`

**Response (204):** No content

**Error Responses:**
- `400`: Cannot remove the organization owner
- `401`: Authentication required
- `403`: User is not authorized to remove members
- `404`: Organization or membership not found

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

**Response (200):** Updated member data

**Error Responses:**
- `400`: Cannot modify owner status
- `401`: Authentication required
- `403`: User is not authorized to update member roles, or only owner can grant admin privileges
- `404`: Organization or member not found

---

#### `GET /organizations/:org_id/drivers`
Get all approved drivers in an organization.

**Headers:** `Authorization: Bearer <token>`

**Response (200):** Array of driver objects

**Error Responses:**
- `401`: Authentication required
- `404`: Organization not found

---

#### `GET /organizations/:org_id/rides`
Get all rides associated with an organization.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `status` (optional): Filter by ride status

**Response (200):** Array of ride objects

**Error Responses:**
- `401`: Authentication required
- `404`: Organization not found

---

#### `POST /organizations/join`
Join an organization using its access code. The authenticated user will be added as a regular member (not owner, not admin, not driver).

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "access_code": "A3K9M2"  // 6-character alphanumeric code (case-insensitive)
}
```

**Response (200):**
```json
{
  "message": "Successfully joined the organization",
  "organization": {
    "id": 1,
    "name": "UCI Cycling Club",
    "description": "For cyclists at UCI",
    "organization_rides": [],
    "access_code": "A3K9M2"
  }
}
```

**Error Responses:**
- `400`: Missing required field: access_code
- `401`: Authentication required
- `404`: Organization not found with this access code
- `409`: You are already a member of this organization

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
  "stars": 4.5,  // 0.5 to 5.0
  "comment": "Great driver!"
}
```

**Notes:**
- Can only review after ride is completed
- One review per ride per user
- Author is automatically set from authenticated user

**Response (201):** Created review object

**Error Responses:**
- `400`: Missing required fields (driver_id, ride_id, stars, comment), stars must be between 0.5 and 5, or ride was not hosted by the specified driver
- `401`: Authentication required
- `403`: Cannot review a ride that is not completed, or must have been a rider on this ride to review it
- `404`: Driver or ride not found
- `409`: You have already reviewed this ride

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

**Error Responses:**
- `401`: Authentication required

---

#### `GET /reviews/:review_id`
Get a specific review by ID.

**Headers:** `Authorization: Bearer <token>`

**Response (200):** Review object

**Error Responses:**
- `401`: Authentication required
- `404`: Review not found

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

**Error Responses:**
- `400`: Stars must be between 0.5 and 5
- `401`: Authentication required
- `403`: Not authorized to update this review
- `404`: Review not found

---

#### `DELETE /reviews/:review_id`
Delete a review. Only the author can delete their own review.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "message": "Review deleted successfully"
}
```

**Error Responses:**
- `401`: Authentication required
- `403`: Not authorized to delete this review
- `404`: Review not found

---

#### `GET /drivers/:driver_id/reviews`
Get all reviews for a specific driver with average rating.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `limit` (optional): Maximum number of reviews to return
- `offset` (optional): Number of reviews to skip
- `min_stars` (optional): Filter by minimum star rating

**Response (200):**
```json
{
  "driver_id": 1,
  "average_rating": 4.5,
  "total_reviews": 10,
  "reviews": [ /* array of review objects */ ]
}
```

**Error Responses:**
- `401`: Authentication required
- `404`: Driver not found

---

#### `GET /rides/:ride_id/reviews`
Get all reviews for a specific ride.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "ride_id": 1,
  "total_reviews": 3,
  "reviews": [ /* array of review objects */ ]
}
```

**Error Responses:**
- `401`: Authentication required
- `404`: Ride not found

---

#### `GET /users/:user_id/reviews`
Get all reviews authored by a specific user.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `limit` (optional): Maximum number of reviews to return
- `offset` (optional): Number of reviews to skip

**Response (200):**
```json
{
  "user_id": 1,
  "total_reviews": 5,
  "reviews": [ /* array of review objects */ ]
}
```

**Error Responses:**
- `401`: Authentication required
- `404`: User not found

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
- `status`: String (active/completed)
- `driver_comment`: String (Optional)
- `driver_id`: Integer (Foreign Key, Optional)
- `organization_id`: Integer (Foreign Key, Optional)
- Computed: `available_seats`, `is_full`

### Organization
- `id`: Integer (Primary Key)
- `name`: String (Unique)
- `description`: String (Optional)
- `access_code`: String (6 characters, Unique) - Automatically generated alphanumeric code
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
