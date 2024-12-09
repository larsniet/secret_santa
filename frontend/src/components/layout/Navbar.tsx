import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

export const Navbar: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const [isDesktopMenuOpen, setIsDesktopMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Only handle desktop menu clicks
      if (
        menuRef.current &&
        buttonRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsDesktopMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <nav className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link to="/" className="flex items-center">
              <img
                src="/logo.svg"
                alt="Secret Santa Logo"
                className="h-12 w-12 mr-2"
              />
              <span className="text-xl font-bold text-[#B91C1C]">
                Secret Santa
              </span>
            </Link>
            {isAuthenticated && (
              <div className="hidden sm:ml-6 sm:flex sm:space-x-4">
                <Link
                  to="/dashboard"
                  className={`inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 ${
                    location.pathname === "/dashboard"
                      ? "text-[#B91C1C] border-[#B91C1C]"
                      : "text-gray-500 hover:text-gray-700 border-transparent"
                  }`}
                >
                  Dashboard
                </Link>
              </div>
            )}
          </div>

          {/* Desktop menu button */}
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {isAuthenticated ? (
              <div className="relative ml-3">
                <div>
                  <button
                    ref={buttonRef}
                    onClick={() => setIsDesktopMenuOpen(!isDesktopMenuOpen)}
                    className="flex items-center justify-center h-8 w-8 rounded-full bg-[#B91C1C] hover:bg-[#991818] focus:outline-none transition-colors"
                  >
                    <span className="text-sm font-medium text-white">
                      {user?.name?.charAt(0).toUpperCase()}
                    </span>
                  </button>
                </div>
                {isDesktopMenuOpen && (
                  <div
                    ref={menuRef}
                    className="absolute right-0 mt-2 z-10 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5"
                  >
                    <div className="py-1">
                      <div className="px-4 py-2 text-sm text-gray-900 border-b border-gray-200">
                        Hi, {user?.name}
                      </div>
                      <Link
                        to="/settings"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsDesktopMenuOpen(false)}
                      >
                        Settings
                      </Link>
                      <button
                        onClick={() => {
                          logout();
                          setIsDesktopMenuOpen(false);
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-gray-900 px-3 py-2 text-sm font-medium"
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="bg-[#B91C1C] text-white hover:bg-[#991B1B] px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center sm:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#B91C1C]"
            >
              <span className="sr-only">Open main menu</span>
              {isMobileMenuOpen ? (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`sm:hidden ${isMobileMenuOpen ? "block" : "hidden"}`}>
        {isAuthenticated ? (
          <div className="pt-2 pb-3 space-y-1">
            <button
              onClick={(e) => {
                e.preventDefault();
                setIsMobileMenuOpen(false);
                navigate("/dashboard");
              }}
              className={`block w-full text-left pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                location.pathname === "/dashboard"
                  ? "border-[#B91C1C] text-[#B91C1C] bg-red-50"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                setIsMobileMenuOpen(false);
                navigate("/settings");
              }}
              className="block w-full text-left pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            >
              Settings
            </button>
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                logout();
              }}
              className="block w-full text-left pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            >
              Sign out
            </button>
          </div>
        ) : (
          <div className="pt-2 pb-3 space-y-1">
            <button
              onClick={(e) => {
                e.preventDefault();
                setIsMobileMenuOpen(false);
                navigate("/login");
              }}
              className="block w-full text-left pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            >
              Sign in
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                setIsMobileMenuOpen(false);
                navigate("/register");
              }}
              className="block w-full text-left pl-3 pr-4 py-2 border-l-4 border-[#B91C1C] text-base font-medium text-[#B91C1C] bg-red-50"
            >
              Get Started
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};
