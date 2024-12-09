import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useAlert } from "../contexts/AlertContext";
import { Layout } from "../components/layout/Layout";
import { Button } from "../components/common/Button";
import { authService } from "../services/auth.service";

export const VerifyEmail: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { showAlert } = useAlert();
  const { setupAuth } = useAuth();
  const [isVerifying, setIsVerifying] = useState(true);
  const [isResending, setIsResending] = useState(false);
  const [email, setEmail] = useState("");
  const [verificationStatus, setVerificationStatus] = useState<
    "verifying" | "success" | "error"
  >("verifying");
  const [hasNavigated, setHasNavigated] = useState(false);
  const [hasAttemptedVerification, setHasAttemptedVerification] =
    useState(false);

  const verifyEmail = useCallback(async () => {
    const token = searchParams.get("token");
    if (!token || hasAttemptedVerification) {
      setVerificationStatus("error");
      setIsVerifying(false);
      return;
    }

    setHasAttemptedVerification(true);

    try {
      const response = await authService.verifyEmail(token);

      if (response.access_token && response.user) {
        // First set up authentication
        localStorage.setItem("token", response.access_token);
        localStorage.setItem("user", JSON.stringify(response.user));
        await setupAuth(response.access_token, response.user);

        // Then update UI state and show alert
        setVerificationStatus("success");
        showAlert(
          "success",
          "Email verified successfully! Redirecting to dashboard..."
        );

        // Navigate to dashboard
        setTimeout(() => {
          navigate("/dashboard", { replace: true });
        }, 500);
      }
    } catch (err: any) {
      setVerificationStatus("error");
      showAlert(
        "error",
        err.response?.data?.message || "Failed to verify email"
      );
    } finally {
      setIsVerifying(false);
    }
  }, [searchParams, navigate, showAlert, setupAuth, hasAttemptedVerification]);

  useEffect(() => {
    verifyEmail();
  }, [verifyEmail]);

  const handleResendVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsResending(true);
    try {
      await authService.resendVerification(email);
      showAlert("success", "Verification email has been resent!");
      setEmail("");
    } catch (err: any) {
      showAlert(
        "error",
        err.response?.data?.message || "Failed to resend verification email"
      );
    } finally {
      setIsResending(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow">
          {isVerifying ? (
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Verifying your email...
              </h2>
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#B91C1C] mx-auto"></div>
            </div>
          ) : verificationStatus === "success" ? (
            <div className="text-center">
              <svg
                className="h-16 w-16 text-green-500 mx-auto mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Email Verified!
              </h2>
              <p className="text-gray-600 mb-8">
                You'll be redirected to your dashboard shortly...
              </p>
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
                  disabled={isResending || !email}
                  className="w-full"
                >
                  {isResending ? "Resending..." : "Resend Verification Email"}
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
