import { useState } from "react";
import host from "../assets/zotride_host.png";
import { rideAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import type { CreateRideRequest } from "../services/api";
import ErrorModal from "./ErrorModal";
import AddressAutocomplete from "./AddressAutocomplete";

interface OrganizationFunctionsProps {
  organizationId: number;
  onRideCreated?: () => void; // Callback when a ride is successfully created
}

const OrganizationFunctions = ({
  organizationId,
  onRideCreated,
}: OrganizationFunctionsProps) => {
  const { user } = useAuth();
  const [pickupAddress, setPickupAddress] = useState("");
  const [destinationAddress, setDestinationAddress] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [maxRiders, setMaxRiders] = useState("4");
  const [priceOption, setPriceOption] = useState<
    "free" | "gas" | "gas with fee"
  >("free");
  const [comment, setComment] = useState("");
  const [commentLength, setCommentLength] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setComment(e.target.value);
    setCommentLength(e.target.value.length);
  };

  const handleSubmit = async () => {
    // Clear previous messages
    setError("");
    setSuccess("");

    // Validate required fields
    if (!pickupAddress.trim()) {
      setError("Pickup location is required");
      return;
    }
    if (!destinationAddress.trim()) {
      setError("Destination location is required");
      return;
    }
    if (!time.trim() || !date.trim()) {
      setError("Time and date are required");
      return;
    }
    if (!user?.id) {
      setError("You must be logged in to host a ride");
      return;
    }

    // Validate max riders
    const maxRidersNum = parseInt(maxRiders, 10);
    if (isNaN(maxRidersNum) || maxRidersNum < 1 || maxRidersNum > 10) {
      setError("Max riders must be between 1 and 10");
      return;
    }

    // Combine date and time into ISO format datetime
    const pickupTime = `${date}T${time}:00`;

    setIsLoading(true);

    try {
      const rideData: CreateRideRequest = {
        pickup_address: pickupAddress,
        destination_address: destinationAddress,
        pickup_time: pickupTime,
        price_option: priceOption,
        max_riders: maxRidersNum,
        driver_id: user.id, // This makes it a driver post
        organization_id: organizationId, // KEY: This makes it an organization ride
        driver_comment: comment.trim() || undefined,
      };

      await rideAPI.createRide(rideData);
      setSuccess("Club ride posted successfully!");

      // Call the callback to refresh the rides list
      if (onRideCreated) {
        onRideCreated();
      }

      // Clear form
      setPickupAddress("");
      setDestinationAddress("");
      setDate("");
      setTime("");
      setMaxRiders("4");
      setPriceOption("free");
      setComment("");
      setCommentLength(0);
    } catch (err: any) {
      console.error("Create Club Ride Error:", err);

      // Custom error message for driver not found
      let errorMessage =
        err.response?.data?.error ||
        "Failed to post club ride. Please try again.";
      if (errorMessage === "Driver not found") {
        errorMessage = "You are not a driver!";
      }

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white text-black px-[2rem]">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-[2rem] pt-[4rem] space-x-[8rem]">
        {/* Host a ZotRide Form - Left Side */}
        <div className="space-y-8">
          <h1 className="text-5xl font-bold mb-12">Host a Club ZotRide</h1>

          <div className="text-lg">
            <AddressAutocomplete
              value={pickupAddress}
              onChange={setPickupAddress}
              placeholder="Pickup Location"
              disabled={isLoading}
            />
          </div>

          <div>
            <AddressAutocomplete
              value={destinationAddress}
              onChange={setDestinationAddress}
              placeholder="Destination Location"
              disabled={isLoading}
            />
          </div>

          <div className="grid grid-cols-2 gap-8">
            <div>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-gray-100 border-b-2 border-black px-3 py-2 focus:outline-none placeholder-black/50 rounded-t-lg"
                disabled={isLoading}
              />
            </div>
            <div>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full bg-gray-100 border-b-2 border-black px-3 py-2 focus:outline-none placeholder-black/50 rounded-t-lg"
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8">
            <div>
              <input
                type="number"
                placeholder="Max Riders"
                value={maxRiders}
                onChange={(e) => setMaxRiders(e.target.value)}
                min="1"
                max="10"
                className="w-full bg-gray-100 border-b-2 border-black px-3 py-2 focus:outline-none placeholder-black/50 rounded-t-lg"
                disabled={isLoading}
              />
            </div>
            <div>
              <select
                value={priceOption}
                onChange={(e) =>
                  setPriceOption(
                    e.target.value as "free" | "gas" | "gas with fee"
                  )
                }
                className="w-full bg-gray-100 border-b-2 border-black px-3 py-2 focus:outline-none rounded-t-lg"
                disabled={isLoading}
              >
                <option value="free">Free</option>
                <option value="gas">Gas</option>
                <option value="gas with fee">Gas with Fee</option>
              </select>
            </div>
          </div>

          <div className="relative pb-4">
            <textarea
              placeholder="Comments"
              rows={5}
              maxLength={500}
              value={comment}
              onChange={handleCommentChange}
              className="w-full bg-gray-100 border-b-2 border-black px-3 focus:outline-none placeholder-black/50 resize-none rounded-t-lg"
              disabled={isLoading}
            />
            <div className="absolute bottom-0 right-0 text-xs text-black/50">
              {commentLength}/500
            </div>
          </div>

          {success && (
            <div className="text-green-600 text-sm font-medium">{success}</div>
          )}

          <div className="grid grid-cols-2 gap-8">
            <div
              className="flex rounded-full h-[3rem] border border-black items-center justify-center cursor-pointer hover:bg-black hover:text-white transition px-8"
              onClick={handleSubmit}
            >
              {isLoading ? "Posting..." : "Host"}
            </div>
          </div>
        </div>

        {/* Right Side - Image */}
        <div className="flex items-center justify-center">
          <div className="relative max-w-md">
            <img
              src={host}
              alt="Organization illustration"
              className="w-full h-auto rounded-lg shadow-2xl"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-lg"></div>
          </div>
        </div>
      </div>

      {/* Error Modal */}
      <ErrorModal message={error} onClose={() => setError("")} />
    </div>
  );
};

export default OrganizationFunctions;
