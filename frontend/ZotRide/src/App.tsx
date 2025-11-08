import React from "react";
import Navbar from "./components/Navbar";
import Introduction from "./components/Introduction";
import IntroductionGrid from "./components/IntroductionGrid";
const App: React.FC = () => {
  return (
    <div className="flex flex-col bg-white min-h-screen w-full">
        <Navbar />
        <Introduction />
        <IntroductionGrid />
    </div>
  );
};

export default App;
