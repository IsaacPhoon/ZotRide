import { useState } from "react";
import AdminPanel from "./AdminPanel";
import OrganizationFunctions from "./OrganizationFunctions";

interface OrganizationDetailsProps {
  organizationId: number;
  organizationName: string;
  onBack: () => void;
}

const OrganizationDetails = ({
  organizationId,
  organizationName,
  onBack,
}: OrganizationDetailsProps) => {
  const [showMembers, setShowMembers] = useState(false);
  const isAdmin = true; // Set to true for now
  const isOwner = true; // Set to true for now - will be determined by backend

  return (
    <div className="min-h-screen bg-white text-black">
      {/* Back Button */}
      <div className="px-[2rem] pt-[2rem]">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-black hover:underline mb-4"
        >
          ← Back to Organizations
        </button>
        <h1 className="text-5xl font-bold mb-8">{organizationName}</h1>
      </div>

      {/* Admin Panel - Only shown if isAdmin is true */}
      {isAdmin && (
        <div className="px-[2rem]">
          <AdminPanel isOwner={isOwner} />
        </div>
      )}

      {/* Members List */}
      <div className="px-[2rem] mb-8">
        <div className="flex justify-center mb-4">
          <button
            onClick={() => setShowMembers(!showMembers)}
            className={`flex rounded-full h-[3rem] w-[12rem] border-2 items-center justify-center cursor-pointer transition px-8 text-lg font-medium ${
              showMembers
                ? "bg-black text-white border-black"
                : "bg-white text-black border-black hover:bg-black hover:text-white"
            }`}
          >
            Members List
          </button>
        </div>

        {showMembers && (
          <div className="text-center text-2xl mt-4">
            Members list will be displayed here
          </div>
        )}
      </div>

      {/* Organization Functions */}
      <OrganizationFunctions />
    </div>
  );
};

export default OrganizationDetails;
