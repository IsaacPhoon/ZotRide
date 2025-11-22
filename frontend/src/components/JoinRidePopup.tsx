import { useState, useEffect } from "react";
import { rideAPI, authAPI } from "../services/api";
import ErrorModal from "./ErrorModal";
import RiderLicenseModal from "./RiderLicenseModal";

interface JoinRidePopupProps {
  id: number;
  pickup: string;
  dropoff: string;
  time: string;
  date: string;
  driver: string;
  riders: string[];
  cost: string;
  onClose: () => void;
  onRideJoined?: () => void;
  isInActiveRide?: boolean;
}

const JoinRidePopup = ({
  id,
  pickup,
  dropoff,
  time,
  date,
  driver,
  riders,
  cost,
  onClose,
  onRideJoined,
}: JoinRidePopupProps) => {
  const [isJoining, setIsJoining] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [comment, setComment] = useState("");
  const [currentRiders, setCurrentRiders] = useState<Array<{ user_id: number; name: string }>>([]);
  const [isLoadingRiders, setIsLoadingRiders] = useState(false);
  const [selectedRiderId, setSelectedRiderId] = useState<number | null>(null);
  const [isUserInThisRide, setIsUserInThisRide] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  // Determine if ride has a driver
  const hasDriver = driver && driver !== "Unknown Driver";

  // Fetch current user ID and check if they're in this ride
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const user = await authAPI.getCurrentUser();
        setCurrentUserId(user.id);
      } catch (err) {
        console.error("Error fetching current user:", err);
      }
    };

    fetchCurrentUser();
  }, []);

  // Fetch current riders when popup opens
  useEffect(() => {
    const fetchRiders = async () => {
      try {
        setIsLoadingRiders(true);
        const ridersData = await rideAPI.getRideRiders(id);
        // Map riders to include user_id and name
        const enrichedRiders = ridersData.map((rider) => ({
          user_id: rider.user_id,
          name: rider.name,
        }));
        setCurrentRiders(enrichedRiders);

        // Check if current user is in this ride
        if (currentUserId) {
          const userInRide = enrichedRiders.some(
            (rider) => rider.user_id === currentUserId
          );
          setIsUserInThisRide(userInRide);
        }
      } catch (err) {
        console.error("Error fetching riders:", err);
        // Fall back to the riders prop if API call fails
        const fallbackRiders = riders.map((name, index) => ({
          user_id: -index - 1, // Negative IDs for fallback data
          name,
        }));
        setCurrentRiders(fallbackRiders);
      } finally {
        setIsLoadingRiders(false);
      }
    };

    fetchRiders();
  }, [id, riders, currentUserId]);

  const handleJoin = async () => {
    try {
      setIsJoining(true);
      await rideAPI.joinRide(id, comment || undefined);
      // Refresh the rides list
      if (onRideJoined) {
        onRideJoined();
      }
      onClose();
    } catch (err: unknown) {
      console.error("Error joining ride:", err);
      const error = err as { response?: { data?: { error?: string } } };
      setError(
        error.response?.data?.error || "Failed to join ride. Please try again."
      );
    } finally {
      setIsJoining(false);
    }
  };

  const handleLeave = async () => {
    if (!window.confirm("Are you sure you want to leave this ride?")) {
      return;
    }

    try {
      setIsLeaving(true);
      await rideAPI.leaveRide(id);
      // Refresh the rides list
      if (onRideJoined) {
        onRideJoined();
      }
      onClose();
    } catch (err: unknown) {
      console.error("Error leaving ride:", err);
      const error = err as { response?: { data?: { error?: string } } };
      setError(
        error.response?.data?.error || "Failed to leave ride. Please try again."
      );
    } finally {
      setIsLeaving(false);
    }
  };

  return (
    <>
      <div
        className="fixed inset-0 z-50 w-full flex items-center justify-center bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      >
        <div
          className="card bg-white border-2 border-black rounded-3xl max-w-md w-full"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="card-body">
            <h2 className="card-title text-black font-bold text-xl">
              {pickup} → {dropoff} @ {time}
            </h2>
            <div className="space-y-2 text-black">
              <p className="text-black">{date}</p>
              <p className="text-black">
                <b>Driver:</b> {hasDriver ? driver : "No Driver Yet"}
              </p>
              <p className="text-black">
                <b>Current Riders:</b>{" "}
                {isLoadingRiders ? (
                  "Loading..."
                ) : currentRiders.length > 0 ? (
                  <span>
                    {currentRiders.map((rider, index) => (
                      <span key={rider.user_id}>
                        {rider.user_id > 0 ? (
                          <span
                            onClick={() => setSelectedRiderId(rider.user_id)}
                            className="underline cursor-pointer hover:text-blue-600 transition-colors font-semibold"
                            title="View rider's license"
                          >
                            {rider.name}
                          </span>
                        ) : (
                          <span>{rider.name}</span>
                        )}
                        {index < currentRiders.length - 1 && ", "}
                      </span>
                    ))}
                  </span>
                ) : (
                  "None yet"
                )}
              </p>
              <p className="text-black">
                <b>Ride Cost:</b> {cost}
              </p>
            </div>

            {!isUserInThisRide && (
              <div className="mt-4">
                <label className="text-black font-semibold">
                  Add a comment (optional):
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="textarea textarea-bordered w-full mt-2 bg-white text-black border-black"
                  placeholder="Any special requests or notes for the driver..."
                  rows={3}
                />
              </div>
            )}

            <div className="card-actions justify-start gap-4 mt-4">
              <button
                onClick={onClose}
                disabled={isJoining || isLeaving}
                className="h-[2rem] w-[8rem] btn btn-outline border-black text-black rounded-full hover:bg-black hover:text-white active:scale-100 px-6 disabled:opacity-50"
              >
                Cancel
              </button>
              {isUserInThisRide ? (
                <button
                  onClick={handleLeave}
                  disabled={isLeaving}
                  className="h-[2rem] w-[8rem] btn btn-outline border-red-500 text-red-500 rounded-full hover:bg-red-500 hover:text-white active:scale-100 px-6 disabled:opacity-50"
                >
                  {isLeaving ? "Leaving..." : "Leave"}
                </button>
              ) : (
                <button
                  onClick={handleJoin}
                  disabled={isJoining}
                  className="h-[2rem] w-[8rem] btn btn-outline border-black text-black rounded-full hover:bg-black hover:text-white active:scale-100 px-6 disabled:opacity-50"
                >
                  {isJoining ? "Joining..." : "Join"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {error && <ErrorModal message={error} onClose={() => setError(null)} />}

      {selectedRiderId && selectedRiderId > 0 && (
        <RiderLicenseModal
          riderId={selectedRiderId}
          onClose={() => setSelectedRiderId(null)}
        />
      )}
    </>
  );
};

export default JoinRidePopup;
