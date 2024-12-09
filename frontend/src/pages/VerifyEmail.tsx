import React, { useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Layout } from "../components/layout/Layout";
import { Button } from "../components/common/Button";
import { useAlert } from "../contexts/AlertContext";
import { authService } from "../services/auth.service";

export const VerifyEmail: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { showAlert } = useAlert();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState(searchParams.get("email") || "");

  const handleResendVerification = async () => {
    if (!email) {
      showAlert("error", "Please enter your email address");
      return;
    }

    try {
      setIsLoading(true);
      await authService.resendVerification(email);
      showAlert("success", "Verification email has been resent");
    } catch (err: any) {
      showAlert(
        "error",
        err.response?.data?.message || "Failed to resend verification email"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow">
          {isLoading ? (
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Verifying your email...
              </h2>
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#B91C1C] mx-auto"></div>
            </div>
          ) : (
            <div>
              <div className="text-center mb-8">
                <svg
                  className="h-16 w-16 text-red-500 mx-auto mb-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Verification Failed
                </h2>
                <p className="text-gray-600">
                  The verification link may have expired or is invalid.
                </p>
              </div>

              <form onSubmit={handleResendVerification} className="space-y-4">
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Email address
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#B91C1C] focus:border-[#B91C1C] sm:text-sm"
                    placeholder="Enter your email"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isLoading || !email}
                  className="w-full"
                >
                  {isLoading ? "Resending..." : "Resend Verification Email"}
                </Button>

                <div className="text-center mt-4">
                  <Link
                    to="/login"
                    className="text-sm text-[#B91C1C] hover:text-[#991B1B]"
                  >
                    Back to Login
                  </Link>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};
