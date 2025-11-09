import { useState } from "react";
import { motion } from "framer-motion";
import ZotDriverApplication from "./ZotDriverApplication";
import testImage from "../assets/testimage2.avif";
import ProfileLicenseCard from "./ProfileLicenseCard";
import { useAuth } from "../context/AuthContext";

const Profile = () => {
  const { logout } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [rotation, setRotation] = useState({ rotateX: 0, rotateY: 0 });
  const [saveTriggered, setSaveTriggered] = useState(false);

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

  const handleSaveChanges = () => {
    setSaveTriggered(true);
    // Reset the trigger after a short delay
    setTimeout(() => setSaveTriggered(false), 100);
  };

  return (
    <div className="min-h-screen bg-white text-black px-[2rem] py-[4rem]">
      <div className="flex justify-center mb-8">
        <ProfileLicenseCard displayed={false} saveTriggered={saveTriggered} />
      </div>
      <div className="flex justify-center">
        <div className="card-actions justify-start gap-4 mt-2">
          <button
            onClick={() => setShowModal(true)}
            className="h-[3rem] w-[12rem] btn btn-outline border-black text-black rounded-full hover:bg-black hover:text-white active:scale-100 px-8"
          >
            Display
          </button>
          <button
            onClick={handleSaveChanges}
            className="h-[3rem] w-[12rem] btn btn-outline border-black text-black rounded-full hover:bg-black hover:text-white active:scale-100 px-6"
          >
            Save Changes
          </button>
        </div>
      </div>

      {showModal && (
        <div
          className="fixed inset-0 z-50 w-full flex items-center justify-center bg-black/30 backdrop-blur-sm"
          onClick={() => setShowModal(false)}
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
            <ProfileLicenseCard displayed={true} />
          </motion.div>
        </div>
      )}
      <div
        id="driver-application"
        className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-[8rem] pt-[8rem]"
      >
        <div className="w-full items-center justify center">
          <ZotDriverApplication />
        </div>
        <div className="flex items-center justify-center">
          <img
            src={testImage}
            alt="Driver application illustration"
            className="w-full h-auto rounded-lg shadow-lg"
          />
        </div>
      </div>
      <div className="flex justify-center mt-[8rem]">
        <button
          className="h-[3rem] w-[12rem] btn btn-outline border-red-500 text-red-500 rounded-full hover:bg-red-100 hover:text-red-500 active:scale-100 px-6"
          onClick={logout}
        >
          Log Out
        </button>
      </div>
    </div>
  );
};

export default Profile;
