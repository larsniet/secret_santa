import React from "react";

export type AlertType = "success" | "error" | "info" | "warning";

interface AlertProps {
  type: AlertType;
  message: string;
  onClose?: () => void;
  isLeaving?: boolean;
}

export const Alert: React.FC<AlertProps> = ({
  type,
  message,
  onClose,
  isLeaving,
}) => {
  const styles = {
    success: "bg-green-50 text-green-800 border-green-200",
    error: "bg-red-50 text-red-800 border-red-200",
    info: "bg-blue-50 text-blue-800 border-blue-200",
    warning: "bg-yellow-50 text-yellow-800 border-yellow-200",
  };

  return (
    <div
      className={`p-4 rounded-lg border w-full sm:w-[320px] md:w-[400px] ${
        styles[type]
      } flex items-start justify-between 
        transition-all duration-300 ease-in-out transform
        ${
          isLeaving ? "opacity-0 translate-x-full" : "opacity-100 translate-x-0"
        }`}
      role="alert"
    >
      <div className="flex items-start gap-2 flex-1 min-w-0">
        <div className="flex-shrink-0 mt-0.5">
          {type === "success" && (
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
          )}
          {type === "error" && (
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </div>
        <span className="text-sm break-words">{message}</span>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="ml-4 flex-shrink-0 text-current opacity-50 hover:opacity-75 transition-opacity"
        >
          <span className="sr-only">Dismiss</span>
          <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      )}
    </div>
  );
};
