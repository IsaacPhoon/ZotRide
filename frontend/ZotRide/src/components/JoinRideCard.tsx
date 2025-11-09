import { useState, useEffect } from "react";
import JoinRidePopup from "./JoinRidePopup";
import { rideAPI } from "../services/api";
import ErrorModal from "./ErrorModal";

interface JoinRideCardProps {
  id: number;
  pickup: string;
  dropoff: string;
  time: string;
  date: string;
  riders: number;
  cost: string;
  driver?: string;
  ridersList?: string[];
  onRideJoined?: () => void;
}

const JoinRideCard = ({
  id,
  pickup,
  dropoff,
  time,
  date,
  riders,
  cost,
  driver = "Unknown Driver",
  ridersList = [],
  onRideJoined,
}: JoinRideCardProps) => {
  const [showPopup, setShowPopup] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isJoining, setIsJoining] = useState(false);
  const [isInActiveRide, setIsInActiveRide] = useState(false);

  useEffect(() => {
    const checkActiveRide = async () => {
      try {
        const inRide = await rideAPI.isUserInActiveRide();
        setIsInActiveRide(inRide);
      } catch (err) {
        console.error("Error checking active ride:", err);
      }
    };
    checkActiveRide();
  }, []);

  const handleJoin = async () => {
    if (isInActiveRide) {
      setError(
        "You are already in an active ride. Please complete or leave your current ride before joining another."
      );
      return;
    }

    try {
      setIsJoining(true);
      await rideAPI.joinRide(id);
      // Refresh the rides list
      if (onRideJoined) {
        onRideJoined();
      }
    } catch (err: any) {
      console.error("Error joining ride:", err);
      setError(
        err.response?.data?.error || "Failed to join ride. Please try again."
      );
    } finally {
      setIsJoining(false);
    }
  };

  const handleSeeMore = () => {
    setShowPopup(true);
  };

  const handleClosePopup = () => {
    setShowPopup(false);
  };

  return (
    <>
      <div className="card border border-black bg-white/50 rounded-3xl max-h-[18rem]">
        <div className="card-body">
          <h2 className="card-title text-black font-bold text-xl">
            {pickup} → {dropoff} @ {time}
          </h2>
          <p className="text-black">{date}</p>
          <p className="text-black">{riders} Riders</p>
          <p className="text-black">Ride Cost: {cost}</p>
          <div className="card-actions justify-start gap-4 mt-2">
            <button
              onClick={handleJoin}
              disabled={isJoining || isInActiveRide}
              className="h-[2rem] w-[8rem] btn btn-outline border-black text-black rounded-full hover:bg-black hover:text-white active:scale-100 px-8 disabled:opacity-50"
              title={isInActiveRide ? "You are already in an active ride" : ""}
            >
              {isJoining ? "Joining..." : "Join"}
            </button>
            <button
              onClick={handleSeeMore}
              className="h-[2rem] w-[8rem] btn btn-outline border-black text-black rounded-full hover:bg-black hover:text-white active:scale-100 px-6"
            >
              See More
            </button>
          </div>
        </div>
      </div>

      {showPopup && (
        <JoinRidePopup
          id={id}
          pickup={pickup}
          dropoff={dropoff}
          time={time}
          date={date}
          driver={driver}
          riders={ridersList}
          cost={cost}
          onClose={handleClosePopup}
          onRideJoined={onRideJoined}
          isInActiveRide={isInActiveRide}
        />
      )}

      {error && <ErrorModal message={error} onClose={() => setError(null)} />}
    </>
  );
};

export default JoinRideCard;
