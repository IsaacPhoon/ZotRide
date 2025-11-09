import { useState, useEffect } from "react";
import JoinRideCard from "./JoinRideCard";
import ErrorModal from "./ErrorModal";
import { rideAPI, type Ride } from "../services/api";

const JoinRides = () => {
  const [rides, setRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDriverPosts();
  }, []);

  const fetchDriverPosts = async () => {
    try {
      setLoading(true);
      const data = await rideAPI.getDriverPosts();
      setRides(data);
      setError(null);
    } catch (err: any) {
      console.error("Error fetching driver posts:", err);
      setError(
        err.response?.data?.error || "Failed to load rides. Please try again."
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

  return (
    <>
      <div className="space-y-[2rem] pt-[4rem] pb-[4rem] px-[2rem]">
        <h1 className="text-5xl font-bold mb-12">Join a ZotRide</h1>
        {rides.length === 0 ? (
          <div className="text-center text-gray-600 mt-12">
            <p className="text-xl">No active rides available at the moment.</p>
            <p className="mt-2">Check back later or host your own ride!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 h-[32rem] overflow-y-auto pr-4">
            {rides.map((ride) => (
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
                ridersList={ride.riders?.map((r) => r.name) || []}
                onRideJoined={fetchDriverPosts}
              />
            ))}
          </div>
        )}
      </div>

      {error && <ErrorModal message={error} onClose={() => setError(null)} />}
    </>
  );
};

export default JoinRides;
