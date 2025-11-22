import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { driverAPI, userAPI } from "../services/api";
import type { DriverData, User } from "../services/api";
import RiderWaves from "../assets/RiderWaves.svg";
import ProfileInfo from "./ProfileInfo";

interface DriverLicenseModalProps {
  driverId: number;
  onClose: () => void;
}

const DriverLicenseModal = ({ driverId, onClose }: DriverLicenseModalProps) => {
  const [driverData, setDriverData] = useState<DriverData | null>(null);
  const [userData, setUserData] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rotation, setRotation] = useState({ rotateX: 0, rotateY: 0 });

  useEffect(() => {
    const fetchDriverInfo = async () => {
      try {
        setIsLoading(true);
        const driver = await driverAPI.getDriverById(driverId);
        const user = await userAPI.getUserById(driver.user_id);
        setDriverData(driver);
        setUserData(user);
      } catch (err: unknown) {
        console.error("Error fetching driver info:", err);
        setError("Failed to load driver information");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDriverInfo();
  }, [driverId]);

  const getGenderLabel = (genderValue: number): string => {
    switch (genderValue) {
      case 0:
        return "Male";
      case 1:
        return "Female";
      case 2:
        return "Other";
      default:
        return "Not specified";
    }
  };

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        month: "2-digit",
        day: "2-digit",
        year: "2-digit",
      });
    } catch {
      return "xx/xx/xx";
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -10;
    const rotateY = ((x - centerX) / centerX) * 10;
    setRotation({ rotateX, rotateY });
  };

  const handleMouseLeave = () => {
    setRotation({ rotateX: 0, rotateY: 0 });
  };

  return (
    <div
      className="fixed inset-0 z-50 w-full flex items-center justify-center bg-black/30 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        className="w-full max-w-4xl px-4"
        style={{
          perspective: "1000px",
          transformStyle: "preserve-3d",
        }}
        animate={{
          rotateX: rotation.rotateX,
          rotateY: rotation.rotateY,
        }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 20,
        }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={(e) => e.stopPropagation()}
      >
        {isLoading ? (
          <div className="card border-2 border-black bg-white rounded-2xl shadow-lg">
            <div className="card-body p-8 flex justify-center items-center h-64">
              <div className="loading loading-spinner loading-lg"></div>
            </div>
          </div>
        ) : error ? (
          <div className="card border-2 border-black bg-white rounded-2xl shadow-lg">
            <div className="card-body p-8 flex justify-center items-center h-64">
              <p className="text-red-600">{error}</p>
            </div>
          </div>
        ) : driverData && userData ? (
          <div className="card border-2 border-black bg-white rounded-2xl shadow-lg w-full max-w-3xl">
            <div className="card-body p-8">
              <div className="relative mb-6">
                <h1 className="text-3xl md:text-4xl font-bold text-black">
                  {userData.name} <span className="font-normal">|</span>{" "}
                  <em className="font-normal">ZotDriver</em>
                </h1>

                <div className="-mt-[2.25rem] flex justify-end -mr-[0.5rem]">
                  <img src={RiderWaves} alt="Rider Waves" className="h-[2rem]" />
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-8 mt-4">
                <div className="w-full lg:w-64 h-64 border-2 border-black rounded-lg bg-gray-50 flex flex-col items-center justify-center">
                  <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-3">
                    <svg
                      className="w-8 h-8 text-gray-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="text-gray-400 text-center text-sm font-medium">
                    Profile Photo
                  </div>
                  <div className="text-gray-300 text-center text-xs mt-1">
                    Upload coming soon
                  </div>
                </div>

                <div className="space-y-4 flex flex-col justify-center">
                  <ProfileInfo
                    label="Preferred Contact"
                    value={userData.preferred_contact}
                  />
                  <ProfileInfo label="Name" value={userData.name} />
                  <ProfileInfo
                    label="Gender"
                    value={getGenderLabel(userData.gender)}
                  />
                  <ProfileInfo label="Vehicle" value={driverData.vehicle_data} />
                  <ProfileInfo
                    label="License Plate"
                    value={driverData.license_plate}
                  />
                  {driverData.is_approved && driverData.approved_at && (
                    <ProfileInfo
                      label="Approved Date"
                      value={formatDate(driverData.approved_at)}
                    />
                  )}
                  {/* <ProfileInfo
                    label="Rating"
                    value={
                      driverData.average_rating > 0
                        ? `⭐ ${driverData.average_rating.toFixed(1)}`
                        : "No reviews yet"
                    }
                  /> */}
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </motion.div>
    </div>
  );
};

export default DriverLicenseModal;
