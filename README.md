# ZotRide - UCI Student Rideshare Platform

> Created by: Kenneth Lin, Brendan Keenan, Isaac Phoon, Ethan Zhao

<!-- Add your screenshot images here -->

ZotRide is a student ridesharing platform made exclusively for UCI students. It connects willing peer drivers with transportation-starved students, making commuting more affordable, convenient, and community-driven. Students can offer or request rides—either free or cost-shared—and create private organizations to coordinate group transportation for events.

## Inspiration

As first-year students without cars, we often found transportation beyond campus expensive and inconvenient. Renting Zipcars or calling Ubers adds up quickly, especially when you don't have anyone to split the cost with. We realized UCI lacked a student ridesharing platform—something simple and secure to connect peers heading in the same direction. ZotRide was born to make transportation more affordable, convenient, and community-driven for UCI students.

## Core Features

- **Google OAuth Authentication** - Secure sign-in restricted to UCI-affiliated users (@uci.edu emails only)
- **Ride Requests & Driver Posts** - Request rides or post rides you're willing to drive
- **Cost Options** - Choose between free rides, split gas, or gas with additional fees
- **Organization Management** - Create and join private student organizations with 6-character access codes
- **Role-Based Permissions** - Owner, admin, and driver roles within organizations
- **Interactive Maps** - Route visualization with Google Maps API showing pickup and destination
- **Driver Verification** - Admin-approved driver registration with license and vehicle data
- **Real-Time Filtering** - Search and filter rides by pickup, destination, time, and more
- **Ride History** - Track joined rides and completed trips
- **Review System** - Rate and review drivers after completing rides

## Tech Stack

### Backend

- **Flask** - Lightweight Python WSGI web framework
- **SQLite** - Development and testing database
- **PostgreSQL** - Production database
- **SQLAlchemy** - ORM and database management
- **JWT** - Token-based authentication with access + refresh tokens
- **Google OAuth 2.0** - Secure authentication for UCI students

### Frontend

- **React 19** - Modern UI framework with hooks and concurrent features
- **TypeScript** - Type safety and better developer experience
- **Vite 7** - Fast build tool and dev server
- **Tailwind CSS 4** - Utility-first styling framework
- **DaisyUI** - Tailwind CSS component library
- **Framer Motion** - Smooth animations and transitions
- **Google Maps API** - Route visualization with Directions and Geocoding APIs

## Project Structure

This is a monorepo containing both the backend API and frontend application:

```
ZotRide/
├── backend/              # Flask API server
│   ├── app/              # Application code (models, routes, utils)
│   │   ├── models/       # Database models (User, Ride, Organization, etc.)
│   │   ├── routes/       # API endpoints (auth, rides, organizations, etc.)
│   │   └── utils/        # Utility functions and helpers
│   ├── run.py            # Server entry point
│   └── README.md         # Backend setup instructions
└── frontend/             # React application
    └── ZotRide/
        ├── src/          # Source code
        │   ├── components/   # React components
        │   ├── context/      # React Context providers
        │   ├── services/     # API client and service layer
        │   └── assets/       # Images and static files
        └── README.md     # Frontend setup instructions
```

## How It Works

1. **Sign in** with your UCI Google account
2. **Request a ride** by entering pickup location, destination, time, and cost preference
3. **Browse rides** posted by drivers or requested by other students
4. **Join a ride** that matches your destination and schedule
5. **Create or join organizations** for coordinated group transportation
6. **Complete rides** and leave reviews for drivers

## Use Cases

- **Daily commuting** - Get to and from campus affordably
- **Airport trips** - Share rides to LAX or SNA with fellow students
- **Event transportation** - Coordinate rides for hackathons, conferences, or club events
- **Grocery runs** - Find rides to nearby shopping centers
- **Organization events** - Manage private ride networks for clubs and student groups
- **Cost sharing** - Split gas money or offer rides to build community

## Development Journey

We built ZotRide in twelve hours at ZotHacks 2025, splitting into frontend and backend teams. We started by designing the database schema and setting up authentication, then built out the API endpoints and React components in parallel. The biggest challenge was coordinating the complex many-to-many relationships between users, rides, and organizations while maintaining clean separation between the frontend and backend. Through clear communication and documentation, we successfully integrated Google OAuth, the Maps API, and Framer Motion animations to create a polished, functional product.

## Getting Started

Detailed setup and run instructions are available in each directory:

1. **Clone the repository**

   ```bash
   git clone https://github.com/IsaacPhoon/ZotRide.git
   cd ZotRide
   ```

2. **Set up backend and frontend**
   - **Backend Setup:** See [backend/README.md](backend/README.md)
   - **Frontend Setup:** See [frontend/ZotRide/README.md](frontend/ZotRide/README.md)

## Future Enhancements

- **Advanced ride filtering** - More granular search options on the home page
- **Profile images** - User avatars for personalization
- **Enhanced driver rating system** - Transparent ratings for safety and trust
- **Event management** - Organizations can create events with automatic ride assignments
- **Driver license verification** - Integration with verification APIs for added security
- **Live location tracking** - Real-time driver location during rides
- **Push notifications** - Ride updates and reminders
- **Mobile application** - Native iOS and Android apps for on-the-go access
- **Payment integration** - Seamless in-app payment processing for cost-shared rides

## License

MIT License - UC Irvine ZotRide Project
