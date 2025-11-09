import React, { useState } from "react";
import { GoogleLogin } from '@react-oauth/google';
import type { CredentialResponse } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import RegistrationModal from './RegistrationModal';
import ErrorModal from './ErrorModal';

const About: React.FC = () => {
  const { login, user } = useAuth();
  const [showRegistration, setShowRegistration] = useState(false);
  const [registrationData, setRegistrationData] = useState<{
    googleToken: string;
    name: string;
    email: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const scrollToAboutGrid = () => {
    const element = document.getElementById("about-grid");
    element?.scrollIntoView({ behavior: "smooth" });
  };

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    if (!credentialResponse.credential) {
      setError('No credential received from Google');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // credentialResponse.credential is the Google ID token (JWT format)
      const result = await authAPI.verifyGoogleToken(credentialResponse.credential);

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
      console.error('Google Sign-In Error:', err);
      setError(err.response?.data?.error || 'Failed to sign in with Google. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError('Google Sign-In was unsuccessful. Please try again.');
  };

  const handleRegistration = async (gender: number, preferredContact: string) => {
    if (!registrationData) return;

    setIsLoading(true);
    setError('');

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
      console.error('Registration Error:', err);
      setError(err.response?.data?.error || 'Failed to complete registration. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseRegistration = () => {
    setShowRegistration(false);
    setRegistrationData(null);
    setError('');
  };

  return (
    <section className="min-h-screen flex flex-col items-center justify-center px-[2rem]">
      <div className="text-center max-w-4xl">
        <h1 className="text-7xl md:text-8xl font-bold text-black mb-4">
          This is
          <br />
          ZotRide
        </h1>

        <p className="text-gray-600 text-lg mb-8">
          Where Anteaters ride together.
        </p>

        <div className="mb-8 flex justify-center">
          {user ? (
            <div className="text-lg text-gray-700">
              Welcome back, {user.name}!
            </div>
          ) : (
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              text="signin_with"
              shape="pill"
              theme="outline"
              size="large"
            />
          )}
        </div>

        {isLoading && (
          <div className="mb-4 text-gray-600 text-sm">Signing in...</div>
        )}

        <button
          onClick={scrollToAboutGrid}
          className="flex flex-col items-center gap-2 cursor-pointer bg-transparent border-none hover:opacity-70 transition-opacity mx-auto"
        >
          <p className="text-black text-sm font-medium tracking-wider">
            LEARN MORE
          </p>
          <svg
            className="w-6 h-6 text-black"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </button>
      </div>

      {/* Error Modal */}
      <ErrorModal message={error} onClose={() => setError('')} />

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
