import React from "react";
import { useNavigate } from "react-router-dom";

export const BackButton: React.FC<{ navigateTo?: string }> = ({
  navigateTo,
}) => {
  const navigate = useNavigate();

  const handleBackClick = () => {
    if (navigateTo) {
      navigate(navigateTo);
      return;
    }

    const isExternalReferrer: boolean =
      document.referrer &&
      new URL(document.referrer).origin.includes(
        process.env.REACT_APP_API_URL || "http://localhost:5001/api"
      )
        ? false
        : true;

    if (isExternalReferrer || window.history.length <= 1) {
      navigate("/dashboard");
    } else {
      navigate(-1);
    }
  };

  return (
    <button
      onClick={handleBackClick}
      className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6"
    >
      <svg
        className="w-5 h-5 mr-2"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M10 19l-7-7m0 0l7-7m-7 7h18"
        />
      </svg>
      Back
    </button>
  );
};
