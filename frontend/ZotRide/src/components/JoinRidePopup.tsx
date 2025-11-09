import { useState, useEffect } from "react";
import { rideAPI } from "../services/api";
import ErrorModal from "./ErrorModal";

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
  isInActiveRide = false,
}: JoinRidePopupProps) => {
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [comment, setComment] = useState("");
  const [currentRiders, setCurrentRiders] = useState<string[]>(riders);
  const [isLoadingRiders, setIsLoadingRiders] = useState(false);

  // Determine if ride has a driver
  const hasDriver = driver && driver !== "Unknown Driver";

  // Fetch current riders when popup opens
  useEffect(() => {
    const fetchRiders = async () => {
      try {
        setIsLoadingRiders(true);
        const ridersData = await rideAPI.getRideRiders(id);
        // Enrich rider data with names
        const enrichedRiders = await Promise.all(
          ridersData.map(async (rider) => {
            try {
              const userAPI = (await import("../services/api")).userAPI;
              const user = await userAPI.getUserById(rider.user_id);
              return user.name;
            } catch (err) {
              console.error(`Error fetching rider ${rider.user_id}:`, err);
              return "Unknown";
            }
          })
        );
        setCurrentRiders(enrichedRiders);
      } catch (err) {
        console.error("Error fetching riders:", err);
        // Fall back to the riders prop if API call fails
        setCurrentRiders(riders);
      } finally {
        setIsLoadingRiders(false);
      }
    };

    fetchRiders();
  }, [id, riders]);

  const handleJoin = async () => {
    if (isInActiveRide) {
      setError(
        "You are already in an active ride. Please complete or leave your current ride before joining another."
      );
      return;
    }

    try {
      setIsJoining(true);
      await rideAPI.joinRide(id, comment || undefined);
      // Refresh the rides list
      if (onRideJoined) {
        onRideJoined();
      }
      onClose();
    } catch (err: any) {
      console.error("Error joining ride:", err);
      setError(
        err.response?.data?.error || "Failed to join ride. Please try again."
      );
    } finally {
      setIsJoining(false);
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
                {isLoadingRiders
                  ? "Loading..."
                  : currentRiders.length > 0
                  ? currentRiders.join(", ")
                  : "None yet"}
              </p>
              <p className="text-black">
                <b>Ride Cost:</b> {cost}
              </p>
            </div>

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

            <div className="card-actions justify-start gap-4 mt-4">
              <button
                onClick={onClose}
                disabled={isJoining}
                className="h-[2rem] w-[8rem] btn btn-outline border-black text-black rounded-full hover:bg-black hover:text-white active:scale-100 px-6 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleJoin}
                disabled={isJoining || isInActiveRide}
                className="h-[2rem] w-[8rem] btn btn-outline border-black text-black rounded-full hover:bg-black hover:text-white active:scale-100 px-6 disabled:opacity-50"
                title={
                  isInActiveRide ? "You are already in an active ride" : ""
                }
              >
                {isJoining ? "Joining..." : "Join"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {error && <ErrorModal message={error} onClose={() => setError(null)} />}
    </>
  );
};

export default JoinRidePopup;
