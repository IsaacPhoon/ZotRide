import React from "react";
import RequestRideForm from "./RequestRideForm";

const Home = () => {
  return (
    <div className="min-h-screen bg-white text-black px-[2rem]">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center min-h-screen p-8">
        <RequestRideForm />
        <div>
          <h1 className="text-5xl font-bold">Welcome to ZotRide</h1>
          <p className="py-6">
            Connect with other UCI students and share rides to campus, events, and beyond.
            Save money, reduce emissions, and make new friends along the way.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Home;
