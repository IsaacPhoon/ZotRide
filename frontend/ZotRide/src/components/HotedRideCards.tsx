interface RideCardData {
  id: number;
  pickup: string;
  dropoff: string;
  time: string;
  date: string;
  riders: number;
  cost: string;
}

const HostRideCards = () => {
  const rides: RideCardData[] = [
    {
      id: 1,
      pickup: "Pickup",
      dropoff: "DropOff",
      time: "Ti:me",
      date: "xx/xx/xx",
      riders: 2,
      cost: "$5.00",
    },
    {
      id: 2,
      pickup: "Pickup",
      dropoff: "DropOff",
      time: "Ti:me",
      date: "xx/xx/xx",
      riders: 2,
      cost: "$5.00",
    },
    {
      id: 3,
      pickup: "Pickup",
      dropoff: "DropOff",
      time: "Ti:me",
      date: "xx/xx/xx",
      riders: 2,
      cost: "$5.00",
    },
    {
      id: 4,
      pickup: "Pickup",
      dropoff: "DropOff",
      time: "Ti:me",
      date: "xx/xx/xx",
      riders: 2,
      cost: "$5.00",
    },
    {
      id: 5,
      pickup: "Pickup",
      dropoff: "DropOff",
      time: "Ti:me",
      date: "xx/xx/xx",
      riders: 2,
      cost: "$5.00",
    },
    {
      id: 6,
      pickup: "Pickup",
      dropoff: "DropOff",
      time: "Ti:me",
      date: "xx/xx/xx",
      riders: 2,
      cost: "$5.00",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {rides.map((ride) => (
        <div
          key={ride.id}
          className="card border border-black bg-white/50 rounded-3xl"
        >
          <div className="card-body">
            <h2 className="card-title text-black font-bold text-xl">
              {ride.pickup} → {ride.dropoff} @ {ride.time}
            </h2>
            <p className="text-black">{ride.date}</p>
            <p className="text-black">{ride.riders} Riders</p>
            <p className="text-black">Ride Cost: {ride.cost}</p>
            <div className="card-actions justify-start gap-4 mt-2">
              <button className="h-[2rem] w-[8rem] btn btn-outline border-black text-black rounded-full hover:bg-black hover:text-white active:scale-100 px-8">
                Host
              </button>
              <button className="h-[2rem] w-[8rem] btn btn-outline border-black text-black rounded-full hover:bg-black hover:text-white active:scale-100 px-6">
                See More
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default HostRideCards;
