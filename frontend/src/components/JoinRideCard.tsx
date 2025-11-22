import { useState, useEffect } from "react";
import JoinRidePopup from "./JoinRidePopup";
import DriverLicenseModal from "./DriverLicenseModal";
import RiderLicenseModal from "./RiderLicenseModal";
import { rideAPI, authAPI } from "../services/api";
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
  driverId?: number; // Driver ID for showing license
  ridersList?: string[];
  onRideJoined?: () => void;
  isOwnRide?: boolean; // Whether this is the current user's ride
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
  driverId,
  ridersList = [],
  onRideJoined,
  isOwnRide = false,
}: JoinRideCardProps) => {
  const [showPopup, setShowPopup] = useState(false);
  const [showDriverLicense, setShowDriverLicense] = useState(false);
  const [selectedRiderId, setSelectedRiderId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isJoining, setIsJoining] = useState(false);
  const [isInActiveRide, setIsInActiveRide] = useState(false);
  const [isLeaveing, setIsLeaveing] = useState(false);
  const [currentRiders, setCurrentRiders] = useState<Array<{ user_id: number; name: string }>>([]);
  const [isLoadingRiders, setIsLoadingRiders] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [isUserInThisRide, setIsUserInThisRide] = useState(false);

  // Determine if ride has a driver
  const hasDriver = driver && driver !== "Unknown Driver";

  // Fetch current user ID
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

  // Fetch riders with their user IDs
  useEffect(() => {
    const fetchRiders = async () => {
      try {
        setIsLoadingRiders(true);
        const ridersData = await rideAPI.getRideRiders(id);
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
        const fallbackRiders = ridersList.map((name, index) => ({
          user_id: -index - 1,
          name,
        }));
        setCurrentRiders(fallbackRiders);
      } finally {
        setIsLoadingRiders(false);
      }
    };

    fetchRiders();
  }, [id, ridersList, currentUserId]);

  const handleJoin = async () => {
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

  const handleLeave = async () => {
    if (!window.confirm("Are you sure you want to leave this ride?")) {
      return;
    }

    try {
      setIsLeaveing(true);
      await rideAPI.leaveRide(id);
      // Refresh the rides list
      if (onRideJoined) {
        onRideJoined();
      }
    } catch (err: any) {
      console.error("Error leaving ride:", err);
      setError(
        err.response?.data?.error || "Failed to leave ride. Please try again."
      );
    } finally {
      setIsLeaveing(false);
    }
  };

  return (
    <>
      <div className="card border border-black bg-white/50 rounded-3xl max-h-[18rem]">
        <div className="card-body">
          <h2 className="card-title text-black font-bold text-xl line-clamp-3">
            {pickup} → {dropoff} @ {time}
          </h2>
          <p className="text-black">{date}</p>
          {!hasDriver && (
            <div className="badge badge-warning gap-2 text-black font-semibold">
              No Driver
            </div>
          )}
          {hasDriver && driverId && (
            <p className="text-black">
              Driver:{" "}
              <span
                onClick={() => setShowDriverLicense(true)}
                className="font-semibold underline cursor-pointer hover:text-blue-600 transition-colors"
                title="View driver's license"
              >
                {driver}
              </span>
            </p>
          )}
          <p className="text-black">
            Riders ({riders}):{" "}
            {isLoadingRiders ? (
              <span className="text-sm">Loading...</span>
            ) : currentRiders.length > 0 ? (
              <span>
                {currentRiders.slice(0, 3).map((rider, index) => (
                  <span key={rider.user_id}>
                    {rider.user_id > 0 ? (
                      <span
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedRiderId(rider.user_id);
                        }}
                        className="underline cursor-pointer hover:text-blue-600 transition-colors font-semibold"
                        title="View rider's license"
                      >
                        {rider.name}
                      </span>
                    ) : (
                      <span className="font-semibold">{rider.name}</span>
                    )}
                    {index < Math.min(currentRiders.length, 3) - 1 && ", "}
                  </span>
                ))}
                {currentRiders.length > 3 && (
                  <span className="text-sm"> +{currentRiders.length - 3} more</span>
                )}
              </span>
            ) : (
              <span className="text-sm">None yet</span>
            )}
          </p>
          <p className="text-black">Ride Cost: {cost}</p>
          <div className="card-actions justify-start gap-4 mt-2">
            {isOwnRide || isUserInThisRide ? (
              // Show Leave and See More for user's own ride or if they're in the ride
              <>
                <button
                  onClick={handleLeave}
                  disabled={isLeaveing}
                  className="h-[2rem] w-[8rem] btn btn-outline border-red-500 text-red-500 rounded-full hover:bg-red-500 hover:text-white active:scale-100 px-6 disabled:opacity-50"
                >
                  {isLeaveing ? "Leaving..." : "Leave"}
                </button>
                <button
                  onClick={handleSeeMore}
                  className="h-[2rem] w-[8rem] btn btn-outline border-black text-black rounded-full hover:bg-black hover:text-white active:scale-100 px-6"
                >
                  See More
                </button>
              </>
            ) : (
              // Show Join and See More for other rides
              <>
                <button
                  onClick={handleJoin}
                  disabled={isJoining}
                  className="h-[2rem] w-[8rem] btn btn-outline border-black text-black rounded-full hover:bg-black hover:text-white active:scale-100 px-8 disabled:opacity-50"
                >
                  {isJoining ? "Joining..." : "Join"}
                </button>
                <button
                  onClick={handleSeeMore}
                  className="h-[2rem] w-[8rem] btn btn-outline border-black text-black rounded-full hover:bg-black hover:text-white active:scale-100 px-6"
                >
                  See More
                </button>
              </>
            )}
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

      {showDriverLicense && driverId && (
        <DriverLicenseModal
          driverId={driverId}
          onClose={() => setShowDriverLicense(false)}
        />
      )}

      {selectedRiderId && selectedRiderId > 0 && (
        <RiderLicenseModal
          riderId={selectedRiderId}
          onClose={() => setSelectedRiderId(null)}
        />
      )}

      {error && <ErrorModal message={error} onClose={() => setError(null)} />}
    </>
  );
};

export default JoinRideCard;
