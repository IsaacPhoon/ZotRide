import { useState } from "react";
import join from "../assets/zotride_joinOrg.png";
import { organizationAPI } from "../services/api";
import ErrorModal from "./ErrorModal";

interface JoinOrganizationProps {
  onOrganizationJoined?: () => void;
}

const JoinOrganization = ({ onOrganizationJoined }: JoinOrganizationProps) => {
  const [accessCode, setAccessCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleJoinOrganization = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!accessCode.trim()) {
      setError("Please enter an access code");
      return;
    }

    // Access code should be 6 characters
    if (accessCode.trim().length !== 6) {
      setError("Access code must be 6 characters");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await organizationAPI.joinOrganization(
        accessCode.trim()
      );

      // Success!
      setSuccess(`Successfully joined ${response.organization.name}!`);
      setAccessCode(""); // Clear the input

      // Notify parent component to refresh organizations
      if (onOrganizationJoined) {
        onOrganizationJoined();
      }

      // Clear success message after 5 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 5000);
    } catch (err: unknown) {
      console.error("Error joining organization:", err);
      const error = err as { response?: { data?: { error?: string }; status?: number } };

      // Handle specific error messages from backend
      if (error.response?.data?.error) {
        const errorMsg = error.response.data.error;

        // Customize error messages for better UX
        if (errorMsg.includes("not found")) {
          setError("Invalid access code. Please check and try again.");
        } else if (errorMsg.includes("already a member")) {
          setError("You are already a member of this organization.");
        } else {
          setError(errorMsg);
        }
      } else if (error.response?.status === 401) {
        setError("Please log in to join an organization");
      } else {
        setError("Failed to join organization. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white text-black py-[4rem] px-[4rem] lg:px-[4rem]">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-[8rem] items-center">
        {/* Form Section */}
        <form onSubmit={handleJoinOrganization} className="space-y-10">
          <div>
            <h1 className="text-5xl font-bold mb-4">Join an</h1>
            <h1 className="text-5xl font-bold mb-12">Organization</h1>
          </div>

          {/* Success Message */}
          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
              <span className="block sm:inline">{success}</span>
            </div>
          )}

          {/* Access Code */}
          <div className="relative pb-4">
            <input
              type="text"
              placeholder="Access Code"
              value={accessCode}
              onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
              maxLength={6}
              className="w-full bg-gray-100 border-b-2 border-black px-3 py-3 text-2xl focus:outline-none placeholder-black/50 rounded-t-lg uppercase"
              disabled={loading}
            />
            <p className="text-sm text-gray-500 mt-2">
              Enter the 6-character code provided by the organization
            </p>
          </div>

          {/* Join Button */}
          <div className="pt-0">
            <button
              type="submit"
              disabled={loading || !accessCode.trim()}
              className="w-full lg:w-auto flex rounded-full h-[3.5rem] border-2 border-black items-center justify-center cursor-pointer hover:bg-black hover:text-white transition px-16 text-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Joining..." : "Join Organization"}
            </button>
          </div>
        </form>

        {/* Image Section */}
        <div className="flex items-center justify-center">
          <div className="relative">
            <img
              src={join}
              alt="Organization illustration"
              className="w-full h-auto rounded-lg shadow-2xl"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-lg"></div>
          </div>
        </div>
      </div>

      {/* Error Modal */}
      {error && <ErrorModal message={error} onClose={() => setError(null)} />}
    </div>
  );
};

export default JoinOrganization;
