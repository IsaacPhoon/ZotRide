# ZotRide Frontend

A modern, responsive React + TypeScript rideshare web application for UC Irvine students, built with Vite, featuring real-time ride management, organization coordination, and driver services.

## 🚀 Features

- **User Authentication**: Google OAuth integration for secure UCI student login
- **Ride Management**: Request rides, browse available rides, and join shared trips
- **Driver Portal**: Comprehensive dashboard for drivers to manage rides and accept requests
- **Organizations**: Create and manage student organizations with private ride networks
- **Real-time Updates**: Dynamic ride cards with filtering and search capabilities
- **Interactive Maps**: Google Maps integration with route visualization and geocoding
- **Responsive Design**: Beautiful UI with Framer Motion animations and DaisyUI components
- **Type-Safe**: Full TypeScript support with strict type checking

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Setup](#environment-setup)
- [Running the Application](#running-the-application)
- [Project Structure](#project-structure)
- [Tech Stack](#tech-stack)
- [Key Components](#key-components)
- [API Integration](#api-integration)
- [Styling](#styling)
- [Build & Deployment](#build--deployment)

## Prerequisites

- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **Google Cloud Console** account (for OAuth and Maps API)
- **Backend API**: ZotRide Flask backend running on `http://localhost:5001`

## Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/IsaacPhoon/ZotRide.git
   cd ZotRide/frontend/ZotRide
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

## Environment Setup

Create a `.env` file in the `frontend/ZotRide` directory:

```env
# Google OAuth Client ID
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com

# Google Maps API Key
VITE_GOOGLE_MAPS_API_KEY=your-google-maps-api-key

# Backend API URL (default for development)
VITE_API_URL=http://localhost:5001
```

### Getting API Keys

#### Google OAuth Client ID:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable **Google+ API**
4. Go to **Credentials** → **Create Credentials** → **OAuth Client ID**
5. Select **Web application**
6. Add authorized JavaScript origins: `http://localhost:5173`
7. Add authorized redirect URIs: `http://localhost:5173`
8. Copy the Client ID

#### Google Maps API Key:

1. In Google Cloud Console, enable these APIs:
   - **Maps JavaScript API**
   - **Geocoding API**
   - **Directions API**
2. Go to **Credentials** → **Create Credentials** → **API Key**
3. Restrict the key to the enabled APIs
4. Copy the API Key

## Running the Application

### Development Mode

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

Creates an optimized production build in the `dist/` folder

### Preview Production Build

```bash
npm run preview
```

Preview the production build locally

### Linting

```bash
npm run lint
```

Run ESLint to check for code quality issues

## Project Structure

```
frontend/ZotRide/
├── src/
│   ├── assets/              # Images and static assets
│   ├── components/          # React components
│   │   ├── About.tsx           # Hero section with Google login
│   │   ├── AboutGrid.tsx       # Feature showcase with animations
│   │   ├── AboutPage.tsx       # About page wrapper
│   │   ├── AddressAutocomplete.tsx  # Google Places autocomplete
│   │   ├── AdminPanel.tsx      # Organization admin controls
│   │   ├── ClubJoinRides.tsx   # Organization ride listings
│   │   ├── CreateOrganization.tsx  # Create new organization
│   │   ├── DestinationSearchModal.tsx  # Ride search modal
│   │   ├── DriverPage.tsx      # Driver dashboard
│   │   ├── DriverRideCard.tsx  # Driver's active ride card
│   │   ├── ErrorModal.tsx      # Error display modal
│   │   ├── Home.tsx            # Main home page
│   │   ├── HomeNavCards.tsx    # Navigation cards
│   │   ├── HostRideForm.tsx    # Create driver post form
│   │   ├── JoinOrganization.tsx  # Join organization by code
│   │   ├── JoinRideCard.tsx    # Browse ride card
│   │   ├── JoinRides.tsx       # All available rides
│   │   ├── Navbar.tsx          # Navigation bar
│   │   ├── OrganizationCard.tsx  # Organization display card
│   │   ├── OrganizationDetails.tsx  # Organization management
│   │   ├── OrganizationFunctions.tsx  # Host club rides
│   │   ├── Organizations.tsx   # Organizations page
│   │   ├── RegistrationModal.tsx  # New user registration
│   │   ├── RequestRideForm.tsx  # Create ride request
│   │   ├── RideRequestCard.tsx  # Driver view of requests
│   │   ├── RiderProfile.tsx    # User profile page
│   │   └── RouteMap.tsx        # Google Maps route display
│   ├── context/             # React Context providers
│   │   └── AuthContext.tsx     # Authentication state management
│   ├── services/            # API and service layer
│   │   └── api.ts              # Axios API client with endpoints
│   ├── utils/               # Utility functions
│   ├── App.tsx              # Main app component
│   ├── App.css              # App-specific styles
│   ├── index.css            # Global styles
│   └── main.tsx             # App entry point
├── public/                  # Public static assets
├── index.html               # HTML template
├── package.json             # Dependencies and scripts
├── tsconfig.json            # TypeScript configuration
├── vite.config.ts           # Vite configuration
├── eslint.config.js         # ESLint configuration
└── README.md                # This file
```

## Tech Stack

### Core Framework

- **React 19.1.1**: Modern UI library with hooks and concurrent features
- **TypeScript 5.9.3**: Type-safe JavaScript
- **Vite 7.1.7**: Fast build tool and dev server

### UI & Styling

- **Tailwind CSS 4.1.17**: Utility-first CSS framework
- **DaisyUI 5.4.7**: Tailwind CSS component library
- **Framer Motion 12.23.24**: Animation library for smooth transitions

### Maps & Location

- **@vis.gl/react-google-maps 1.7.1**: React wrapper for Google Maps
- **Google Maps JavaScript API**: Maps, Directions, and Geocoding APIs

### Authentication

- **@react-oauth/google 0.12.2**: Google OAuth integration

### HTTP Client

- **Axios 1.13.2**: Promise-based HTTP client

### Development Tools

- **ESLint 9.36.0**: Code linting
- **TypeScript ESLint**: TypeScript-specific linting rules

## Key Components

### Authentication Flow

1. **About.tsx**: Landing page with Google Sign-In button
2. **RegistrationModal.tsx**: Collects additional info for new users
3. **AuthContext.tsx**: Manages authentication state globally

### Ride Management

- **Home.tsx**: Main dashboard with ride request form and route map
- **JoinRides.tsx**: Browse and join available rides with filtering
- **RequestRideForm.tsx**: Create new ride requests
- **JoinRideCard.tsx**: Display ride details with join functionality

### Driver Features

- **DriverPage.tsx**: Driver dashboard with current rides and requests
- **HostRideForm.tsx**: Create driver-hosted rides
- **RideRequestCard.tsx**: View and accept rider requests
- **DriverRideCard.tsx**: Manage active driver rides

### Organization Management

- **Organizations.tsx**: View all organizations
- **CreateOrganization.tsx**: Create new student organizations
- **JoinOrganization.tsx**: Join via 6-character access code
- **OrganizationDetails.tsx**: Organization dashboard and management
- **AdminPanel.tsx**: Admin controls for member and driver management
- **ClubJoinRides.tsx**: Organization-specific ride listings

### Maps Integration

- **RouteMap.tsx**: Display pickup/destination markers and route
  - Geocoding for address → coordinates conversion
  - Directions API for route visualization
  - Individual pin display for single addresses
  - Blue route polyline with distance/duration info

### UI Components

- **Navbar.tsx**: Main navigation with auth state
- **ErrorModal.tsx**: Consistent error display
- **AddressAutocomplete.tsx**: Google Places autocomplete input

## API Integration

All API calls are centralized in `src/services/api.ts`:

### API Structure

```typescript
// Base configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

// API modules
- authAPI: Authentication endpoints
- organizationAPI: Organization management
- rideAPI: Ride creation and management
- driverAPI: Driver-specific operations
- profileAPI: User profile updates
- userAPI: User data retrieval
```

### Key Features

- **JWT Token Management**: Automatic token attachment via interceptors
- **Error Handling**: Centralized error response handling
- **Type Safety**: Full TypeScript interfaces for all requests/responses
- **Token Refresh**: Automatic token refresh on 401 responses
- **Debug Logging**: Optional API call logging for development

### Example Usage

```typescript
import { rideAPI, authAPI } from "../services/api";

// Create a ride
const newRide = await rideAPI.createRide({
  pickup_address: "123 Main St",
  destination_address: "456 Elm St",
  pickup_time: "2025-01-15T10:00:00",
  price_option: "free",
});

// Get current user
const user = await authAPI.getCurrentUser();
```

## Styling

### Tailwind CSS + DaisyUI

The app uses Tailwind CSS with DaisyUI components for consistent styling:

```tsx
// Example component with Tailwind + DaisyUI
<button className="btn btn-primary rounded-full hover:scale-105 transition">
  Join Ride
</button>

<div className="card bg-white/80 backdrop-blur-sm shadow-xl">
  <div className="card-body">
    <h2 className="card-title">Ride Details</h2>
  </div>
</div>
```

### Framer Motion Animations

```tsx
import { motion } from "framer-motion";

<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5 }}
>
  Animated content
</motion.div>;
```

### Custom Gradients & Effects

- **Gradient backgrounds**: `bg-gradient-to-br from-blue-50 via-white to-yellow-50`
- **Frosted glass**: `bg-white/80 backdrop-blur-sm`
- **Animated blobs**: Floating background circles with `mix-blend-multiply`

## Build & Deployment

### Production Build

```bash
npm run build
```

### Environment Variables for Production

```env
VITE_GOOGLE_CLIENT_ID=your-production-client-id
VITE_GOOGLE_MAPS_API_KEY=your-production-maps-key
VITE_API_URL=https://api.yourdomain.com
```

### Deployment Platforms

#### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

#### Netlify

```bash
# Build command: npm run build
# Publish directory: dist
```

#### GitHub Pages

```bash
# Add to package.json
"homepage": "https://username.github.io/zotride"

# Deploy
npm run build
gh-pages -d dist
```

### Important Configuration

#### vite.config.ts

```typescript
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:5001",
        changeOrigin: true,
      },
    },
  },
});
```

## Browser Support

- Chrome/Edge (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)

## Development Tips

### Hot Module Replacement (HMR)

Vite provides instant HMR - changes appear immediately without full page reload.

### TypeScript Strict Mode

The project uses strict TypeScript checking. Ensure all types are properly defined.

### ESLint Configuration

Follow the ESLint rules defined in `eslint.config.js` for consistent code style.

### Debugging

- React DevTools: Install browser extension for component inspection
- Network Tab: Monitor API calls and responses
- Console Logging: API logging enabled via `ENABLE_API_LOGGING` flag in api.ts

## Troubleshooting

### Google Maps Not Loading

- Verify `VITE_GOOGLE_MAPS_API_KEY` is set correctly
- Ensure Maps JavaScript API is enabled in Google Cloud Console
- Check browser console for API key errors

### Authentication Errors

- Verify `VITE_GOOGLE_CLIENT_ID` matches your OAuth credentials
- Ensure authorized JavaScript origins include your dev URL
- Clear browser cookies/localStorage if needed

### API Connection Issues

- Verify backend is running on `http://localhost:5001`
- Check `VITE_API_URL` environment variable
- Ensure CORS is properly configured on backend

## Contributing

1. Create a feature branch: `git checkout -b feature/amazing-feature`
2. Commit changes: `git commit -m 'Add amazing feature'`
3. Push to branch: `git push origin feature/amazing-feature`
4. Open a Pull Request

## License

MIT License - UC Irvine ZotRide Project

## Contact

Project maintained by UCI students for ZotHacks 2025
