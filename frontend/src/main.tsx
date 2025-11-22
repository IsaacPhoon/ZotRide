import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { APIProvider } from "@vis.gl/react-google-maps";
import "./index.css";
import App from "./App.tsx";
import { AuthProvider } from "./context/AuthContext.tsx";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <APIProvider
        apiKey={GOOGLE_MAPS_API_KEY}
        libraries={["places", "routes", "geocoding"]}
      >
        <AuthProvider>
          <App />
        </AuthProvider>
      </APIProvider>
    </GoogleOAuthProvider>
  </StrictMode>
);
