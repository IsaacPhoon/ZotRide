import { useState } from "react";

const RequestRideForm = () => {
  const [commentLength, setCommentLength] = useState(0);

  return (
    <div className="space-y-[2rem]">
      <h1 className="text-5xl font-bold mb-12">Request a ZotRide</h1>

      <div className="text-lg">
        <input
          type="text"
          placeholder="Pickup Location"
          className="w-full bg-transparent border-b-2 border-black pb-2 focus:outline-none placeholder-black/50"
        />
      </div>

      <div>
        <input
          type="text"
          placeholder="Dropoff Location"
          className="w-full bg-transparent border-b-2 border-black pb-2 focus:outline-none placeholder-black/50"
        />
      </div>

      <div className="grid grid-cols-2 gap-8">
        <div>
          <input
            type="text"
            placeholder="Time"
            className="w-full bg-transparent border-b-2 border-black pb-2 focus:outline-none placeholder-black/50"
          />
        </div>
        <div>
          <input
            type="text"
            placeholder="Day"
            className="w-full bg-transparent border-b-2 border-black pb-2 focus:outline-none placeholder-black/50"
          />
        </div>
      </div>

      <div className="relative pb-4">
        <textarea
          placeholder="Comments"
          rows={5}
          maxLength={500}
          onChange={(e) => setCommentLength(e.target.value.length)}
          className="w-full bg-gray-100 border-b-2 border-black px-3 focus:outline-none placeholder-black/50 resize-none rounded-t-lg"
        />
        <div className="absolute bottom-0 right-0 text-xs text-black/50">
          {commentLength}/500
        </div>
      </div>

      <div className="grid grid-cols-2 gap-8">
        <div className="flex rounded-full h-[3rem] border border-black items-center justify-center cursor-pointer hover:bg-black hover:text-white transition px-8">
          Request
        </div>
      </div>
    </div>
  );
};

export default RequestRideForm;
