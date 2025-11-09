import { useState, useEffect } from "react";
import JoinRideCard from "./JoinRideCard";
import { organizationAPI, type Ride } from "../services/api";

interface ClubJoinRidesProps {
  organizationId: number;
  refreshTrigger?: number; // When this changes, it triggers a refresh
}

const ClubJoinRides = ({
  organizationId,
  refreshTrigger,
}: ClubJoinRidesProps) => {
  const [rides, setRides] = useState<Ride[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch organization rides on mount and when refreshTrigger changes
  useEffect(() => {
    fetchOrganizationRides();
  }, [organizationId, refreshTrigger]);

  const fetchOrganizationRides = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Fetch only active rides for the organization
      const fetchedRides = await organizationAPI.getOrganizationRides(
        organizationId,
        "active"
      );
      setRides(fetchedRides);
    } catch (err: any) {
      console.error("Error fetching organization rides:", err);
      setError(err.response?.data?.error || "Failed to load rides");
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to format date/time from ISO string
  const formatDateTime = (isoString: string) => {
    const date = new Date(isoString);
    const time = date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
    const dateStr = date.toLocaleDateString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "2-digit",
    });
    return { time, date: dateStr };
  };

  // Helper function to determine cost display
  const getCostDisplay = (priceOption: string) => {
    switch (priceOption) {
      case "free":
        return "Free";
      case "gas":
        return "Gas";
      case "gas with fee":
        return "Gas + Fee";
      default:
        return priceOption;
    }
  };

  return (
    <div className="space-y-[2rem] pt-[4rem] pb-[4rem] px-[2rem]">
      <h1 className="text-5xl font-bold mb-12">Join a Club ZotRide</h1>

      {/* Loading State */}
      {isLoading && (
        <div className="text-center text-2xl py-8">Loading club rides...</div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-100 border-2 border-red-500 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Rides Grid */}
      {!isLoading && !error && (
        <>
          {rides.length === 0 ? (
            <div className="text-center text-2xl py-8 text-gray-500">
              No active club rides available. Host one to get started!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 h-[32rem] overflow-y-auto pr-4">
              {rides.map((ride) => {
                const { time, date } = formatDateTime(ride.pickup_time);
                return (
                  <JoinRideCard
                    key={ride.id}
                    id={ride.id}
                    pickup={ride.pickup_address}
                    dropoff={ride.destination_address}
                    time={time}
                    date={date}
                    riders={ride.max_riders}
                    cost={getCostDisplay(ride.price_option)}
                  />
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ClubJoinRides;
