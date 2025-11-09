import { useState } from "react";
import { organizationAPI, type OrganizationMember } from "../services/api";

interface AdminPanelProps {
  isOwner: boolean;
  accessCode: string;
  organizationId: number;
  members: OrganizationMember[];
  onMembersUpdate: () => void;
}

const AdminPanel = ({
  isOwner,
  accessCode,
  organizationId,
  members,
  onMembersUpdate,
}: AdminPanelProps) => {
  const [showPanel, setShowPanel] = useState(false);
  const [showMembers, setShowMembers] = useState(false);
  const [showDrivers, setShowDrivers] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const handlePromoteToAdmin = async (userId: number) => {
    try {
      setIsUpdating(true);
      await organizationAPI.updateMemberRole(organizationId, userId, {
        is_admin: true,
      });
      onMembersUpdate(); // Refresh members list
    } catch (err: any) {
      console.error("Error promoting to admin:", err);
      alert(err.response?.data?.error || "Failed to promote member to admin");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemoveAdmin = async (userId: number) => {
    try {
      setIsUpdating(true);
      await organizationAPI.updateMemberRole(organizationId, userId, {
        is_admin: false,
      });
      onMembersUpdate(); // Refresh members list
    } catch (err: any) {
      console.error("Error removing admin:", err);
      alert(err.response?.data?.error || "Failed to remove admin status");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemoveMember = async (userId: number, memberName: string) => {
    if (
      !confirm(
        `Are you sure you want to remove ${memberName} from the organization?`
      )
    ) {
      return;
    }

    try {
      setIsUpdating(true);
      await organizationAPI.removeMember(organizationId, userId);
      onMembersUpdate(); // Refresh members list
    } catch (err: any) {
      console.error("Error removing member:", err);
      alert(err.response?.data?.error || "Failed to remove member");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAuthorizeDriver = async (userId: number) => {
    try {
      setIsUpdating(true);
      await organizationAPI.updateMemberRole(organizationId, userId, {
        is_driver: true,
      });
      onMembersUpdate(); // Refresh members list
    } catch (err: any) {
      console.error("Error authorizing driver:", err);
      alert(err.response?.data?.error || "Failed to authorize driver");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRevokeDriver = async (userId: number) => {
    try {
      setIsUpdating(true);
      await organizationAPI.updateMemberRole(organizationId, userId, {
        is_driver: false,
      });
      onMembersUpdate(); // Refresh members list
    } catch (err: any) {
      console.error("Error revoking driver:", err);
      alert(err.response?.data?.error || "Failed to revoke driver status");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCopyAccessCode = () => {
    navigator.clipboard.writeText(accessCode);
    alert("Access code copied to clipboard!");
  };

  return (
    <div className="border-2 border-black rounded-3xl p-8 mb-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">
          {isOwner ? "Owner Panel" : "Admin Panel"}
        </h2>
        <button
          onClick={() => setShowPanel(!showPanel)}
          className={`flex rounded-full h-[3rem] w-[8rem] border-2 items-center justify-center cursor-pointer transition px-6 text-sm font-medium ${
            showPanel
              ? "bg-black text-white border-black"
              : "bg-white text-black border-black hover:bg-black hover:text-white"
          }`}
        >
          {showPanel ? "Hide" : "Show"}
        </button>
      </div>

      {showPanel && (
        <>
          {/* Access Code Section */}
          <div className="mb-6 pb-6 border-b-2 border-black/20">
            <h3 className="text-xl font-bold mb-3">Access Code</h3>
            <div className="flex gap-4 items-center">
              <div className="bg-white border-2 border-black rounded-lg px-4 py-3 font-mono text-xl font-bold flex-1">
                {accessCode}
              </div>
              <button
                onClick={handleCopyAccessCode}
                className="flex rounded-full h-[3rem] w-[10rem] border-2 border-black items-center justify-center cursor-pointer hover:bg-black hover:text-white transition px-6 text-sm font-medium"
              >
                Copy Code
              </button>
            </div>
          </div>

          {/* Manage Members Section */}
          <div className="mb-6 pb-6 border-b-2 border-black/20">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Manage Members</h3>
              <button
                onClick={() => setShowMembers(!showMembers)}
                className={`flex rounded-full h-[2.5rem] w-[10rem] border-2 items-center justify-center cursor-pointer transition px-6 text-sm font-medium ${
                  showMembers
                    ? "bg-black text-white border-black"
                    : "bg-white text-black border-black hover:bg-black hover:text-white"
                }`}
              >
                {showMembers ? "Hide Members" : "Show Members"}
              </button>
            </div>

            {showMembers && (
              <div className="space-y-3 mt-4">
                {members.length === 0 ? (
                  <div className="text-center text-gray-500 py-4">
                    No members found
                  </div>
                ) : (
                  members.map((member) => (
                    <div
                      key={member.user_id}
                      className="bg-white border-2 border-black rounded-lg p-4"
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex-1">
                          <p className="font-bold text-lg">{member.name}</p>
                          <div className="flex gap-2 mt-1">
                            {member.is_owner && (
                              <span className="text-xs bg-purple-600 text-white px-2 py-1 rounded-full">
                                Owner
                              </span>
                            )}
                            {member.is_admin && (
                              <span className="text-xs bg-black text-white px-2 py-1 rounded-full">
                                Admin
                              </span>
                            )}
                            {member.is_driver && (
                              <span className="text-xs bg-gray-700 text-white px-2 py-1 rounded-full">
                                Driver
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex gap-2">
                          {/* Owner-only controls - Cannot modify owner */}
                          {isOwner && !member.is_owner && (
                            <>
                              {!member.is_admin ? (
                                <button
                                  onClick={() =>
                                    handlePromoteToAdmin(member.user_id)
                                  }
                                  disabled={isUpdating}
                                  className="h-[2rem] px-4 text-xs border-2 border-green-600 text-green-600 rounded-full hover:bg-green-600 hover:text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  Promote
                                </button>
                              ) : (
                                <button
                                  onClick={() =>
                                    handleRemoveAdmin(member.user_id)
                                  }
                                  disabled={isUpdating}
                                  className="h-[2rem] px-4 text-xs border-2 border-orange-500 text-orange-500 rounded-full hover:bg-orange-500 hover:text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  Demote
                                </button>
                              )}
                            </>
                          )}

                          {/* Admin controls - Cannot remove owner */}
                          {!member.is_owner && (
                            <button
                              onClick={() =>
                                handleRemoveMember(member.user_id, member.name)
                              }
                              disabled={isUpdating}
                              className="h-[2rem] px-4 text-xs border-2 border-red-500 text-red-500 rounded-full hover:bg-red-500 hover:text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Manage Drivers Section */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Authorize Drivers</h3>
              <button
                onClick={() => setShowDrivers(!showDrivers)}
                className={`flex rounded-full h-[2.5rem] w-[10rem] border-2 items-center justify-center cursor-pointer transition px-6 text-sm font-medium ${
                  showDrivers
                    ? "bg-black text-white border-black"
                    : "bg-white text-black border-black hover:bg-black hover:text-white"
                }`}
              >
                {showDrivers ? "Hide Drivers" : "Show Drivers"}
              </button>
            </div>

            {showDrivers && (
              <div className="space-y-3 mt-4">
                {members.length === 0 ? (
                  <div className="text-center text-gray-500 py-4">
                    No members found
                  </div>
                ) : (
                  members.map((member) => (
                    <div
                      key={member.user_id}
                      className="bg-white border-2 border-black rounded-lg p-4"
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex-1">
                          <p className="font-bold text-lg">{member.name}</p>
                          <div className="flex gap-2 mt-1">
                            {member.is_driver ? (
                              <span className="text-xs bg-green-600 text-white px-2 py-1 rounded-full">
                                Authorized Driver
                              </span>
                            ) : (
                              <span className="text-xs bg-gray-400 text-white px-2 py-1 rounded-full">
                                Not a Driver
                              </span>
                            )}
                          </div>
                        </div>

                        <div>
                          {!member.is_driver ? (
                            <button
                              onClick={() =>
                                handleAuthorizeDriver(member.user_id)
                              }
                              disabled={isUpdating}
                              className="h-[2rem] px-4 text-xs border-2 border-green-600 text-green-600 rounded-full hover:bg-green-600 hover:text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              Authorize
                            </button>
                          ) : (
                            <button
                              onClick={() => handleRevokeDriver(member.user_id)}
                              disabled={isUpdating}
                              className="h-[2rem] px-4 text-xs border-2 border-red-500 text-red-500 rounded-full hover:bg-red-500 hover:text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              Revoke
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default AdminPanel;
