import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useAlert } from "../../contexts/AlertContext";
import { Button } from "../common/Button";

const PLANS = [
  {
    name: "FREE",
    price: "$0/month",
    features: [
      "Create 1 Secret Santa session",
      "Basic email notifications",
      "Up to 5 participants",
    ],
  },
  {
    name: "GROUP",
    price: "$4.99/month",
    features: [
      "Create 5 Secret Santa sessions",
      "Custom email templates",
      "Up to 25 participants",
      "Gift preferences",
    ],
  },
  {
    name: "BUSINESS",
    price: "$9.99/month",
    features: [
      "Unlimited Secret Santa sessions",
      "Priority support",
      "Unlimited participants",
      "Advanced features",
    ],
  },
];

export const RegisterForm: React.FC = () => {
  const { register } = useAuth();
  const { showAlert } = useAlert();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    plan: "FREE",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await register(
        formData.name,
        formData.email,
        formData.password,
        formData.plan
      );
      navigate("/dashboard");
    } catch (err: any) {
      if (
        err.response?.status === 401 &&
        err.response?.data?.message?.includes("already registered")
      ) {
        showAlert(
          "error",
          "This email is already registered. Please sign in instead."
        );
      } else {
        showAlert("error", err.response?.data?.message || "Failed to register");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-8">
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
          <h1 className="text-3xl font-bold text-gray-900">Create Account</h1>
          <p className="mt-2 text-sm text-gray-600">
            Join Secret Santa and start organizing gift exchanges
          </p>
        </div>

        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-8">
            <form className="space-y-8" onSubmit={handleSubmit}>
              <div className="space-y-6">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Full name
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#B91C1C] focus:border-[#B91C1C] sm:text-sm"
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label
                    htmlFor="email-address"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Email address
                  </label>
                  <input
                    id="email-address"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#B91C1C] focus:border-[#B91C1C] sm:text-sm"
                    placeholder="Enter your email"
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
                    autoComplete="new-password"
                    required
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#B91C1C] focus:border-[#B91C1C] sm:text-sm"
                    placeholder="Create a password"
                  />
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Choose your plan
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {PLANS.map((plan) => (
                    <div
                      key={plan.name}
                      className={`relative rounded-lg border ${
                        formData.plan === plan.name
                          ? "border-[#B91C1C] ring-2 ring-[#B91C1C]"
                          : "border-gray-300"
                      } bg-white p-6 shadow-sm hover:border-[#B91C1C] focus:outline-none cursor-pointer`}
                      onClick={() =>
                        setFormData({ ...formData, plan: plan.name })
                      }
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-medium text-gray-900">
                            {plan.name}
                          </h3>
                          <p className="mt-1 text-sm text-gray-500">
                            {plan.price}
                          </p>
                        </div>
                        <div
                          className={`h-5 w-5 rounded-full border ${
                            formData.plan === plan.name
                              ? "border-[#B91C1C] bg-[#B91C1C]"
                              : "border-gray-300 bg-white"
                          } flex items-center justify-center`}
                        >
                          {formData.plan === plan.name && (
                            <svg
                              className="h-3 w-3 text-white"
                              fill="currentColor"
                              viewBox="0 0 12 12"
                            >
                              <path d="M3.707 5.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4a1 1 0 00-1.414-1.414L5 6.586 3.707 5.293z" />
                            </svg>
                          )}
                        </div>
                      </div>
                      <ul className="mt-4 space-y-2">
                        {plan.features.map((feature) => (
                          <li key={feature} className="flex items-start">
                            <svg
                              className="h-5 w-5 text-green-500 mr-2"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                            <span className="text-sm text-gray-500">
                              {feature}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>

              <Button type="submit" fullWidth isLoading={isLoading}>
                Create Account
              </Button>
            </form>
          </div>

          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-lg">
            <p className="text-sm text-center text-gray-600">
              Already have an account?{" "}
              <Button variant="link" to="/login">
                Sign in instead
              </Button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
