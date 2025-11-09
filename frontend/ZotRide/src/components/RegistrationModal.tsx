import React, { useState } from 'react';

interface RegistrationModalProps {
  name: string;
  email: string;
  onSubmit: (gender: number, preferredContact: string) => void;
  onClose: () => void;
  isLoading?: boolean;
}

const RegistrationModal: React.FC<RegistrationModalProps> = ({
  name,
  email,
  onSubmit,
  onClose,
  isLoading = false,
}) => {
  const [gender, setGender] = useState<number>(0);
  const [preferredContact, setPreferredContact] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!preferredContact.trim()) {
      setError('Preferred contact is required');
      return;
    }

    setError('');
    onSubmit(gender, preferredContact);
  };

  return (
    <div
      className="fixed inset-0 z-50 w-full flex items-center justify-center bg-black/30 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="card bg-white border-2 border-black rounded-3xl max-w-md w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="card-body">
          <h2 className="card-title text-black font-bold text-2xl mb-2">Complete Your Registration</h2>

          <div className="mb-4 space-y-1">
            <p className="text-black">
              <strong>Name:</strong> {name}
            </p>
            <p className="text-black">
              <strong>Email:</strong> {email}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Gender Selection */}
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-bold text-black">Gender</span>
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(Number(e.target.value))}
                className="select select-bordered w-full border-2 border-black rounded-full bg-white text-black focus:outline-none focus:border-black"
                disabled={isLoading}
              >
                <option value={0}>Male</option>
                <option value={1}>Female</option>
                <option value={2}>Other</option>
              </select>
            </div>

            {/* Preferred Contact */}
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-bold text-black">Preferred Contact</span>
              </label>
              <input
                type="text"
                placeholder="Email or phone number"
                value={preferredContact}
                onChange={(e) => setPreferredContact(e.target.value)}
                className="input input-bordered w-full border-2 border-black rounded-full bg-white text-black placeholder-gray-400 focus:outline-none focus:border-black"
                disabled={isLoading}
              />
            </div>

            {error && (
              <div className="alert alert-error bg-red-50 border-2 border-red-500 rounded-2xl">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 shrink-0 stroke-red-600"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="text-red-600 text-sm">{error}</span>
              </div>
            )}

            <div className="card-actions justify-start gap-4 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="h-[2.5rem] w-[8rem] btn btn-outline border-black text-black rounded-full hover:bg-black hover:text-white active:scale-100"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="h-[2.5rem] w-[8rem] btn border-black bg-black text-white rounded-full hover:bg-gray-800 active:scale-100"
                disabled={isLoading}
              >
                {isLoading ? 'Registering...' : 'Register'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegistrationModal;
