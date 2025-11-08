import React from 'react'

const RequestRideForm = () => {
  return (
    <div className="space-y-8">
      <h1 className="text-5xl font-bold mb-12">Request a ZotRide</h1>

      <div>
        <input
          type="text"
          placeholder="Pickup Location"
          className="w-full bg-transparent border-b-2 border-black text-2xl pb-2 focus:outline-none focus:border-blue-600 placeholder-black"
        />
      </div>

      <div>
        <input
          type="text"
          placeholder="Dropoff Location"
          className="w-full bg-transparent border-b-2 border-black text-2xl pb-2 focus:outline-none focus:border-blue-600 placeholder-black"
        />
      </div>

      <div className="grid grid-cols-2 gap-8">
        <div>
          <input
            type="text"
            placeholder="Time"
            className="w-full bg-transparent border-b-2 border-black text-2xl pb-2 focus:outline-none focus:border-blue-600 placeholder-black"
          />
        </div>
        <div>
          <input
            type="text"
            placeholder="Day"
            className="w-full bg-transparent border-b-2 border-black text-2xl pb-2 focus:outline-none focus:border-blue-600 placeholder-black"
          />
        </div>
      </div>

      <div>
        <input
          type="text"
          placeholder="Comments"
          className="w-full bg-transparent border-b-2 border-black text-2xl pb-2 focus:outline-none focus:border-blue-600 placeholder-black"
        />
      </div>
    </div>
  )
}

export default RequestRideForm