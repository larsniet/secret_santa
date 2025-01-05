import React from "react";

interface StatusBadgeProps {
  status: "open" | "locked" | "completed";
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const styles = {
    open: "bg-green-600 text-white",
    locked: "bg-blue-600 text-white",
    completed: "bg-gray-600 text-white",
  };

  const labels = {
    open: "Open",
    locked: "Locked",
    completed: "Completed",
  };

  return (
    <span
      className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-md ${styles[status]}`}
    >
      {labels[status]}
    </span>
  );
};
