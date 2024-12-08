import React from "react";
import { Navbar } from "./Navbar";

interface LayoutProps {
  children: React.ReactNode;
  isLoading?: boolean;
  fullWidth?: boolean;
}

export const Layout: React.FC<LayoutProps> = ({
  children,
  isLoading,
  fullWidth = false,
}) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main
        className={`flex-1 ${
          isLoading
            ? "flex items-center justify-center min-h-[calc(100vh-64px)]"
            : "py-8"
        }`}
      >
        <div className={`${!isLoading ? "px-4 sm:px-6 lg:px-8" : ""} w-full`}>
          <div
            className={`${!fullWidth && !isLoading ? "max-w-7xl mx-auto" : ""}`}
          >
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};
