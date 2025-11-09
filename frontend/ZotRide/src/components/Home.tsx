import { useState, useEffect } from "react";
import RequestRideForm from "./RequestRideForm";
import HomeNavCards from "./HomeNavCards";
import JoinRides from "./JoinRides";
import JoinRideCard from "./JoinRideCard";
import { rideAPI, type Ride } from "../services/api";

interface HomeProps {
  setActivePage: (
    page: "HOME" | "ABOUT" | "DRIVER" | "ORGANIZATIONS" | "PROFILE"
  ) => void;
}

const Home = ({ setActivePage }: HomeProps) => {
  const [activeRideRequest, setActiveRideRequest] = useState<Ride | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchUserActiveRideRequest();
  }, []);

  const fetchUserActiveRideRequest = async () => {
    try {
      setIsLoading(true);
      const activeRides = await rideAPI.getUserActiveRides();
      // Find the first ride without a driver (rider request)
      const rideRequest = activeRides.find((ride) => !ride.driver_id);

      // Enrich with driver and rider names if found
      if (rideRequest) {
        const enrichedRide = await rideAPI.enrichRideWithNames(rideRequest);
        setActiveRideRequest(enrichedRide);
      } else {
        setActiveRideRequest(null);
      }
    } catch (err) {
      console.error("Error fetching active ride request:", err);
      setActiveRideRequest(null);
    } finally {
      setIsLoading(false);
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

  return (
    <div className="bg-white text-black px-[2rem]">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-[2rem] pt-[4rem] space-x-[8rem]">
        {isLoading ? (
          <div className="flex items-center justify-center">
            <div className="loading loading-spinner loading-lg"></div>
          </div>
        ) : activeRideRequest ? (
          <div>
            <h1 className="text-5xl font-bold mb-8">Your ZotRide Request</h1>
            <JoinRideCard
              id={activeRideRequest.id}
              pickup={activeRideRequest.pickup_address}
              dropoff={activeRideRequest.destination_address}
              time={formatTime(activeRideRequest.pickup_time)}
              date={formatDate(activeRideRequest.pickup_time)}
              riders={
                activeRideRequest.available_seats !== undefined
                  ? activeRideRequest.max_riders -
                    activeRideRequest.available_seats
                  : 0
              }
              cost={formatCost(activeRideRequest.price_option)}
              driver={activeRideRequest.driver?.name}
              ridersList={activeRideRequest.riders?.map((r) => r.name) || []}
              onRideJoined={fetchUserActiveRideRequest}
              isOwnRide={true}
            />
          </div>
        ) : (
          <RequestRideForm onRideCreated={fetchUserActiveRideRequest} />
        )}
        <div>
          <h1 className="text-5xl font-bold">
            An AI generated picture will go here
          </h1>
        </div>
      </div>
      <HomeNavCards setActivePage={setActivePage} />
      <JoinRides />
    </div>
  );
};

export default Home;
