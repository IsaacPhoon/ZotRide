import React, { useState, useEffect } from "react";
import HostRideForm from "./HostRideForm";
import RideRequestCard from "./RideRequestCard";
import testImage from "../assets/testimage2.avif";
import { rideAPI } from "../services/api";
import type { Ride } from "../services/api";

const DriverPage: React.FC = () => {
  const [rides, setRides] = useState<Ride[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchRiderRequests();
  }, []);

  const fetchRiderRequests = async () => {
    try {
      setIsLoading(true);
      const riderRequests = await rideAPI.getRiderRequests();
      setRides(riderRequests);
    } catch (err: any) {
      console.error("Error fetching rider requests:", err);
      setError(err.response?.data?.error || "Failed to load ride requests");
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to format date and time
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

  // Helper function to format price option
  const formatPriceOption = (priceOption: string): string => {
    const priceMap: { [key: string]: string } = {
      free: "Free",
      gas: "Gas Money",
      "gas with fee": "Gas + Fee",
    };
    return priceMap[priceOption] || priceOption;
  };
  return (
    <div className="px-[2rem]">
      <div className="min-h-screen bg-white text-black px-[2rem] py-[4rem]">
        <div className="mb-[8rem]">
          <h1 className="text-5xl font-bold mb-8">Current Ride</h1>
          <h1 className="text-5xl font-bold mb-8">Active Ride Requests</h1>

          {isLoading && (
            <div className="flex justify-center items-center h-[32rem]">
              <p className="text-gray-600 text-lg">Loading ride requests...</p>
            </div>
          )}

          {error && (
            <div className="flex justify-center items-center h-[32rem]">
              <p className="text-red-600 text-lg">{error}</p>
            </div>
          )}

          {!isLoading && !error && rides.length === 0 && (
            <div className="flex justify-center items-center h-[32rem]">
              <p className="text-gray-600 text-lg">
                No active ride requests available
              </p>
            </div>
          )}

          {!isLoading && !error && rides.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 h-[32rem] overflow-y-auto pr-4">
              {rides.map((ride) => {
                const { time, date } = formatDateTime(ride.pickup_time);
                return (
                  <RideRequestCard
                    key={ride.id}
                    id={ride.id}
                    pickup={ride.pickup_address}
                    dropoff={ride.destination_address}
                    time={time}
                    date={date}
                    riders={ride.max_riders}
                    cost={formatPriceOption(ride.price_option)}
                    onRideAccepted={fetchRiderRequests}
                  />
                );
              })}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-[8rem]">
          <HostRideForm />
          <div className="flex items-center justify-center">
            <img
              src={testImage}
              alt="Ride illustration"
              className="w-full h-auto rounded-lg shadow-lg"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriverPage;
