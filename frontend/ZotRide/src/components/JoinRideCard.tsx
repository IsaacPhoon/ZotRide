import { useState } from "react";
import JoinRidePopup from "./JoinRidePopup";

interface JoinRideCardProps {
  id: number;
  pickup: string;
  dropoff: string;
  time: string;
  date: string;
  riders: number;
  cost: string;
  driver?: string;
  ridersList?: string[];
}

const JoinRideCard = ({
  id,
  pickup,
  dropoff,
  time,
  date,
  riders,
  cost,
  driver = "Unknown Driver",
  ridersList = [],
}: JoinRideCardProps) => {
  const [showPopup, setShowPopup] = useState(false);

  const handleSeeMore = () => {
    setShowPopup(true);
  };

  const handleClosePopup = () => {
    setShowPopup(false);
  };

  return (
    <>
      <div className="card border border-black bg-white/50 rounded-3xl">
        <div className="card-body">
          <h2 className="card-title text-black font-bold text-xl truncate">
            {pickup} → {dropoff} @ {time}
          </h2>
          <p className="text-black">{date}</p>
          <p className="text-black">{riders} Riders</p>
          <p className="text-black">Ride Cost: {cost}</p>
          <div className="card-actions justify-start gap-4 mt-2">
            <button className="h-[2rem] w-[8rem] btn btn-outline border-black text-black rounded-full hover:bg-black hover:text-white active:scale-100 px-8">
              Join
            </button>
            <button
              onClick={handleSeeMore}
              className="h-[2rem] w-[8rem] btn btn-outline border-black text-black rounded-full hover:bg-black hover:text-white active:scale-100 px-6"
            >
              See More
            </button>
          </div>
        </div>
      </div>

      {showPopup && (
        <JoinRidePopup
          id={id}
          pickup={pickup}
          dropoff={dropoff}
          time={time}
          date={date}
          driver={driver}
          riders={ridersList}
          cost={cost}
          onClose={handleClosePopup}
        />
      )}
    </>
  );
};

export default JoinRideCard;
