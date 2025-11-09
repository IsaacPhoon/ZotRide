import { useState } from "react";

interface AdminPanelProps {
  isOwner: boolean;
  accessCode: string;
}

const AdminPanel = ({ isOwner, accessCode }: AdminPanelProps) => {
  const [showPanel, setShowPanel] = useState(false);
  const [showMembers, setShowMembers] = useState(false);
  const [showDrivers, setShowDrivers] = useState(false);

  // Mock data for demonstration
  const members = [
    { id: 1, name: "John Doe", isAdmin: false, isDriver: false },
    { id: 2, name: "Jane Smith", isAdmin: true, isDriver: true },
    { id: 3, name: "Bob Johnson", isAdmin: false, isDriver: true },
    { id: 4, name: "Alice Williams", isAdmin: false, isDriver: false },
  ];

  const handlePromoteToAdmin = (memberId: number) => {
    console.log(`Promoting member ${memberId} to admin`);
    // Backend integration will go here
  };

  const handleRemoveAdmin = (memberId: number) => {
    console.log(`Removing admin status from member ${memberId}`);
    // Backend integration will go here
  };

  const handleRemoveMember = (memberId: number) => {
    console.log(`Removing member ${memberId}`);
    // Backend integration will go here
  };

  const handleAuthorizeDriver = (memberId: number) => {
    console.log(`Authorizing member ${memberId} as driver`);
    // Backend integration will go here
  };

  const handleRevokeDriver = (memberId: number) => {
    console.log(`Revoking driver status from member ${memberId}`);
    // Backend integration will go here
  };

  const handleCopyAccessCode = () => {
    navigator.clipboard.writeText(accessCode);
    alert("Access code copied to clipboard!");
  };

  return (
    <div className="bg-gray-100 border-2 border-black rounded-lg p-8 mb-8">
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
                {members.map((member) => (
                  <div
                    key={member.id}
                    className="bg-white border-2 border-black rounded-lg p-4"
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex-1">
                        <p className="font-bold text-lg">{member.name}</p>
                        <div className="flex gap-2 mt-1">
                          {member.isAdmin && (
                            <span className="text-xs bg-black text-white px-2 py-1 rounded-full">
                              Admin
                            </span>
                          )}
                          {member.isDriver && (
                            <span className="text-xs bg-gray-700 text-white px-2 py-1 rounded-full">
                              Driver
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        {/* Owner-only controls */}
                        {isOwner && (
                          <>
                            {!member.isAdmin ? (
                              <button
                                onClick={() => handlePromoteToAdmin(member.id)}
                                className="h-[2rem] px-4 text-xs border-2 border-green-600 text-green-600 rounded-full hover:bg-green-600 hover:text-white transition"
                              >
                                Promote
                              </button>
                            ) : (
                              <button
                                onClick={() => handleRemoveAdmin(member.id)}
                                className="h-[2rem] px-4 text-xs border-2 border-orange-500 text-orange-500 rounded-full hover:bg-orange-500 hover:text-white transition"
                              >
                                Demote
                              </button>
                            )}
                          </>
                        )}

                        {/* Admin controls */}
                        <button
                          onClick={() => handleRemoveMember(member.id)}
                          className="h-[2rem] px-4 text-xs border-2 border-red-500 text-red-500 rounded-full hover:bg-red-500 hover:text-white transition"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
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
                {members.map((member) => (
                  <div
                    key={member.id}
                    className="bg-white border-2 border-black rounded-lg p-4"
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex-1">
                        <p className="font-bold text-lg">{member.name}</p>
                        <div className="flex gap-2 mt-1">
                          {member.isDriver ? (
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
                        {!member.isDriver ? (
                          <button
                            onClick={() => handleAuthorizeDriver(member.id)}
                            className="h-[2rem] px-4 text-xs border-2 border-green-600 text-green-600 rounded-full hover:bg-green-600 hover:text-white transition"
                          >
                            Authorize
                          </button>
                        ) : (
                          <button
                            onClick={() => handleRevokeDriver(member.id)}
                            className="h-[2rem] px-4 text-xs border-2 border-red-500 text-red-500 rounded-full hover:bg-red-500 hover:text-white transition"
                          >
                            Revoke
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default AdminPanel;
