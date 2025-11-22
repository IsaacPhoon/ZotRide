import { useState } from "react";
import { rideAPI } from "../services/api";
import ErrorModal from "./ErrorModal";
import RouteMap from "./RouteMap";

interface AcceptRidePopupProps {
  id: number;
  pickup: string;
  dropoff: string;
  time: string;
  date: string;
  riders: string[];
  comments: string[];
  cost: string;
  onClose: () => void;
  onRideAccepted?: () => void;
  isInActiveRide?: boolean;
}

const AcceptRidePopup = ({
  id,
  pickup,
  dropoff,
  time,
  date,
  riders,
  comments,
  cost,
  onClose,
  onRideAccepted,
  isInActiveRide = false,
}: AcceptRidePopupProps) => {
  const [isAccepting, setIsAccepting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [driverComment, setDriverComment] = useState("");

  const handleAccept = async () => {
    if (isInActiveRide) {
      setError(
        "You are already in an active ride. Please complete your current ride before accepting another."
      );
      return;
    }

    try {
      setIsAccepting(true);
      await rideAPI.acceptRide(id, driverComment || undefined);
      // Refresh the rides list
      if (onRideAccepted) {
        onRideAccepted();
      }
      onClose();
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

  return (
    <>
      <div
        className="fixed inset-0 z-50 w-full flex items-center justify-center bg-black/30 backdrop-blur-sm p-4"
        onClick={onClose}
      >
        <div
          className="bg-white border-2 border-black rounded-3xl max-w-6xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left side - Ride details and actions */}
              <div>
                <h2 className="card-title text-black font-bold text-2xl mb-4">
                  {pickup} → {dropoff} @ {time}
                </h2>
                <div className="space-y-3 text-black">
                  <p className="text-black">{date}</p>
                  <p className="text-black">
                    <b>Current Riders:</b>{" "}
                    {riders.length > 0 ? riders.join(", ") : "None yet"}
                  </p>
                  <p className="text-black">
                    <b>Rider Comments:</b>{" "}
                    {comments.length > 0 ? comments.join(", ") : "None yet"}
                  </p>
                  <p className="text-black">
                    <b>Ride Pay:</b> {cost}
                  </p>
                </div>

                <div className="mt-6">
                  <label className="text-black font-semibold">
                    Add a comment as the driver (optional):
                  </label>
                  <textarea
                    value={driverComment}
                    onChange={(e) => setDriverComment(e.target.value)}
                    className="textarea textarea-bordered w-full mt-2 bg-white text-black border-black"
                    placeholder="Any preferences or notes for the riders..."
                    rows={3}
                  />
                </div>

                <div className="card-actions justify-start gap-4 mt-6">
                  <button
                    onClick={onClose}
                    disabled={isAccepting}
                    className="h-[2.5rem] w-[8rem] btn btn-outline border-black text-black rounded-full hover:bg-black hover:text-white active:scale-100 px-6 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAccept}
                    disabled={isAccepting || isInActiveRide}
                    className="h-[2.5rem] w-[8rem] btn btn-outline border-black text-black rounded-full hover:bg-black hover:text-white active:scale-100 px-6 disabled:opacity-50"
                    title={
                      isInActiveRide ? "You are already in an active ride" : ""
                    }
                  >
                    {isAccepting ? "Accepting..." : "Accept"}
                  </button>
                </div>
              </div>

              {/* Right side - Map */}
              <div className="flex items-center">
                <RouteMap pickupAddress={pickup} destinationAddress={dropoff} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {error && <ErrorModal message={error} onClose={() => setError(null)} />}
    </>
  );
};

export default AcceptRidePopup;
