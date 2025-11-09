import { useState, useEffect, useCallback } from "react";
import RiderWaves from "../assets/RiderWaves.svg";
import ProfileInfo from "./ProfileInfo";
import { useAuth } from "../context/AuthContext";
import { profileAPI } from "../services/api";
import type { UpdateProfileRequest } from "../services/api";
import ErrorModal from "./ErrorModal";

interface ProfileLicenseCardProps {
  displayed: boolean;
  onSaveChanges?: () => void;
  saveTriggered?: boolean;
}

const ProfileLicenseCard = ({
  displayed,
  onSaveChanges,
  saveTriggered = false,
}: ProfileLicenseCardProps) => {
  const { user, updateUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Form state - initialize with user data
  const [name, setName] = useState("");
  const [gender, setGender] = useState(0);
  const [preferredContact, setPreferredContact] = useState("");

  // Initialize form with user data when user changes
  useEffect(() => {
    if (user) {
      setName(user.name);
      setGender(user.gender);
      setPreferredContact(user.preferred_contact);
    }
  }, [user]);

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

  const formatDate = (dateString: string): string => {
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

  const handleSaveChanges = useCallback(async () => {
    if (!user) {
      setError("User not authenticated");
      return;
    }

    // Validate required fields
    if (!name.trim()) {
      setError("Name is required");
      return;
    }
    if (!preferredContact.trim()) {
      setError("Preferred contact is required");
      return;
    }

    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const profileData: UpdateProfileRequest = {
        name: name.trim(),
        gender,
        preferred_contact: preferredContact.trim(),
      };

      const result = await profileAPI.updateProfile(profileData);

      // Update user in auth context
      updateUser(result.user);

      setSuccess("Profile updated successfully!");

      // Call parent callback if provided
      if (onSaveChanges) {
        onSaveChanges();
      }
    } catch (err: any) {
      console.error("Profile Update Error:", err);
      setError(
        err.response?.data?.error ||
          "Failed to update profile. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  }, [user, name, gender, preferredContact, updateUser, onSaveChanges]);

  // Handle save trigger from parent component
  useEffect(() => {
    if (saveTriggered && !displayed) {
      handleSaveChanges();
    }
  }, [saveTriggered, displayed, handleSaveChanges]);

  // Determine user role based on driver status
  const getUserRole = (): string => {
    if (!user) return "ZotRider";

    // Has driver_id and is_driver = true: Approved driver
    if (user.driver_id && user.is_driver) {
      return "ZotDriver";
    }

    // Has driver_id but is_driver = false: Pending approval
    if (user.driver_id && !user.is_driver) {
      return "ZotDriver (Pending)";
    }

    // No driver_id: Regular rider
    return "ZotRider";
  };

  if (!user) {
    return (
      <div className="card border-2 border-black bg-white rounded-2xl shadow-lg w-full max-w-3xl">
        <div className="card-body p-8 flex items-center justify-center">
          <div className="text-gray-500">Loading profile...</div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="card border-2 border-black bg-white rounded-2xl shadow-lg w-full max-w-3xl">
        <div className="card-body p-8">
          <div className="relative mb-6">
            <h1 className="text-3xl md:text-4xl font-bold text-black">
              {displayed ? user.name : name}{" "}
              <span className="font-normal">|</span>{" "}
              <em className="font-normal">{getUserRole()}</em>
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
              {displayed ? (
                <>
                  <ProfileInfo
                    label="Preferred Contact"
                    value={user.preferred_contact}
                  />
                  <ProfileInfo label="Name" value={user.name} />
                  <ProfileInfo
                    label="Gender"
                    value={getGenderLabel(user.gender)}
                  />
                </>
              ) : (
                <>
                  <div className="flex items-baseline gap-4">
                    <span className="font-bold text-black text-right text-lg w-[180px]">
                      Preferred Contact:
                    </span>
                    <input
                      type="text"
                      value={preferredContact}
                      onChange={(e) => setPreferredContact(e.target.value)}
                      placeholder="Phone, Instagram, etc."
                      className="text-black border-b-2 border-black text-lg flex-1 pb-1 bg-transparent focus:outline-none placeholder-black/50"
                      disabled={isLoading}
                    />
                  </div>

                  <div className="flex items-baseline gap-4">
                    <span className="font-bold text-black text-right text-lg w-[180px]">
                      Name:
                    </span>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your full name"
                      className="text-black border-b-2 border-black text-lg flex-1 pb-1 bg-transparent focus:outline-none placeholder-black/50"
                      disabled={isLoading}
                    />
                  </div>

                  <div className="flex items-baseline gap-4">
                    <span className="font-bold text-black text-right text-lg w-[180px]">
                      Gender:
                    </span>
                    <select
                      value={gender}
                      onChange={(e) => setGender(parseInt(e.target.value))}
                      className="text-black border-b-2 border-black text-lg flex-1 pb-1 bg-transparent focus:outline-none"
                      disabled={isLoading}
                    >
                      <option value={0}>Male</option>
                      <option value={1}>Female</option>
                      <option value={2}>Other</option>
                    </select>
                  </div>
                </>
              )}

              <ProfileInfo
                label="Date Created"
                value={formatDate(user.date_created)}
              />
              <ProfileInfo label="Rides Taken" value="0 Rides" />

              {success && (
                <div className="text-green-600 text-sm font-medium">
                  {success}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Error Modal */}
      <ErrorModal message={error} onClose={() => setError("")} />
    </>
  );
};

export default ProfileLicenseCard;
