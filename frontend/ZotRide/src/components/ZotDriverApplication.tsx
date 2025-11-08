const ZotDriverApplication = () => {
  return (
    <div className="space-y-8">
      <h1 className="text-5xl font-bold mb-12">Apply to be a ZotDriver</h1>

      <div className="text-lg">
        <input
          type="text"
          placeholder="Make"
          className="w-full bg-transparent border-b-2 border-black pb-2 focus:outline-none placeholder-black/50"
        />
      </div>

      <div>
        <input
          type="text"
          placeholder="Year"
          className="w-full bg-transparent border-b-2 border-black pb-2 focus:outline-none placeholder-black/50"
        />
      </div>

      <div>
        <input
          type="text"
          placeholder="Model"
          className="w-full bg-transparent border-b-2 border-black pb-2 focus:outline-none placeholder-black/50"
        />
      </div>

      <div>
        <input
          type="text"
          placeholder="License Plate"
          className="w-full bg-transparent border-b-2 border-black pb-2 focus:outline-none placeholder-black/50"
        />
      </div>

      <div>
        <input
          type="text"
          placeholder="Seats available"
          className="w-full bg-transparent border-b-2 border-black pb-2 focus:outline-none placeholder-black/50"
        />
      </div>

      <div className="space-y-4">
        <button className="w-full flex rounded-full h-[3rem] border-2 border-black items-center justify-center cursor-pointer hover:bg-gray-100 transition px-8">
          Upload Drivers License
        </button>

        <button className="w-full flex rounded-full h-[3rem] border-2 border-black items-center justify-center cursor-pointer hover:bg-black hover:text-white transition px-8">
          Apply
        </button>
      </div>
    </div>
  );
};

export default ZotDriverApplication;
