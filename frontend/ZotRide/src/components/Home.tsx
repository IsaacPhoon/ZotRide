import { useState } from "react";
import RequestRideForm from "./RequestRideForm";
import HomeNavCards from "./HomeNavCards";
import JoinRides from "./JoinRides";
import RouteMap from "./RouteMap";

interface HomeProps {
  setActivePage: (
    page: "HOME" | "ABOUT" | "DRIVER" | "ORGANIZATIONS" | "PROFILE"
  ) => void;
}

const Home = ({ setActivePage }: HomeProps) => {
  const [pickupAddress, setPickupAddress] = useState("");
  const [destinationAddress, setDestinationAddress] = useState("");

  return (
    <div className="bg-white text-black px-[2rem]">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-[2rem] pt-[4rem] space-x-[8rem]">
        <RequestRideForm
          onPickupChange={setPickupAddress}
          onDestinationChange={setDestinationAddress}
        />
        <div className="flex flex-col justify-center">
          <RouteMap
            pickupAddress={pickupAddress}
            destinationAddress={destinationAddress}
          />
        </div>
      </div>
      <HomeNavCards setActivePage={setActivePage} />
      <JoinRides />
    </div>
  );
};

export default Home;
