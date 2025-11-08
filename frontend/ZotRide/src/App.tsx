import React, { useState } from "react";
import Navbar from "./components/Navbar";
import Introduction from "./components/Introduction";
import IntroductionGrid from "./components/IntroductionGrid";
import Home from "./components/Home";
import Profile from "./components/Profile";

const App: React.FC = () => {
  const [activePage, setActivePage] = useState<"HOME" | "ABOUT" | "PROFILE">("HOME");

  const renderPage = () => {
    switch (activePage) {
      case "HOME":
        return <Home />;
      case "ABOUT":
        return (
          <>
            <Introduction />
            <IntroductionGrid />
          </>
        );
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
