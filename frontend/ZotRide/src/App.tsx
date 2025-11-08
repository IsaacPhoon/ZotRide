import React from "react";
import Navbar from "./components/Navbar";
import AboutPage from "./components/AboutPage";

const App: React.FC = () => {
  return (
    <div className="flex flex-col bg-white min-h-screen w-full">
      <Navbar />
      <AboutPage />
    </div>
  );
};

export default App;
