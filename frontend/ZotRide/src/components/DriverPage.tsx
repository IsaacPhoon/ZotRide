import React from "react";
import HostRideForm from "./HostRideForm";
import HostRideCards from "./HotedRideCards";
import testImage from "../assets/testimage2.avif";

const DriverPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white text-black px-[2rem] py-[4rem]">
      {/* Host Ride Cards Section */}
      <div className="mb-[8rem]">
        <h2 className="text-4xl font-bold mb-8">Your Hosted Rides</h2>
        <HostRideCards />
      </div>

      {/* Host Ride Form Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-[8rem]">
        <HostRideForm />
        <div className="flex items-center justify-center">
          <img
            src={testImage}
            alt="Ride illustration"
            className="w-full h-auto rounded-lg shadow-lg"
          />
        </div>
      </div>
    </div>
  );
};

export default DriverPage;
