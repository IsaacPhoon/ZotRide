import { useState } from "react";
import RequestRideForm from "./RequestRideForm";
import HomeNavCards from "./HomeNavCards";
import JoinRides from "./JoinRides";
import RouteMap from "./RouteMap";
import DestinationSearchModal from "./DestinationSearchModal";

interface HomeProps {
  setActivePage: (
    page: "HOME" | "ABOUT" | "DRIVER" | "ORGANIZATIONS" | "PROFILE"
  ) => void;
}

const Home = ({ setActivePage }: HomeProps) => {
  const [pickupAddress, setPickupAddress] = useState("");
  const [destinationAddress, setDestinationAddress] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      setIsSearchModalOpen(true);
    }
  };

  const handleRideCreated = () => {
    // Increment trigger to refresh JoinRides
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="bg-white text-black px-[2rem]">
      {/* Destination Search Bar */}
      <div className="pt-[4rem] pb-[2rem] px-[2rem]">
        <div className="max-full justify-left">
          <h2 className="text-5xl font-bold mb-4 justify-left">
            Search for Rides
          </h2>
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
        <div>
          <RequestRideForm
            onPickupChange={setPickupAddress}
            onDestinationChange={setDestinationAddress}
            onRideCreated={handleRideCreated}
          />
        </div>
        <div className="flex flex-col justify-center">
          <RouteMap
            pickupAddress={pickupAddress}
            destinationAddress={destinationAddress}
          />
        </div>
      </div>
      <HomeNavCards setActivePage={setActivePage} />
      <JoinRides refreshTrigger={refreshTrigger} />

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
