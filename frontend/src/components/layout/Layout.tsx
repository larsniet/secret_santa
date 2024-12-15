import React from "react";
import { Loading } from "../common/Loading";
import { Navbar } from "./Navbar";

interface LayoutProps {
  children: React.ReactNode;
  isLoading?: boolean;
}

export const Layout: React.FC<LayoutProps> = ({ children, isLoading }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 sm:px-0">{isLoading ? <Loading /> : children}</div>
      </main>
    </div>
  );
};
