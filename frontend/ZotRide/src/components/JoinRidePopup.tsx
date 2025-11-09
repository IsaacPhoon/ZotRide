interface JoinRidePopupProps {
  id: number;
  pickup: string;
  dropoff: string;
  time: string;
  date: string;
  driver: string;
  riders: string[];
  cost: string;
  onClose: () => void;
}

const JoinRidePopup = ({ pickup, dropoff, time, date, driver, riders, cost, onClose } : JoinRidePopupProps) => {
  return (
    <div className="fixed inset-0 z-50 w-full flex items-center justify-center bg-black/30 backdrop-blur-sm" onClick={onClose}>
      <div className="card bg-white border-2 border-black rounded-3xl max-w-md w-full" onClick={(e) => e.stopPropagation()}>
        <div className="card-body">
          <h2 className="card-title text-black font-bold text-xl">
            {pickup} → {dropoff} @ {time}
          </h2>
          <div className="space-y-2 text-black">
            <p className="text-black">{date}</p>
            <p className="text-black"><b>Driver:</b> {driver}</p>
            <p className="text-black"><b>Current Riders:</b> {riders.length > 0 ? riders.join(', ') : 'None yet'}</p>
            <p className="text-black"><b>Ride Cost:</b> {cost}</p>
          </div>
          <p className="text-black mt-2">Are you sure you want to join this ride?</p>
          <div className="card-actions justify-start gap-4 mt-4">
            <button
              onClick={onClose}
              className="h-[2rem] w-[8rem] btn btn-outline border-black text-black rounded-full hover:bg-black hover:text-white active:scale-100 px-6"
            >
              Cancel
            </button>
            <button
              className="h-[2rem] w-[8rem] btn btn-outline border-black text-black rounded-full hover:bg-black hover:text-white active:scale-100 px-6"
            >
              Join
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default JoinRidePopup