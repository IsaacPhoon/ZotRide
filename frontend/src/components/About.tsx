import React, { useState } from "react";
import { motion } from "framer-motion";
import { GoogleLogin } from "@react-oauth/google";
import type { CredentialResponse } from "@react-oauth/google";
import { useAuth } from "../context/AuthContext";
import { authAPI } from "../services/api";
import RegistrationModal from "./RegistrationModal";
import ErrorModal from "./ErrorModal";

const About: React.FC = () => {
  const { login, user } = useAuth();
  const [showRegistration, setShowRegistration] = useState(false);
  const [registrationData, setRegistrationData] = useState<{
    googleToken: string;
    name: string;
    email: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const scrollToAboutGrid = () => {
    const element = document.getElementById("about-grid");
    element?.scrollIntoView({ behavior: "smooth" });
  };

  const handleGoogleSuccess = async (
    credentialResponse: CredentialResponse
  ) => {
    if (!credentialResponse.credential) {
      setError("No credential received from Google");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // credentialResponse.credential is the Google ID token (JWT format)
      const result = await authAPI.verifyGoogleToken(
        credentialResponse.credential
      );

      if (result.exists && result.token && result.user) {
        // Existing user - login
        login(result.token, result.user);
      } else if (!result.exists && result.email && result.name) {
        // New user - show registration modal
        setRegistrationData({
          googleToken: credentialResponse.credential,
          name: result.name,
          email: result.email,
        });
        setShowRegistration(true);
      }
    } catch (err: any) {
      console.error("Google Sign-In Error:", err);
      setError(
        err.response?.data?.error ||
          "Failed to sign in with Google. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError("Google Sign-In was unsuccessful. Please try again.");
  };

  const handleRegistration = async (
    gender: number,
    preferredContact: string
  ) => {
    if (!registrationData) return;

    setIsLoading(true);
    setError("");

    try {
      const result = await authAPI.registerUser(
        registrationData.googleToken,
        gender,
        preferredContact
      );

      // Registration successful - login
      login(result.token, result.user);
      setShowRegistration(false);
      setRegistrationData(null);
      // You can add navigation here if needed
    } catch (err: any) {
      console.error("Registration Error:", err);
      setError(
        err.response?.data?.error ||
          "Failed to complete registration. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseRegistration = () => {
    setShowRegistration(false);
    setRegistrationData(null);
    setError("");
  };

  return (
    <section className="min-h-screen flex flex-col items-center justify-center px-[2rem] relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-yellow-50">
      {/* Animated background circles */}
      <motion.div
        className="absolute top-20 left-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30"
        animate={{
          scale: [1, 1.2, 1],
          x: [0, 50, 0],
          y: [0, 30, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute bottom-20 right-10 w-72 h-72 bg-yellow-200 rounded-full mix-blend-multiply filter blur-xl opacity-30"
        animate={{
          scale: [1, 1.1, 1],
          x: [0, -30, 0],
          y: [0, -50, 0],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute top-1/2 left-1/2 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-20"
        animate={{
          scale: [1, 1.3, 1],
          rotate: [0, 180, 360],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "linear",
        }}
      />

      <div className="text-center max-w-4xl relative z-10">
        {/* Animated badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-block mb-6"
        >
          <div className="badge badge-lg badge-outline border-2 border-black text-black font-semibold px-6 py-4 text-sm">
            🚗 UCI's Ride-Sharing Platform
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-7xl md:text-8xl font-bold text-black mb-4"
        >
          This is
          <br />
          <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-yellow-500 bg-clip-text text-transparent">
            ZotRide
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-gray-600 text-lg mb-8"
        >
          Where Anteaters ride together.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mb-8 flex justify-center"
        >
          {user ? (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="bg-white/80 backdrop-blur-sm rounded-full px-8 py-4 shadow-lg border-2 border-black"
            >
              <div className="text-lg text-gray-700 font-medium">
                Welcome back,{" "}
                <span className="font-bold text-black">{user.name}</span>! 👋
              </div>
            </motion.div>
          ) : (
            <div className="bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                text="signin_with"
                shape="pill"
                theme="outline"
                size="large"
              />
            </div>
          )}
        </motion.div>

        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-4"
          >
            <span className="loading loading-spinner loading-lg text-black"></span>
            <p className="text-gray-600 text-sm mt-2">Signing in...</p>
          </motion.div>
        )}

        <motion.button
          onClick={scrollToAboutGrid}
          className="flex flex-col items-center gap-2 cursor-pointer bg-transparent border-none hover:opacity-70 transition-opacity mx-auto group"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          whileHover={{ y: -5 }}
        >
          <p className="text-black text-sm font-medium tracking-wider">
            LEARN MORE
          </p>
          <motion.svg
            className="w-6 h-6 text-black"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            animate={{ y: [0, 5, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </motion.svg>
        </motion.button>
      </div>

      {/* Error Modal */}
      <ErrorModal message={error} onClose={() => setError("")} />

      {/* Registration Modal */}
      {showRegistration && registrationData && (
        <RegistrationModal
          name={registrationData.name}
          email={registrationData.email}
          onSubmit={handleRegistration}
          onClose={handleCloseRegistration}
          isLoading={isLoading}
        />
      )}
    </section>
  );
};

export default About;
