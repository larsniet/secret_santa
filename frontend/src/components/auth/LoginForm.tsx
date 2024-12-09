import React, { useState, useEffect } from "react";
import {
  useNavigate,
  Link,
  useLocation,
  useSearchParams,
} from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useAlert } from "../../contexts/AlertContext";
import { Button } from "../common/Button";
import { authService } from "../../services/auth.service";

export const LoginForm: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { login, setupAuth } = useAuth();
  const { showAlert } = useAlert();
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) return;

    (async () => {
      try {
        const response = await authService.verifyEmail(token);
        if (response.access_token && response.user) {
          localStorage.setItem("token", response.access_token);
          localStorage.setItem("user", JSON.stringify(response.user));
          await setupAuth(response.access_token, response.user);
          navigate("/dashboard", { replace: true });
          setTimeout(() => {
            showAlert("success", "Email verified successfully!");
          }, 100);
        }
      } catch (err: any) {
        showAlert(
          "error",
          err.response?.data?.message || "Failed to verify email"
        );
      }
    })();
  }, [searchParams, navigate, showAlert, setupAuth]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login(formData.email, formData.password);
      navigate("/dashboard");
    } catch (err: any) {
      if (
        err.response?.status === 401 &&
        err.response?.data?.message?.includes("verify your email")
      ) {
        showAlert(
          "error",
          "Please verify your email before logging in. Check your inbox for the verification link."
        );
      } else {
        showAlert("error", err.response?.data?.message || "Failed to login");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <Link to="/" className="block text-center mb-8">
          <div className="inline-flex items-center justify-center">
            <span className="mr-2 text-2xl font-bold text-[#B91C1C]">
              Secret
            </span>
            <img
              src="/logo.svg"
              alt="Secret Santa Logo"
              className="w-12 h-12"
            />
            <span className="ml-2 text-2xl font-bold text-[#B91C1C]">
              Santa
            </span>
          </div>
        </Link>

        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-8">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">
              Sign in to your account
            </h2>
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#B91C1C] focus:border-[#B91C1C] sm:text-sm"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700"
                >
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#B91C1C] focus:border-[#B91C1C] sm:text-sm"
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center"
              >
                {isLoading ? "Signing in..." : "Sign in"}
              </Button>
            </form>
          </div>

          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-lg">
            <p className="text-sm text-center text-gray-600">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="font-medium text-[#B91C1C] hover:text-[#991B1B]"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
