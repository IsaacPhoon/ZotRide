import { useState, useEffect } from "react";
import JoinRideCard from "./JoinRideCard";
import ErrorModal from "./ErrorModal";
import { rideAPI, authAPI, type Ride } from "../services/api";

interface JoinRidesProps {
  refreshTrigger?: number;
}

const JoinRides = ({ refreshTrigger }: JoinRidesProps) => {
  const [rides, setRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [filterQuery, setFilterQuery] = useState("");

  useEffect(() => {
    fetchCurrentUser();
    fetchAllRides();
  }, []);

  // Refresh when refreshTrigger changes
  useEffect(() => {
    if (refreshTrigger !== undefined && refreshTrigger > 0) {
      fetchAllRides();
    }
  }, [refreshTrigger]);

  const fetchCurrentUser = async () => {
    try {
      const user = await authAPI.getCurrentUser();
      setCurrentUserId(user.id);
    } catch (err) {
      console.error("Error fetching current user:", err);
    }
  };

  const fetchAllRides = async () => {
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

      // Sort by pickup time (earliest first)
      futureRides.sort(
        (a, b) =>
          new Date(a.pickup_time).getTime() - new Date(b.pickup_time).getTime()
      );
      setRides(futureRides);
      setError(null);
    } catch (err: unknown) {
      console.error("Error fetching rides:", err);
      const error = err as { response?: { data?: { error?: string } } };
      setError(
        error.response?.data?.error || "Failed to load rides. Please try again."
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

  if (loading) {
    return (
      <div className="space-y-[2rem] pt-[4rem] pb-[4rem] px-[2rem]">
        <h1 className="text-5xl font-bold mb-12">Join a ZotRide</h1>
        <div className="flex justify-center items-center h-64">
          <div className="loading loading-spinner loading-lg"></div>
        </div>
      </div>
    );
  }

  // Filter rides based on search query
  const filteredRides = rides.filter((ride) => {
    if (!filterQuery.trim()) return true;
    const query = filterQuery.toLowerCase();
    return (
      ride.pickup_address.toLowerCase().includes(query) ||
      ride.destination_address.toLowerCase().includes(query) ||
      ride.driver?.name?.toLowerCase().includes(query)
    );
  });

  return (
    <>
      <div className="space-y-[2rem] pt-[4rem] pb-[4rem] px-[2rem]">
        <h1 className="text-5xl font-bold mb-12">Join a ZotRide</h1>

        {/* Filter Search Bar */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Filter by pickup, destination, or driver..."
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            className="w-full bg-gray-100 border-b-2 border-black px-4 py-3 focus:outline-none placeholder-black/50 rounded-t-lg"
          />
        </div>

        {filteredRides.length === 0 ? (
          <div className="text-center text-gray-600 mt-12">
            <p className="text-xl">
              {rides.length === 0
                ? "No active rides available at the moment."
                : "No rides match your filter."}
            </p>
            <p className="mt-2">
              {rides.length === 0
                ? "Check back later or host your own ride!"
                : "Try a different search term."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 h-[32rem] overflow-y-auto pr-4">
            {filteredRides.map((ride) => {
              // Check if current user owns this ride
              const isOwnRide =
                currentUserId &&
                // User is the driver
                (ride.driver_id === currentUserId ||
                  // User created the rider request (is the only rider and no driver)
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
                  onRideJoined={fetchAllRides}
                  isOwnRide={!!isOwnRide}
                />
              );
            })}
          </div>
        )}
      </div>

      {error && <ErrorModal message={error} onClose={() => setError(null)} />}
    </>
  );
};

export default JoinRides;
