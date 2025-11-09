import { useState, useEffect } from "react";
import RequestRideForm from "./RequestRideForm";
import HomeNavCards from "./HomeNavCards";
import JoinRides from "./JoinRides";
import JoinRideCard from "./JoinRideCard";
import RouteMap from "./RouteMap";
import DestinationSearchModal from "./DestinationSearchModal";
import { rideAPI, type Ride } from "../services/api";

interface HomeProps {
  setActivePage: (
    page: "HOME" | "ABOUT" | "DRIVER" | "ORGANIZATIONS" | "PROFILE"
  ) => void;
}

const Home = ({ setActivePage }: HomeProps) => {
  const [activeRideRequest, setActiveRideRequest] = useState<Ride | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pickupAddress, setPickupAddress] = useState("");
  const [destinationAddress, setDestinationAddress] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      setIsSearchModalOpen(true);
    }
  };

  useEffect(() => {
    fetchUserActiveRideRequest();
  }, []);

  const fetchUserActiveRideRequest = async () => {
    try {
      setIsLoading(true);
      const activeRides = await rideAPI.getUserActiveRides();

      // Filter out past rides
      const now = new Date();
      const futureRides = activeRides.filter(
        (ride) => new Date(ride.pickup_time) > now
      );

      // Find the first ride without a driver (rider request)
      const rideRequest = futureRides.find((ride) => !ride.driver_id);

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
      {/* Destination Search Bar */}
      <div className="pt-[4rem] pb-[2rem] px-[2rem]">
        <div className="max-full justify-left">
          <h2 className="text-5xl font-bold mb-4 justify-left">Search for Rides</h2>
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="Where do you want to go?"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              className="flex-1 bg-gray-100 border-b-2 border-black px-4 py-3 focus:outline-none placeholder-black/50 rounded-t-lg text-lg"
            />
            <button
              onClick={handleSearch}
              className="px-8 py-3 bg-black text-white rounded-full hover:bg-gray-800 transition font-semibold"
            >
              Search
            </button>
          </div>
        </div>
      </div>

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
          <RequestRideForm
            onRideCreated={fetchUserActiveRideRequest}
            onPickupChange={setPickupAddress}
            onDestinationChange={setDestinationAddress}
          />
        )}
        <div className="flex flex-col justify-center">
          {activeRideRequest ? (
            <div>
              <h1 className="text-5xl font-bold">
                An AI generated picture will go here
              </h1>
            </div>
          ) : (
            <RouteMap
              pickupAddress={pickupAddress}
              destinationAddress={destinationAddress}
            />
          )}
        </div>
      </div>
      <HomeNavCards setActivePage={setActivePage} />
      <JoinRides />

      {/* Destination Search Modal */}
      <DestinationSearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        searchQuery={searchQuery}
      />
    </div>
  );
};

export default Home;
