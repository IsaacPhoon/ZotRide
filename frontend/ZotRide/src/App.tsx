import React, { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import Home from "./components/Home";
import Profile from "./components/Profile";
import AboutPage from "./components/AboutPage";
import DriverPage from "./components/DriverPage";
import Organizations from "./components/Organizations";
import { useAuth } from "./context/AuthContext";

const App: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [activePage, setActivePage] = useState<
    "HOME" | "ABOUT" | "DRIVER" | "ORGANIZATIONS" | "PROFILE"
  >("ABOUT");

  // Redirect to ABOUT if user logs out while on a protected page
  useEffect(() => {
    if (!isAuthenticated && activePage !== "ABOUT") {
      setActivePage("ABOUT");
    }
  }, [isAuthenticated, activePage]);

  const handleSetActivePage = (
    page: "HOME" | "ABOUT" | "DRIVER" | "ORGANIZATIONS" | "PROFILE"
  ) => {
    // Only allow navigation to protected pages if authenticated
    if (page === "ABOUT" || isAuthenticated) {
      setActivePage(page);
    }
  };

  const renderPage = () => {
    // Show loading state while checking auth
    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-black">Loading...</p>
        </div>
      );
    }

    switch (activePage) {
      case "HOME":
        return isAuthenticated ? (
          <Home setActivePage={handleSetActivePage} />
        ) : (
          <AboutPage />
        );
      case "ABOUT":
        return <AboutPage />;
      case "DRIVER":
        return isAuthenticated ? <DriverPage /> : <AboutPage />;
      case "ORGANIZATIONS":
        return isAuthenticated ? <Organizations /> : <AboutPage />;
      case "PROFILE":
        return isAuthenticated ? <Profile /> : <AboutPage />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col bg-white min-h-screen w-full no-scrollbar">
      <Navbar
        activeItem={activePage}
        setActiveItem={handleSetActivePage}
        isAuthenticated={isAuthenticated}
      />
      {renderPage()}
    </div>
  );
};

export default App;
