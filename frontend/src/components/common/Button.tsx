import React from "react";
import { Link } from "react-router-dom";
import { Loading } from "./Loading";

type ButtonVariant = "primary" | "secondary" | "danger" | "link";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  to?: string;
  isLoading?: boolean;
}

const variantStyles = {
  primary: "bg-[#B91C1C] text-white hover:bg-[#991B1B] focus:ring-[#B91C1C]",
  secondary:
    "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 focus:ring-[#B91C1C]",
  danger:
    "bg-white text-red-700 border-red-300 hover:bg-red-50 focus:ring-red-500",
  link: "text-[#B91C1C] hover:text-[#991B1B] bg-transparent",
};

const sizeStyles = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-sm",
  lg: "px-6 py-3 text-base",
};

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  size = "md",
  fullWidth = false,
  to,
  isLoading = false,
  disabled,
  className = "",
  ...props
}) => {
  const baseStyles =
    "inline-flex items-center justify-center font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200";
  const width = fullWidth ? "w-full" : "";
  const border = variant !== "link" && variant !== "primary" ? "border" : "";

  const combinedClassName = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${width} ${border} ${className}`;

  if (to) {
    return (
      <Link to={to} className={combinedClassName}>
        {children}
      </Link>
    );
  }

  return (
    <button
      disabled={disabled || isLoading}
      className={combinedClassName}
      {...props}
    >
      {isLoading ? (
        <>
          <Loading
            size="sm"
            centered={false}
            className="-ml-1 mr-2 h-[13px] w-[13px]"
          />
          Loading...
        </>
      ) : (
        children
      )}
    </button>
  );
};
