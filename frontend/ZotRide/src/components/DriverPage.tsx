import React, { useState, useEffect } from "react";
import HostRideForm from "./HostRideForm";
import RideRequestCard from "./RideRequestCard";
import DriverRideCard from "./DriverRideCard";
import RouteMap from "./RouteMap";
import { rideAPI, authAPI, driverAPI } from "../services/api";
import type { Ride } from "../services/api";

const DriverPage: React.FC = () => {
  const [rides, setRides] = useState<Ride[]>([]);
  const [currentRides, setCurrentRides] = useState<Ride[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingCurrentRides, setIsLoadingCurrentRides] = useState(true);
  const [error, setError] = useState("");
  const [pickupAddress, setPickupAddress] = useState("");
  const [destinationAddress, setDestinationAddress] = useState("");

  useEffect(() => {
    fetchCurrentUserAndRides();
    fetchCurrentDriverRides();
  }, []);

  const fetchCurrentUserAndRides = async () => {
    try {
      setIsLoading(true);
      // Get current user first
      const user = await authAPI.getCurrentUser();

      // Then fetch rider requests
      const riderRequests = await rideAPI.getRiderRequests();

      // Filter out rides where the current user is already a rider
      const filteredRides = riderRequests.filter((ride) => {
        // Check if current user is in the riders list
        return !ride.riders?.some((rider) => rider.user_id === user.id);
      });

      // Enrich rides with rider names
      const enrichedRides = await rideAPI.enrichRidesWithNames(filteredRides);

      setRides(enrichedRides);
    } catch (err: any) {
      console.error("Error fetching rider requests:", err);
      setError(err.response?.data?.error || "Failed to load ride requests");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRiderRequests = async () => {
    await fetchCurrentUserAndRides();
  };

  const fetchCurrentDriverRides = async () => {
    try {
      setIsLoadingCurrentRides(true);
      // Get current user's driver data
      const user = await authAPI.getCurrentUser();

      if (!user.driver_id) {
        setCurrentRides([]);
        return;
      }

      // Fetch rides for this driver
      const driverRides = await driverAPI.getDriverRides(
        user.driver_id,
        "active"
      );

      // Enrich rides with rider names
      const enrichedRides = await rideAPI.enrichRidesWithNames(driverRides);

      setCurrentRides(enrichedRides);
    } catch (err: any) {
      console.error("Error fetching driver rides:", err);
      setCurrentRides([]);
    } finally {
      setIsLoadingCurrentRides(false);
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
        {/* Split Screen: Current Ride (Left) and Active Ride Requests (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-[8rem]">
          {/* Left Side: Current Ride */}
          <div>
            <h1 className="text-5xl font-bold mb-8">Current Ride</h1>

            {isLoadingCurrentRides && (
              <div className="flex justify-center items-center h-[16rem]">
                <p className="text-gray-600 text-lg">
                  Loading your current rides...
                </p>
              </div>
            )}

            {!isLoadingCurrentRides && currentRides.length === 0 && (
              <div className="text-center text-gray-600 mt-12 mb-12">
                <p className="text-xl">
                  No active rides available at the moment.
                </p>
                <p className="mt-2">Check back later or host your own ride!</p>
              </div>
            )}

            {!isLoadingCurrentRides && currentRides.length > 0 && (
              <div className="space-y-6">
                {currentRides.map((ride) => {
                  const { time, date } = formatDateTime(ride.pickup_time);
                  return (
                    <DriverRideCard
                      key={ride.id}
                      id={ride.id}
                      pickup={ride.pickup_address}
                      dropoff={ride.destination_address}
                      time={time}
                      date={date}
                      riders={ride.riders?.length || 0}
                      cost={formatPriceOption(ride.price_option)}
                      ridersList={ride.riders?.map((r) => r.name) || []}
                      onRideCompleted={fetchCurrentDriverRides}
                    />
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Side: Active Ride Requests */}
          <div>
            <h1 className="text-5xl font-bold mb-8">Active Ride Requests</h1>

            {isLoading && (
              <div className="flex justify-center items-center h-[16rem]">
                <p className="text-gray-600 text-lg">
                  Loading ride requests...
                </p>
              </div>
            )}

            {error && (
              <div className="flex justify-center items-center h-[16rem]">
                <p className="text-red-600 text-lg">{error}</p>
              </div>
            )}

            {!isLoading && !error && rides.length === 0 && (
              <div className="flex justify-center items-center h-[16rem]">
                <p className="text-gray-600 text-lg">
                  No active ride requests available
                </p>
              </div>
            )}

            {!isLoading && !error && rides.length > 0 && (
              <div className="space-y-6 max-h-[40rem] overflow-y-auto pr-4">
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
                      riders={ride.riders?.length || 0}
                      cost={formatPriceOption(ride.price_option)}
                      ridersList={ride.riders?.map((r) => r.name) || []}
                      commentsList={
                        ride.riders
                          ?.map((r) => r.comment || "No comment")
                          .filter((c) => c !== "No comment") || []
                      }
                      onRideAccepted={fetchRiderRequests}
                    />
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Host a ZotRide Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-[8rem]">
          <HostRideForm
            onPickupChange={setPickupAddress}
            onDestinationChange={setDestinationAddress}
          />
          <div className="flex items-center justify-center">
            <RouteMap
              pickupAddress={pickupAddress}
              destinationAddress={destinationAddress}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriverPage;
