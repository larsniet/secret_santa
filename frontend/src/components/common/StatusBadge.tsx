import React from "react";
import { EventPlan } from "../../types/plans";

interface StatusBadgeProps {
  type: "status" | "plan";
  value: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ type, value }) => {
  const getStatusStyles = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-50 text-green-700 border-green-200";
      case "completed":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "pending_payment":
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const getPlanStyles = (plan: string) => {
    switch (plan) {
      case "BUSINESS":
        return "bg-purple-50 text-purple-800 border-purple-200";
      case "GROUP":
        return "bg-blue-50 text-blue-800 border-blue-200";
      default:
        return "bg-gray-50 text-gray-800 border-gray-200";
    }
  };

  const styles =
    type === "status" ? getStatusStyles(value) : getPlanStyles(value);
  const displayText =
    type === "status"
      ? value === "pending_payment"
        ? "Pending Payment"
        : value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()
      : `${value.charAt(0).toUpperCase() + value.toLowerCase().slice(1)} Plan`;

  return (
    <span
      className={`px-3 py-2 rounded-md text-sm font-medium inline-flex items-center border ${styles}`}
    >
      {displayText}
    </span>
  );
};
