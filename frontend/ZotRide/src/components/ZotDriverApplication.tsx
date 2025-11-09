import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { driverAPI } from "../services/api";
import type { CreateDriverRequest } from "../services/api";
import ErrorModal from "./ErrorModal";

const ZotDriverApplication = () => {
  const { user, refreshUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Form state
  const [make, setMake] = useState("");
  const [year, setYear] = useState("");
  const [model, setModel] = useState("");
  const [licensePlate, setLicensePlate] = useState("");
  const [licenseImage, setLicenseImage] = useState("");

  // Check driver status
  // - No driver_id: User has not applied
  // - Has driver_id but is_driver is false: Pending approval
  // - Has driver_id and is_driver is true: Approved driver
  const hasNotApplied = !user?.driver_id;
  const hasPendingApplication =
    user?.driver_id !== null && user?.is_driver === false;
  const isApprovedDriver = user?.driver_id !== null && user?.is_driver === true;

  const handleLicenseUpload = () => {
    // TODO: Implement Cloudinary or other image upload service
    // For now, we'll use a placeholder URL input
    const url = prompt(
      "Enter the URL of your driver's license image (upload functionality coming soon):"
    );
    if (url) {
      setLicenseImage(url);
    }
  };

  const handleApply = async () => {
    // Validate required fields
    if (!make.trim()) {
      setError("Vehicle make is required");
      return;
    }
    if (!year.trim()) {
      setError("Vehicle year is required");
      return;
    }
    if (!model.trim()) {
      setError("Vehicle model is required");
      return;
    }
    if (!licensePlate.trim()) {
      setError("License plate is required");
      return;
    }
    if (!licenseImage.trim()) {
      setError("Driver's license image is required");
      return;
    }

    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const vehicleData = `${year} ${make} ${model}`;

      const driverData: CreateDriverRequest = {
        license_image: licenseImage.trim(),
        vehicle_data: vehicleData,
        license_plate: licensePlate.trim().toUpperCase(),
      };

      await driverAPI.registerDriver(driverData);

      // Refresh user data to update driver status
      await refreshUser();

      setSuccess(
        "Application submitted successfully! Your application is pending admin approval."
      );

      // Clear form
      setMake("");
      setYear("");
      setModel("");
      setLicensePlate("");
      setLicenseImage("");
    } catch (err: any) {
      console.error("Driver Application Error:", err);
      setError(
        err.response?.data?.error ||
          "Failed to submit application. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (isApprovedDriver) {
    console.log("User role:", isApprovedDriver);
    return (
      <div className="space-y-8">
        <h1 className="text-5xl font-bold mb-12">ZotDriver Status</h1>
        <div className="bg-green-50 border-2 border-green-600 rounded-lg p-6 text-center">
          <p className="text-xl font-bold text-green-800 mb-2">
            ✓ You are an approved ZotDriver!
          </p>
          <p className="text-green-700">
            You can now host rides for other Anteaters.
          </p>
        </div>
      </div>
    );
  } else if (hasPendingApplication) {
    console.log("User role:", hasPendingApplication);
    return (
      <div className="space-y-8">
        <h1 className="text-5xl font-bold mb-12">ZotDriver Application</h1>
        <div className="bg-yellow-50 border-2 border-yellow-600 rounded-lg p-6 text-center">
          <p className="text-xl font-bold text-yellow-800 mb-2">
            Application Pending
          </p>
          <p className="text-yellow-700">
            Your driver application is under review by our admins.
          </p>
          <p className="text-yellow-700 text-sm mt-2">
            You will be notified once approved.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-8">
        <h1 className="text-5xl font-bold mb-12">Apply to be a ZotDriver</h1>

        <div className="text-lg">
          <input
            type="text"
            placeholder="Make (e.g., Honda)"
            value={make}
            onChange={(e) => setMake(e.target.value)}
            disabled={isLoading}
            className="w-full bg-gray-100 border-b-2 border-black px-3 py-2 focus:outline-none placeholder-black/50 rounded-t-lg disabled:opacity-50"
          />
        </div>

        <div>
          <input
            type="text"
            placeholder="Year (e.g., 2020)"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            disabled={isLoading}
            className="w-full bg-gray-100 border-b-2 border-black px-3 py-2 focus:outline-none placeholder-black/50 rounded-t-lg disabled:opacity-50"
          />
        </div>

        <div>
          <input
            type="text"
            placeholder="Model (e.g., Accord)"
            value={model}
            onChange={(e) => setModel(e.target.value)}
            disabled={isLoading}
            className="w-full bg-gray-100 border-b-2 border-black px-3 py-2 focus:outline-none placeholder-black/50 rounded-t-lg disabled:opacity-50"
          />
        </div>

        <div>
          <input
            type="text"
            placeholder="License Plate (e.g., ABC1234)"
            value={licensePlate}
            onChange={(e) => setLicensePlate(e.target.value.toUpperCase())}
            disabled={isLoading}
            className="w-full bg-gray-100 border-b-2 border-black px-3 py-2 focus:outline-none placeholder-black/50 rounded-t-lg disabled:opacity-50"
          />
        </div>

        <div className="space-y-4">
          <button
            onClick={handleLicenseUpload}
            disabled={isLoading}
            className="w-full flex rounded-full h-[3rem] border-2 border-black items-center justify-center cursor-pointer hover:bg-gray-100 transition px-8 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {licenseImage ? "✓ License Uploaded" : "Upload Driver's License"}
          </button>

          <button
            onClick={handleApply}
            disabled={isLoading}
            className="w-full flex rounded-full h-[3rem] border-2 border-black items-center justify-center cursor-pointer hover:bg-black hover:text-white transition px-8 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Submitting..." : "Apply"}
          </button>
        </div>

        {success && (
          <div className="bg-green-50 border-2 border-green-600 rounded-lg p-4 text-green-800">
            {success}
          </div>
        )}
      </div>

      {/* Error Modal */}
      <ErrorModal message={error} onClose={() => setError("")} />
    </>
  );
};

export default ZotDriverApplication;
