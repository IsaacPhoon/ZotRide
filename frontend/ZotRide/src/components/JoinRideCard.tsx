interface JoinRideCardProps {
  id: number;
  pickup: string;
  dropoff: string;
  time: string;
  date: string;
  riders: number;
  cost: string;
}

const JoinRideCard = ({
  id,
  pickup,
  dropoff,
  time,
  date,
  riders,
  cost,
}: JoinRideCardProps) => {
  return (
    <div className="card border border-black bg-white/50 rounded-3xl">
      <div className="card-body">
        <h2 className="card-title text-black font-bold text-xl">
          {pickup} → {dropoff} @ {time}
        </h2>
        <p className="text-black">{date}</p>
        <p className="text-black">{riders} Riders</p>
        <p className="text-black">Ride Cost: {cost}</p>
        <div className="card-actions justify-start gap-4 mt-2">
          <button className="h-[2rem] w-[8rem] btn btn-outline border-black text-black rounded-full hover:bg-black hover:text-white active:scale-100 px-8">
            Join
          </button>
          <button className="h-[2rem] w-[8rem] btn btn-outline border-black text-black rounded-full hover:bg-black hover:text-white active:scale-100 px-6">
            See More
          </button>
        </div>
      </div>
    </div>
  );
};

export default JoinRideCard;
