interface RideRequestCardProps {
  id: number;
  pickup: string;
  dropoff: string;
  time: string;
  date: string;
  riders: number;
  cost: string;
}

const RideRequestCard = ({
  pickup,
  dropoff,
  time,
  date,
  riders,
  cost,
}: RideRequestCardProps) => {
  return (
    <div className="card border border-black bg-white/50 rounded-3xl">
      <div className="card-body">
        <h1 className="card-title text-black font-bold text-xl">
          {pickup} → {dropoff} @ {time}
        </h1>
        <p className="text-black">{date}</p>
        <p className="text-black">{riders} Riders</p>
        <p className="text-black">Ride Pay: {cost}</p>
        <div className="card-actions justify-start gap-4 mt-2">
          <button className="h-[2rem] w-[8rem] btn btn-outline border-black text-black rounded-full hover:bg-black hover:text-white active:scale-100 px-8">
            Accept
          </button>
          <button className="h-[2rem] w-[8rem] btn btn-outline border-black text-black rounded-full hover:bg-black hover:text-white active:scale-100 px-6">
            See More
          </button>
        </div>
      </div>
    </div>
  );
};

export default RideRequestCard;
