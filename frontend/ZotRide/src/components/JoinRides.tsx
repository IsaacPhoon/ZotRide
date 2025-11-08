import React from 'react'
import JoinRideCard from './JoinRideCard'

interface RideData {
  id: number
  pickup: string
  dropoff: string
  time: string
  date: string
  riders: number
  cost: string
}

const JoinRides = () => {
  const rides: RideData[] = [
    {
      id: 1,
      pickup: "UTC",
      dropoff: "Campus",
      time: "9:00 AM",
      date: "11/15/24",
      riders: 3,
      cost: "$3.00",
    },
    {
      id: 2,
      pickup: "Campus",
      dropoff: "South Coast Plaza",
      time: "2:30 PM",
      date: "11/15/24",
      riders: 2,
      cost: "$8.00",
    },
    {
      id: 3,
      pickup: "Newport Beach",
      dropoff: "Campus",
      time: "8:15 AM",
      date: "11/16/24",
      riders: 4,
      cost: "$5.00",
    },
    {
      id: 4,
      pickup: "Campus",
      dropoff: "Irvine Spectrum",
      time: "6:00 PM",
      date: "11/16/24",
      riders: 2,
      cost: "$4.00",
    },
    {
      id: 5,
      pickup: "Woodbridge",
      dropoff: "Campus",
      time: "10:00 AM",
      date: "11/17/24",
      riders: 3,
      cost: "$2.50",
    },
    {
      id: 6,
      pickup: "Campus",
      dropoff: "John Wayne Airport",
      time: "3:00 PM",
      date: "11/17/24",
      riders: 1,
      cost: "$10.00",
    },
    {
      id: 7,
      pickup: "Campus",
      dropoff: "Fashion Island",
      time: "4:30 PM",
      date: "11/18/24",
      riders: 2,
      cost: "$6.00",
    },
    {
      id: 8,
      pickup: "Tustin",
      dropoff: "Campus",
      time: "7:45 AM",
      date: "11/18/24",
      riders: 4,
      cost: "$4.50",
    },
    {
      id: 9,
      pickup: "Campus",
      dropoff: "Costa Mesa",
      time: "5:15 PM",
      date: "11/19/24",
      riders: 3,
      cost: "$5.50",
    },
    {
      id: 10,
      pickup: "Aliso Viejo",
      dropoff: "Campus",
      time: "8:30 AM",
      date: "11/19/24",
      riders: 2,
      cost: "$7.00",
    },
    {
      id: 11,
      pickup: "Campus",
      dropoff: "The District",
      time: "7:00 PM",
      date: "11/20/24",
      riders: 4,
      cost: "$3.50",
    },
    {
      id: 12,
      pickup: "Laguna Beach",
      dropoff: "Campus",
      time: "9:30 AM",
      date: "11/20/24",
      riders: 1,
      cost: "$9.00",
    },
  ]

  return (
    <div className="space-y-[2rem] pt-[4rem] pb-[4rem] px-[2rem]">
      <h1 className="text-5xl font-bold mb-12">Join a ZotRide</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 h-[32rem] overflow-y-auto pr-4">
        {rides.map((ride) => (
          <JoinRideCard
            key={ride.id}
            id={ride.id}
            pickup={ride.pickup}
            dropoff={ride.dropoff}
            time={ride.time}
            date={ride.date}
            riders={ride.riders}
            cost={ride.cost}
          />
        ))}
      </div>
    </div>
  )
}

export default JoinRides
