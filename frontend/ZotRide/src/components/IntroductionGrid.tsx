import React from "react";

const IntroductionGrid: React.FC = () => {
  return (
    <section className="min-h-screen bg-white py-20 px-4">
      <div className="max-w-7xl mx-auto space-y-32">
        {/* First Hero Section - Content on Right */}
        <div className="hero">
          <div className="hero-content flex-col lg:flex-row-reverse justify-end w-full">
            <div className="max-w-md lg:ml-auto">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Title goes here
              </h2>
              <p className="text-gray-600">
                This is a text area. Write some cool stuff here
              </p>
            </div>
          </div>
        </div>

        {/* Second Hero Section - Content on Left */}
        <div className="hero">
          <div className="hero-content flex-col lg:flex-row justify-start w-full">
            <div className="max-w-md lg:mr-auto">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Title goes here
              </h2>
              <p className="text-gray-600">
                This is a text area. Write some cool stuff here
              </p>
            </div>
          </div>
        </div>

        {/* Third Hero Section - Content on Right */}
        <div className="hero">
          <div className="hero-content flex-col lg:flex-row-reverse justify-end w-full">
            <div className="max-w-md lg:ml-auto">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Title goes here
              </h2>
              <p className="text-gray-600">
                This is a text area. Write some cool stuff here
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default IntroductionGrid;
