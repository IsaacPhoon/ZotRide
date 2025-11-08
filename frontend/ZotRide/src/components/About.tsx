import React from "react";

const About: React.FC = () => {
  const scrollToAboutGrid = () => {
    const element = document.getElementById("about-grid");
    element?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="text-center max-w-4xl">
        <h1 className="text-7xl md:text-8xl font-bold text-gray-900 mb-4">
          This is
          <br />
          ZotRide
        </h1>

        <p className="text-gray-600 text-lg mb-8">
          Less is more. Think minimally.
        </p>

        <button className="border-2 border-gray-900 text-gray-900 px-8 py-3 rounded-full text-sm font-medium hover:bg-gray-900 hover:text-white transition-colors mb-8">
          UCI Sign In
        </button>

        <button
          onClick={scrollToAboutGrid}
          className="flex flex-col items-center gap-2 cursor-pointer bg-transparent border-none hover:opacity-70 transition-opacity mx-auto"
        >
          <p className="text-gray-900 text-sm font-medium tracking-wider">
            LEARN MORE
          </p>
          <svg
            className="w-6 h-6 text-gray-900"
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
    </section>
  );
};

export default About;
