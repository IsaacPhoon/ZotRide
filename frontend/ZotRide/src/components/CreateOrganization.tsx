import { useState } from "react";
import testImage from "../assets/testimage.png";

const CreateOrganization = () => {
  const [nameLength, setNameLength] = useState(0);
  const [descriptionLength, setDescriptionLength] = useState(0);

  return (
    <div className="min-h-screen bg-white text-black py-[4rem] px-[2rem] lg:px-[2rem]">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-[8rem] items-center">
        {/* Form Section */}
        <div className="space-y-10">
          <div>
            <h1 className="text-5xl font-bold mb-4">Create an</h1>
            <h1 className="text-5xl font-bold mb-12">Organization</h1>
          </div>

          {/* Organization Name */}
          <div className="relative">
            <input
              type="text"
              placeholder="Organization Name"
              maxLength={255}
              onChange={(e) => setNameLength(e.target.value.length)}
              className="w-full bg-transparent border-b-2 border-black pb-3 text-2xl focus:outline-none placeholder-black/50"
            />
            <div className="absolute -bottom-6 right-0 text-xs text-black/50">
              {nameLength}/255
            </div>
          </div>

          {/* Organization Description */}
          <div className="relative pb-4">
            <textarea
              placeholder="Organization Description"
              rows={5}
              maxLength={500}
              onChange={(e) => setDescriptionLength(e.target.value.length)}
              className="w-full bg-gray-100 border-b-2 border-black px-3 text-lg focus:outline-none placeholder-black/50 resize-none rounded-t-lg"
            />
            <div className="absolute bottom-0 right-0 text-xs text-black/50 ">
              {descriptionLength}/500
            </div>
          </div>

          {/* Create Button */}
          <div className="pt-0">
            <button className="w-full lg:w-auto flex rounded-full h-[3.5rem] border-2 border-black items-center justify-center cursor-pointer hover:bg-black hover:text-white transition px-16 text-lg font-medium">
              Create Organization
            </button>
          </div>

          {/* Decorative Text */}
          <div className="pt-0">
            <p className="text-gray-600 italic text-sm">
              Unite your community, organize rides together
            </p>
          </div>
        </div>

        {/* Image Section */}
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

export default CreateOrganization;
