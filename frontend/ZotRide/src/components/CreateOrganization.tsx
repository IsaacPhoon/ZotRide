import { useState } from "react";
import zotride_createOrg from "../assets/zotride_createOrg.png";
import { organizationAPI } from "../services/api";

interface CreateOrganizationProps {
  onOrganizationCreated?: () => void;
}

const CreateOrganization = ({
  onOrganizationCreated,
}: CreateOrganizationProps) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [nameLength, setNameLength] = useState(0);
  const [descriptionLength, setDescriptionLength] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError("Organization name is required");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      await organizationAPI.createOrganization(
        name.trim(),
        description.trim() || undefined
      );

      // Success! Clear form
      setName("");
      setDescription("");
      setNameLength(0);
      setDescriptionLength(0);
      setSuccess(true);

      // Notify parent component to refresh the list
      if (onOrganizationCreated) {
        onOrganizationCreated();
      }

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      console.error("Error creating organization:", err);
      setError(err.response?.data?.error || "Failed to create organization");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white text-black py-[2rem] px-[4rem] lg:px-[4rem]">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-[8rem] items-center">
        <div className="space-y-10">
          <div>
            <h1 className="text-5xl font-bold mb-4">Create an</h1>
            <h1 className="text-5xl font-bold mb-12">Organization</h1>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-100 border-2 border-red-500 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="bg-green-100 border-2 border-green-500 text-green-700 px-4 py-3 rounded-lg">
              Organization created successfully!
            </div>
          )}

          <div className="relative pb-4">
            <input
              type="text"
              placeholder="Organization Name"
              maxLength={255}
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setNameLength(e.target.value.length);
              }}
              className="w-full bg-gray-100 border-b-2 border-black px-3 py-3 text-2xl focus:outline-none placeholder-black/50 rounded-t-lg"
            />
            <div className="absolute bottom-0 right-0 text-xs text-black/50">
              {nameLength}/255
            </div>
          </div>

          <div className="relative pb-4">
            <textarea
              placeholder="Organization Description"
              rows={5}
              maxLength={500}
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                setDescriptionLength(e.target.value.length);
              }}
              className="w-full bg-gray-100 border-b-2 border-black px-3 text-2xl focus:outline-none placeholder-black/50 resize-none rounded-t-lg"
            />
            <div className="absolute bottom-0 right-0 text-xs text-black/50 ">
              {descriptionLength}/500
            </div>
          </div>

          <div className="pt-0">
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full lg:w-auto flex rounded-full h-[3.5rem] border-2 border-black items-center justify-center cursor-pointer hover:bg-black hover:text-white transition px-16 text-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Creating..." : "Create Organization"}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-center">
          <div className="relative">
            <img
              src={zotride_createOrg}
              alt="Organization illustration"
              className="w-full h-auto rounded-lg shadow-2xl"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-lg"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateOrganization;
