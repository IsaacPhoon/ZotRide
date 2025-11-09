import { useState, useEffect } from "react";
import { rideAPI, authAPI, type Ride } from "../services/api";
import JoinRideCard from "./JoinRideCard";
import ErrorModal from "./ErrorModal";

interface DestinationSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  searchQuery: string;
}

const DestinationSearchModal = ({
  isOpen,
  onClose,
  searchQuery,
}: DestinationSearchModalProps) => {
  const [rides, setRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  useEffect(() => {
    if (isOpen && searchQuery) {
      searchRides();
    }
  }, [isOpen, searchQuery]);

  const fetchCurrentUser = async () => {
    try {
      const user = await authAPI.getCurrentUser();
      setCurrentUserId(user.id);
    } catch (err) {
      console.error("Error fetching current user:", err);
    }
  };

  const searchRides = async () => {
    try {
      setLoading(true);
      // Fetch both driver posts and rider requests
      const [driverPosts, riderRequests] = await Promise.all([
        rideAPI.getDriverPosts(),
        rideAPI.getRiderRequests(),
      ]);

      // Combine both arrays
      const allRides = [...driverPosts, ...riderRequests];

      // Enrich rides with driver and rider names
      const enrichedRides = await rideAPI.enrichRidesWithNames(allRides);

      // Filter out past rides
      const now = new Date();
      const futureRides = enrichedRides.filter(
        (ride) => new Date(ride.pickup_time) > now
      );

      // Filter by destination (case-insensitive search)
      const filteredRides = futureRides.filter((ride) =>
        ride.destination_address
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
      );

      // Sort by pickup time (earliest first)
      filteredRides.sort(
        (a, b) =>
          new Date(a.pickup_time).getTime() - new Date(b.pickup_time).getTime()
      );

      setRides(filteredRides);
      setError(null);
    } catch (err: any) {
      console.error("Error searching rides:", err);
      setError(
        err.response?.data?.error || "Failed to search rides. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "2-digit",
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatCost = (priceOption: string) => {
    switch (priceOption.toLowerCase()) {
      case "free":
        return "Free";
      case "gas":
        return "Split Gas";
      case "gas with fee":
        return "Gas + Fee";
      default:
        return priceOption;
    }
  };

  if (!isOpen) return null;

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
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold text-black">
                Rides to "{searchQuery}"
              </h2>
              <button
                onClick={onClose}
                className="btn btn-circle btn-ghost text-black"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="loading loading-spinner loading-lg"></div>
              </div>
            ) : rides.length === 0 ? (
              <div className="text-center text-gray-600 py-12">
                <p className="text-xl">
                  No rides found to "{searchQuery}" at the moment.
                </p>
                <p className="mt-2">Try a different destination or check back later!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {rides.map((ride) => {
                  // Check if current user owns this ride
                  const isOwnRide =
                    currentUserId &&
                    (ride.driver_id === currentUserId ||
                      (!ride.driver_id &&
                        ride.riders?.length === 1 &&
                        ride.riders[0].user_id === currentUserId));

                  return (
                    <JoinRideCard
                      key={ride.id}
                      id={ride.id}
                      pickup={ride.pickup_address}
                      dropoff={ride.destination_address}
                      time={formatTime(ride.pickup_time)}
                      date={formatDate(ride.pickup_time)}
                      riders={
                        ride.available_seats !== undefined
                          ? ride.max_riders - ride.available_seats
                          : 0
                      }
                      cost={formatCost(ride.price_option)}
                      driver={ride.driver?.name}
                      driverId={ride.driver_id ?? undefined}
                      ridersList={ride.riders?.map((r) => r.name) || []}
                      onRideJoined={() => {
                        searchRides();
                      }}
                      isOwnRide={!!isOwnRide}
                    />
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {error && <ErrorModal message={error} onClose={() => setError(null)} />}
    </>
  );
};

export default DestinationSearchModal;
