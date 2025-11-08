import React from "react";
import ZotDriverApplication from "./ZotDriverApplication";
import testImage from "../assets/testimage2.avif";

const Profile = () => {
  return (
    <div className="min-h-screen bg-white text-black px-[2rem] py-[4rem]">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-[8rem]">
        <ZotDriverApplication />
        <div className="flex items-center justify-center">
          <img
            src={testImage}
            alt="Driver application illustration"
            className="w-full h-auto rounded-lg shadow-lg"
          />
        </div>
      </div>
    </div>
  );
};

export default Profile;
