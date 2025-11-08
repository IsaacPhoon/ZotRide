import React from "react";
import testImage from "../assets/testimage.png";

const AboutGrid: React.FC = () => {
  return (
    <section className="min-h-screen bg-white pb-20 px-4">
      <div className="max-w-7xl mx-auto space-y-32">
        {/* First Hero Section - Image on Left, Content on Right */}
        <div className="hero">
          <div className="hero-content flex-col lg:flex-row-reverse gap-12">
            <div className="max-w-md">
              <h2 className="text-5xl font-bold text-gray-900 mb-6">
                Title goes here
              </h2>
              <p className="text-lg text-gray-600">
                This is a text area. Write some cool stuff here
              </p>
            </div>
            <figure>
              <img
                src={testImage}
                alt="Feature illustration"
                className="max-w-sm rounded-lg shadow-2xl"
              />
            </figure>
          </div>
        </div>

        {/* Second Hero Section - Image on Right, Content on Left */}
        <div className="hero">
          <div className="hero-content flex-col lg:flex-row gap-12">
            <div className="max-w-md">
              <h2 className="text-5xl font-bold text-gray-900 mb-6">
                Title goes here
              </h2>
              <p className="text-lg text-gray-600">
                This is a text area. Write some cool stuff here
              </p>
            </div>
            <figure>
              <img
                src={testImage}
                alt="Feature illustration"
                className="max-w-sm rounded-lg shadow-2xl"
              />
            </figure>
          </div>
        </div>

        {/* Third Hero Section - Image on Left, Content on Right */}
        <div className="hero">
          <div className="hero-content flex-col lg:flex-row-reverse gap-12">
            <div className="max-w-md">
              <h2 className="text-5xl font-bold text-gray-900 mb-6">
                Title goes here
              </h2>
              <p className="text-lg text-gray-600">
                This is a text area. Write some cool stuff here
              </p>
            </div>
            <figure>
              <img
                src={testImage}
                alt="Feature illustration"
                className="max-w-sm rounded-lg shadow-2xl"
              />
            </figure>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutGrid;
