import React from "react";
import Navbar from "./components/Navbar";
import Introduction from "./components/Introduction";
import IntroductionGrid from "./components/IntroductionGrid";
const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <Introduction />
      <IntroductionGrid />
    </div>
  );
};

export default App;
