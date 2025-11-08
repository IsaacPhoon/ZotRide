import React from "react";
import RequestRideForm from "./RequestRideForm";

const Home = () => {
  return (
    <div className="min-h-screen bg-white text-black px-[2rem]">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 min-h-screen p-[2rem] pt-[8rem] space-x-[8rem]">
        <RequestRideForm />
        <div>
          <h1 className="text-5xl font-bold">An AI generated picture will go here</h1>
        </div>
      </div>
    </div>
  );
};

export default Home;
