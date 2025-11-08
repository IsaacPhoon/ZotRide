import { useState } from "react";

const RiderProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    username: "ZotRider",
    contact: "Email",
    preferredName: "Preferred Name",
    gender: "Gender",
    dateCreated: "xx/xx/xx",
    ridesTaken: "3 Rides",
  });

  const handleInputChange = (field: string, value: string) => {
    setProfileData({ ...profileData, [field]: value });
  };

  const handleSave = () => {
    setIsEditing(false);
    // Add save logic here
  };

  return (
    <div className="min-h-screen bg-white text-black flex items-center justify-center px-4 py-[8rem]">
      <div className="w-full max-w-4xl">
        {/* Profile Card */}
        <div className="border-2 border-black rounded-3xl p-8 md:p-12 shadow-lg bg-white">
          <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-8">
            {/* Left Section - Profile Picture and Username */}
            <div className="flex flex-col items-center md:items-start gap-4">
              {/* Profile Picture Placeholder */}
              <div className="w-32 h-32 md:w-40 md:h-40 border-2 border-black rounded-2xl flex items-center justify-center bg-gray-50 flex-shrink-0">
                <svg
                  className="w-16 h-16 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>

              {/* Username */}
              <div className="text-center md:text-left w-full">
                <h1 className="text-2xl md:text-3xl font-bold break-words">
                  User Name |{" "}
                  {isEditing ? (
                    <input
                      type="text"
                      value={profileData.username}
                      onChange={(e) =>
                        handleInputChange("username", e.target.value)
                      }
                      className="inline-block bg-transparent border-b-2 border-black focus:outline-none w-auto min-w-[8rem]"
                    />
                  ) : (
                    <span className="italic">{profileData.username}</span>
                  )}
                </h1>
              </div>
            </div>

            {/* Right Section - Profile Details */}
            <div className="flex flex-col justify-between">
              {/* Zot Logo Area */}
              <div className="flex justify-end mb-4">
                <div className="w-16 h-16 border-2 border-black rounded-full flex items-center justify-center">
                  <span className="font-bold text-xl">Zot!</span>
                </div>
              </div>

              {/* Profile Information */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <label className="font-bold min-w-[140px] text-right">
                    Prefered Contact:
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profileData.contact}
                      onChange={(e) =>
                        handleInputChange("contact", e.target.value)
                      }
                      className="flex-1 bg-transparent border-b-2 border-black focus:outline-none pb-1"
                    />
                  ) : (
                    <span className="flex-1 border-b-2 border-black pb-1">
                      {profileData.contact}
                    </span>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <label className="font-bold min-w-[140px] text-right">
                    Preferred Name:
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profileData.preferredName}
                      onChange={(e) =>
                        handleInputChange("preferredName", e.target.value)
                      }
                      className="flex-1 bg-transparent border-b-2 border-black focus:outline-none pb-1"
                    />
                  ) : (
                    <span className="flex-1 border-b-2 border-black pb-1">
                      {profileData.preferredName}
                    </span>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <label className="font-bold min-w-[140px] text-right">
                    Gender:
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profileData.gender}
                      onChange={(e) =>
                        handleInputChange("gender", e.target.value)
                      }
                      className="flex-1 bg-transparent border-b-2 border-black focus:outline-none pb-1"
                    />
                  ) : (
                    <span className="flex-1 border-b-2 border-black pb-1">
                      {profileData.gender}
                    </span>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <label className="font-bold min-w-[140px] text-right">
                    Date Created:
                  </label>
                  <span className="flex-1 pb-1">{profileData.dateCreated}</span>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <label className="font-bold min-w-[140px] text-right">
                    Rides Taken:
                  </label>
                  <span className="flex-1 pb-1">{profileData.ridesTaken}</span>
                </div>
              </div>

              {/* Decorative Element */}
              <div className="mt-6 flex justify-center">
                <div className="relative">
                  <div className="h-8 w-80 bg-gradient-to-r from-red-500 via-orange-500 to-red-500 rounded-full"></div>
                  <svg
                    className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-12 h-12 text-red-500"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2L15 8L21 9L16 14L18 20L12 17L6 20L8 14L3 9L9 8L12 2Z" />
                  </svg>
                  <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 bg-orange-500 text-white px-4 py-1 rounded-full text-sm font-bold whitespace-nowrap">
                    Ethan Zhao
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="px-12 py-3 border-2 border-black rounded-full font-medium hover:bg-gray-100 transition-colors"
          >
            {isEditing ? "Cancel" : "Display"}
          </button>
          <button
            onClick={handleSave}
            className="px-12 py-3 border-2 border-black bg-black text-white rounded-full font-medium hover:bg-gray-800 transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default RiderProfile;
