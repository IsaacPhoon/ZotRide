interface ErrorModalProps {
  message: string;
  onClose: () => void;
}

const ErrorModal = ({ message, onClose }: ErrorModalProps) => {
  if (!message) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="card bg-white border-2 border-red-500 rounded-3xl max-w-md w-full mx-4">
        <div className="card-body">
          <div className="flex items-center justify-between mb-4">
            <h2 className="card-title text-red-600 font-bold text-xl flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              Error
            </h2>
            <button
              onClick={onClose}
              className="btn btn-sm btn-circle btn-ghost text-black hover:bg-gray-200"
            >
              ✕
            </button>
          </div>
          <p className="text-black text-base">{message}</p>
          <div className="card-actions justify-end mt-4">
            <button
              onClick={onClose}
              className="btn bg-black text-white border-black hover:bg-gray-800 rounded-full px-8"
            >
              OK
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorModal;
