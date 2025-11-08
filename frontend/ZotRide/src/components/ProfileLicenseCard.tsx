import RiderWaves from "../assets/RiderWaves.svg";
import LicenseWaves from "../assets/RiderWaves.svg";
import ProfileInfo from "./ProfileInfo";
import ProfileInfoInput from "./ProfileInfoInput";

interface ProfileLicenseCardProps {
  userName?: string;
  userTitle?: string;
  contact?: string;
  preferredName?: string;
  gender?: string;
  dateCreated?: string;
  ridesTaken?: number;
  profileImage?: string;
  displayed: boolean;
}

const ZotBadge = ({
  className = "",
  size = "80",
}: {
  className?: string;
  size?: string;
}) => (
  <svg
    viewBox="0 0 100 100"
    className={className}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle
      cx="50"
      cy="50"
      r="45"
      stroke="black"
      strokeWidth="3"
      fill="white"
    />
    <text
      x="50"
      y="60"
      textAnchor="middle"
      fontSize="28"
      fontWeight="bold"
      fill="black"
    >
      ZOT!
    </text>
  </svg>
);

const ProfileLicenseCard = ({
  userName = "User Name",
  userTitle = "ZotRider",
  contact = "Prefered Contact",
  preferredName = "Preferred Name",
  gender = "Gender",
  dateCreated = "xx/xx/xx",
  ridesTaken = 3,
  profileImage,
  displayed,
}: ProfileLicenseCardProps) => {
  return (
    <div
      className="card border-2 border-black bg-white rounded-2xl shadow-lg w-full max-w-3xl"
    >
      <div className="card-body p-8">
        <div className="relative mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-black">
            {userName} <span className="font-normal">|</span> <em className="font-normal">{userTitle}</em>
          </h1>

          <div className="-mt-[2.25rem] flex justify-end -mr-[0.5rem]">
            <img src={RiderWaves} alt="Rider Waves" className="h-[2rem]" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-8 mt-4">
          <div className="w-full lg:w-64 h-64 border-2 border-black rounded-lg bg-white flex items-center justify-center">
            {profileImage ? (
              <img
                src={profileImage}
                alt="Profile"
                className="w-full h-full object-cover rounded-lg"
              />
            ) : (
              <div className="text-gray-400 text-center">Placeholder</div>
            )}
          </div>
          <div className="space-y-4 flex flex-col justify-center">
            {displayed ? (
              <>
                <ProfileInfo label="Prefered Contact" value={contact} />
                <ProfileInfo label="Preferred Name" value={preferredName} />
                <ProfileInfo label="Gender" value={gender} />
              </>
            ) : (
              <>
                <ProfileInfoInput label="Prefered Contact" value={contact} />
                <ProfileInfoInput label="Preferred Name" value={preferredName} />
                <ProfileInfoInput label="Gender" value={gender} />
              </>
            )}
            <ProfileInfo label="Date Created" value={dateCreated} />
            <ProfileInfo label="Rides Taken" value={`${ridesTaken} Rides`} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileLicenseCard;
