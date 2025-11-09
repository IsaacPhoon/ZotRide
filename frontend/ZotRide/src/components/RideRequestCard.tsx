import { useState, useEffect } from "react";
import AcceptRidePopup from "./AcceptRidePopup";
import { rideAPI } from "../services/api";
import ErrorModal from "./ErrorModal";

interface RideRequestCardProps {
  id: number;
  pickup: string;
  dropoff: string;
  time: string;
  date: string;
  riders: number;
  cost: string;
  ridersList?: string[];
  commentsList?: string[];
  onRideAccepted?: () => void;
}

const RideRequestCard = ({
  id,
  pickup,
  dropoff,
  time,
  date,
  riders,
  cost,
  ridersList = [],
  commentsList = [],
  onRideAccepted,
}: RideRequestCardProps) => {
  const [showPopup, setShowPopup] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAccepting, setIsAccepting] = useState(false);
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

  const handleAccept = async () => {
    try {
      setIsAccepting(true);
      await rideAPI.acceptRide(id);
      // Refresh the rides list
      if (onRideAccepted) {
        onRideAccepted();
      }
    } catch (err: any) {
      console.error("Error accepting ride:", err);
      setError(
        err.response?.data?.error ||
          err.message ||
          "Failed to accept ride. Please try again."
      );
    } finally {
      setIsAccepting(false);
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
          <h1 className="card-title text-black font-bold text-xl">
            {pickup} → {dropoff} @ {time}
          </h1>
          <p className="text-black">{date}</p>
          <p className="text-black">{riders} Riders</p>
          <p className="text-black">Ride Pay: {cost}</p>
          <div className="card-actions justify-start gap-4 mt-2">
            <button
              onClick={handleAccept}
              disabled={isAccepting}
              className="h-[2rem] w-[8rem] btn btn-outline border-black text-black rounded-full hover:bg-black hover:text-white active:scale-100 px-8 disabled:opacity-50"
            >
              {isAccepting ? "Accepting..." : "Accept"}
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
        <AcceptRidePopup
          id={id}
          pickup={pickup}
          dropoff={dropoff}
          time={time}
          date={date}
          riders={ridersList}
          comments={commentsList}
          cost={cost}
          onClose={handleClosePopup}
          onRideAccepted={onRideAccepted}
          isInActiveRide={isInActiveRide}
        />
      )}

      {error && <ErrorModal message={error} onClose={() => setError(null)} />}
    </>
  );
};

export default RideRequestCard;
