import React from "react";

interface LoadingProps {
  className?: string;
  size?: "xs" | "sm" | "md" | "lg";
  centered?: boolean;
}

export const Loading: React.FC<LoadingProps> = ({
  className = "",
  size = "md",
  centered = true,
}) => {
  const sizeClasses = {
    xs: "h-4 w-4",
    sm: "h-8 w-8",
    md: "h-12 w-12",
    lg: "h-16 w-16",
  };

  const containerClasses = centered
    ? "flex justify-center items-center min-h-[16rem]"
    : "";

  const spinnerClasses = `animate-spin rounded-full border-b-2 border-[#B91C1C] ${sizeClasses[size]} ${className}`;

  const Spinner = () => (
    <div className={spinnerClasses} role="status">
      <span className="sr-only">Loading...</span>
    </div>
  );

  if (centered) {
    return (
      <div className={containerClasses}>
        <Spinner />
      </div>
    );
  }

  return <Spinner />;
};
