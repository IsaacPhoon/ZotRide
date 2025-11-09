import { useState, useEffect } from "react";
import AdminPanel from "./AdminPanel";
import OrganizationFunctions from "./OrganizationFunctions";
import ClubJoinRides from "./ClubJoinRides";
import { organizationAPI, type OrganizationMember } from "../services/api";

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
  const [members, setMembers] = useState<OrganizationMember[]>([]);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);
  const [membersError, setMembersError] = useState<string | null>(null);
  const isAdmin = true; // Set to true for now
  const isOwner = true; // Set to true for now - will be determined by backend

  // Fetch members when showMembers is toggled to true
  useEffect(() => {
    if (showMembers && members.length === 0) {
      fetchMembers();
    }
  }, [showMembers]);

  const fetchMembers = async () => {
    setIsLoadingMembers(true);
    setMembersError(null);
    try {
      const fetchedMembers = await organizationAPI.getOrganizationMembers(
        organizationId
      );
      setMembers(fetchedMembers);
    } catch (err: any) {
      console.error("Error fetching members:", err);
      setMembersError(err.response?.data?.error || "Failed to load members");
    } finally {
      setIsLoadingMembers(false);
    }
  };

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
          <div className="mt-4">
            {/* Loading State */}
            {isLoadingMembers && (
              <div className="text-center text-xl py-4">Loading members...</div>
            )}

            {/* Error State */}
            {membersError && (
              <div className="bg-red-100 border-2 border-red-500 text-red-700 px-4 py-3 rounded-lg text-center">
                {membersError}
              </div>
            )}

            {/* Members List */}
            {!isLoadingMembers && !membersError && (
              <>
                {members.length === 0 ? (
                  <div className="text-center text-xl py-4 text-gray-500">
                    No members found
                  </div>
                ) : (
                  <div className="max-w-4xl mx-auto space-y-3">
                    {members.map((member) => (
                      <div
                        key={member.user_id}
                        className="bg-white border-2 border-black rounded-lg p-4"
                      >
                        <div className="flex justify-between items-center">
                          <div className="flex-1">
                            <p className="font-bold text-lg">{member.name}</p>
                            <p className="text-gray-600 text-sm">
                              {member.email}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            {member.is_owner && (
                              <span className="text-xs bg-purple-600 text-white px-3 py-1 rounded-full font-medium">
                                Owner
                              </span>
                            )}
                            {member.is_admin && (
                              <span className="text-xs bg-black text-white px-3 py-1 rounded-full font-medium">
                                Admin
                              </span>
                            )}
                            {member.is_driver && (
                              <span className="text-xs bg-gray-700 text-white px-3 py-1 rounded-full font-medium">
                                Driver
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* Organization Functions */}
      <OrganizationFunctions organizationId={organizationId} />

      {/* Club Join Rides */}
      <ClubJoinRides organizationId={organizationId} />
    </div>
  );
};

export default OrganizationDetails;
