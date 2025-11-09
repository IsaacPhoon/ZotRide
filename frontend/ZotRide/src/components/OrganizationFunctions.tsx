import { useState } from "react";
import testImage from "../assets/testimage.png";

const OrganizationFunctions = () => {
  const [hostCommentLength, setHostCommentLength] = useState(0);

  return (
    <div className="bg-white text-black px-[2rem]">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-[2rem] pt-[4rem] space-x-[8rem]">
        {/* Host a ZotRide Form - Left Side */}
        <div className="space-y-8">
          <h1 className="text-5xl font-bold mb-12">Host a Club ZotRide</h1>

          <div className="text-lg">
            <input
              type="text"
              placeholder="Pickup Location"
              className="w-full bg-gray-100 border-b-2 border-black px-3 py-2 focus:outline-none placeholder-black/50 rounded-t-lg"
            />
          </div>

          <div>
            <input
              type="text"
              placeholder="Dropoff Location"
              className="w-full bg-gray-100 border-b-2 border-black px-3 py-2 focus:outline-none placeholder-black/50 rounded-t-lg"
            />
          </div>

          <div className="grid grid-cols-2 gap-8">
            <div>
              <input
                type="text"
                placeholder="Time"
                className="w-full bg-gray-100 border-b-2 border-black px-3 py-2 focus:outline-none placeholder-black/50 rounded-t-lg"
              />
            </div>
            <div>
              <input
                type="text"
                placeholder="Day"
                className="w-full bg-gray-100 border-b-2 border-black px-3 py-2 focus:outline-none placeholder-black/50 rounded-t-lg"
              />
            </div>
          </div>

          <div className="relative pb-4">
            <textarea
              placeholder="Comments"
              rows={5}
              maxLength={500}
              onChange={(e) => setHostCommentLength(e.target.value.length)}
              className="w-full bg-gray-100 border-b-2 border-black px-3 focus:outline-none placeholder-black/50 resize-none rounded-t-lg"
            />
            <div className="absolute bottom-0 right-0 text-xs text-black/50">
              {hostCommentLength}/500
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8">
            <div className="flex rounded-full h-[3rem] border border-black items-center justify-center cursor-pointer hover:bg-black hover:text-white transition px-8">
              Host
            </div>
          </div>
        </div>

        {/* Right Side - Image */}
        <div className="flex items-center justify-center">
          <div className="relative">
            <img
              src={testImage}
              alt="Organization illustration"
              className="w-full h-auto rounded-lg shadow-2xl"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-lg"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrganizationFunctions;
