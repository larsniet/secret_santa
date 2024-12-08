import React from "react";
import { Navbar } from "./Navbar";

interface LayoutProps {
  children: React.ReactNode;
  isLoading?: boolean;
}

export const Layout: React.FC<LayoutProps> = ({ children, isLoading }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main
        className={
          isLoading
            ? "flex-1 flex items-center justify-center min-h-[calc(100vh-64px)]"
            : "px-4 py-8 sm:px-6 lg:px-8"
        }
      >
        <div className={isLoading ? undefined : "max-w-7xl mx-auto"}>
          {children}
        </div>
      </main>
    </div>
  );
};
