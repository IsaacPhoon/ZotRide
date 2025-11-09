import { useState } from "react";
import { rideAPI } from "../services/api";
import ErrorModal from "./ErrorModal";

interface DriverRideCardProps {
  id: number;
  pickup: string;
  dropoff: string;
  time: string;
  date: string;
  riders: number;
  cost: string;
  ridersList?: string[];
  onRideCompleted?: () => void;
}

const DriverRideCard = ({
  id,
  pickup,
  dropoff,
  time,
  date,
  riders,
  cost,
  ridersList = [],
  onRideCompleted,
}: DriverRideCardProps) => {
  const [error, setError] = useState<string | null>(null);
  const [isCompleting, setIsCompleting] = useState(false);

  const handleComplete = async () => {
    if (
      !window.confirm("Are you sure you want to mark this ride as completed?")
    ) {
      return;
    }

    try {
      setIsCompleting(true);
      await rideAPI.completeRide(id);
      // Refresh the rides list
      if (onRideCompleted) {
        onRideCompleted();
      }
    } catch (err: any) {
      console.error("Error completing ride:", err);
      setError(
        err.response?.data?.error ||
          err.message ||
          "Failed to complete ride. Please try again."
      );
    } finally {
      setIsCompleting(false);
    }
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
          <p className="text-black">
            <b>Current Riders:</b>{" "}
            {ridersList.length > 0 ? ridersList.join(", ") : "None"}
          </p>
          <p className="text-black">Ride Pay: {cost}</p>
          <div className="card-actions justify-start gap-4 mt-2">
            <button
              onClick={handleComplete}
              disabled={isCompleting}
              className="h-[2rem] w-[8rem] btn btn-outline border-green-600 text-green-600 rounded-full hover:bg-green-600 hover:text-white active:scale-100 px-6 disabled:opacity-50"
            >
              {isCompleting ? "Completing..." : "Complete"}
            </button>
          </div>
        </div>
      </div>

      {error && <ErrorModal message={error} onClose={() => setError(null)} />}
    </>
  );
};

export default DriverRideCard;
