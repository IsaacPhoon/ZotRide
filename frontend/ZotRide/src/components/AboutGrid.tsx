import React from "react";
import testImage from "../assets/testimage.png";

const AboutGrid: React.FC = () => {
  return (
    <section id="about-grid" className="min-h-screen bg-white pb-20 px-4">
      <div className="max-w-7xl mx-auto space-y-32">
        {/* First Hero Section - Image on Left, Content on Right */}
        <div className="hero">
          <div className="hero-content flex-col lg:flex-row-reverse justify-between gap-16 w-full">
            <div className="max-w-lg lg:ml-auto">
              <h2 className="text-6xl font-bold text-gray-900 mb-6">
                Don't have a car? Arrange a ride with ZotRide!
              </h2>
              <p className="text-xl text-gray-600">
                This is a text area. Write some cool stuff here
              </p>
            </div>
            <figure className="lg:mr-auto">
              <img
                src={testImage}
                alt="Feature illustration"
                className="max-w-lg rounded-lg shadow-2xl"
              />
            </figure>
          </div>
        </div>

        {/* Second Hero Section - Image on Right, Content on Left */}
        <div className="hero">
          <div className="hero-content flex-col lg:flex-row justify-between gap-16 w-full">
            <div className="max-w-lg lg:mr-auto">
              <h2 className="text-6xl font-bold text-gray-900 mb-6">
                Club needs ride planning? We've got you covered!
              </h2>
              <p className="text-xl text-gray-600">
                This is a text area. Write some cool stuff here
              </p>
            </div>
            <figure className="lg:ml-auto">
              <img
                src={testImage}
                alt="Feature illustration"
                className="max-w-lg rounded-lg shadow-2xl"
              />
            </figure>
          </div>
        </div>

        {/* Third Hero Section - Image on Left, Content on Right */}
        <div className="hero">
          <div className="hero-content flex-col lg:flex-row-reverse justify-between gap-16 w-full">
            <div className="max-w-lg lg:ml-auto">
              <h2 className="text-6xl font-bold text-gray-900 mb-6">
                Low on Money? Make some quick cash
              </h2>
              <p className="text-xl text-gray-600">
                This is a text area. Write some cool stuff here
              </p>
            </div>
            <figure className="lg:mr-auto">
              <img
                src={testImage}
                alt="Feature illustration"
                className="max-w-lg rounded-lg shadow-2xl"
              />
            </figure>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutGrid;
