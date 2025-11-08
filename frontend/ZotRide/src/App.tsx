import React, { useState } from "react";
import Navbar from "./components/Navbar";
import Home from "./components/Home";
import Profile from "./components/Profile";
import AboutPage from "./components/AboutPage";
import DriverPage from "./components/DriverPage";

const App: React.FC = () => {
  const [activePage, setActivePage] = useState<
    "HOME" | "ABOUT" | "DRIVER" | "PROFILE"
  >("HOME");

  const renderPage = () => {
    switch (activePage) {
      case "HOME":
        return <Home />;
      case "ABOUT":
        return (
          <>
            <AboutPage />
          </>
        );
      case "DRIVER":
        return <DriverPage />;
      case "PROFILE":
        return <Profile />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col bg-white min-h-screen w-full no-scrollbar">
      <Navbar activeItem={activePage} setActiveItem={setActivePage} />
      {renderPage()}
    </div>
  );
};

export default App;
