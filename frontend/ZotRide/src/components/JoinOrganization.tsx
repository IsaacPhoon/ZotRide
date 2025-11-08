import testImage from "../assets/testimage.png";

const JoinOrganization = () => {
  return (
    <div className="bg-white text-black py-[4rem] px-[2rem] lg:px-[2rem]">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-[8rem] items-center">
        {/* Form Section */}
        <div className="space-y-10">
          <div>
            <h1 className="text-5xl font-bold mb-4">Join an</h1>
            <h1 className="text-5xl font-bold mb-12">Organization</h1>
          </div>

          {/* Access Code */}
          <div className="relative pb-4">
            <input
              type="text"
              placeholder="Access Code"
              className="w-full bg-gray-100 border-b-2 border-black px-3 py-3 text-2xl focus:outline-none placeholder-black/50 rounded-t-lg"
            />
          </div>

          {/* Join Button */}
          <div className="pt-0">
            <button className="w-full lg:w-auto flex rounded-full h-[3.5rem] border-2 border-black items-center justify-center cursor-pointer hover:bg-black hover:text-white transition px-16 text-lg font-medium">
              Join Organization
            </button>
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

export default JoinOrganization;
