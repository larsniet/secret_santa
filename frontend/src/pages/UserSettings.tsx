import React, { useState, useEffect } from "react";
import { Layout } from "../components/layout/Layout";
import { Button } from "../components/common/Button";
import { userService } from "../services/user.service";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY || "");

export const UserSettings: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [subscription, setSubscription] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    const loadUserData = async () => {
      try {
        setIsLoading(true);
        const userData = await userService.getCurrentUser();
        const subscriptionData = await userService.getCurrentSubscription();
        setUser(userData);
        setSubscription(subscriptionData);
        setFormData((prevData) => ({
          ...prevData,
          name: userData.name,
          email: userData.email,
        }));
      } catch (err: any) {
        if (err.response?.status === 401) {
          window.location.href = "/login";
          return;
        }
        setError(err.response?.data?.message || "Failed to load user data");
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, []);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await userService.updateProfile({
        name: formData.name,
        email: formData.email,
      });
      setSuccess("Profile updated successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update profile");
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      setError("New passwords don't match");
      return;
    }
    try {
      await userService.updatePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });
      setSuccess("Password updated successfully!");
      setFormData({
        ...formData,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update password");
    }
  };

  const handleSubscribe = async (planName: string) => {
    try {
      const stripe = await stripePromise;
      if (!stripe) throw new Error("Stripe failed to load");

      const session = await userService.createCheckoutSession(planName);
      await stripe.redirectToCheckout({
        sessionId: session.id,
      });
    } catch (err: any) {
      setError(err.message || "Failed to initiate checkout");
    }
  };

  const handleCancelSubscription = async () => {
    if (!window.confirm("Are you sure you want to cancel your subscription?")) {
      return;
    }
    try {
      await userService.cancelSubscription();
      setSuccess("Subscription cancelled successfully!");
      const subscriptionData = await userService.getCurrentSubscription();
      setSubscription(subscriptionData);
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to cancel subscription");
    }
  };

  const handleDeleteAccount = async () => {
    if (
      !window.confirm(
        "Are you sure you want to delete your account? This action cannot be undone and will delete all your data."
      )
    ) {
      return;
    }

    try {
      await userService.deleteAccount();
      // Clear local storage and redirect to home
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/";
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to delete account");
    }
  };

  if (isLoading) {
    return (
      <Layout isLoading>
        <div
          className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#B91C1C]"
          role="status"
        >
          <span className="sr-only">Loading...</span>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8">
        <h1 className="text-3xl font-bold text-gray-900">Account Settings</h1>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {success && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-md">
            <p className="text-green-600">{success}</p>
          </div>
        )}

        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Profile Settings
            </h2>
          </div>
          <form onSubmit={handleProfileUpdate} className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#B91C1C] focus:border-[#B91C1C] sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#B91C1C] focus:border-[#B91C1C] sm:text-sm"
              />
            </div>
            <Button type="submit">Update Profile</Button>
          </form>
        </div>

        <div className="bg-white shadow rounded-lg mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Change Password
            </h2>
          </div>
          <form onSubmit={handlePasswordUpdate} className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Current Password
              </label>
              <input
                type="password"
                value={formData.currentPassword}
                onChange={(e) =>
                  setFormData({ ...formData, currentPassword: e.target.value })
                }
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#B91C1C] focus:border-[#B91C1C] sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                New Password
              </label>
              <input
                type="password"
                value={formData.newPassword}
                onChange={(e) =>
                  setFormData({ ...formData, newPassword: e.target.value })
                }
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#B91C1C] focus:border-[#B91C1C] sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Confirm New Password
              </label>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) =>
                  setFormData({ ...formData, confirmPassword: e.target.value })
                }
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#B91C1C] focus:border-[#B91C1C] sm:text-sm"
              />
            </div>
            <Button type="submit">Update Password</Button>
          </form>
        </div>

        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Subscription
            </h2>
          </div>
          <div className="p-6">
            {subscription ? (
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    Current Plan: {subscription.planName}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Status: {subscription.status}
                  </p>
                  {subscription.currentPeriodEnd && (
                    <p className="mt-1 text-sm text-gray-500">
                      Next billing date:{" "}
                      {new Date(
                        subscription.currentPeriodEnd
                      ).toLocaleDateString()}
                    </p>
                  )}
                </div>
                {subscription.status === "active" && (
                  <Button variant="danger" onClick={handleCancelSubscription}>
                    Cancel Subscription
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  {
                    name: "Free",
                    price: "€0",
                    features: [
                      "Up to 15 participants",
                      "Basic matching algorithm",
                      "Email notifications",
                      "Gift preferences & wishlists",
                      "1 active event",
                    ],
                  },
                  {
                    name: "Group",
                    price: "€4",
                    features: [
                      "Up to 50 participants",
                      "Smart matching algorithm",
                      "Custom event themes",
                      "Gift preferences & wishlists",
                      "Budget setting",
                      "3 active events",
                    ],
                    popular: true,
                  },
                  {
                    name: "Business",
                    price: "€10",
                    features: [
                      "Unlimited participants",
                      "Advanced matching algorithm",
                      "Custom branding",
                      "Gift preferences & wishlists",
                      "Budget management",
                      "10 active events",
                      "Priority support",
                    ],
                  },
                ].map((plan) => (
                  <div
                    key={plan.name}
                    className={`relative bg-white p-6 rounded-lg shadow-sm border ${
                      plan.popular
                        ? "border-[#B91C1C] ring-2 ring-[#B91C1C]"
                        : "border-gray-200"
                    }`}
                  >
                    {plan.popular && (
                      <div className="absolute top-0 right-0 -translate-y-1/2 px-3 py-1 bg-[#B91C1C] text-white text-sm font-medium rounded-full">
                        Popular
                      </div>
                    )}
                    <h3 className="text-lg font-semibold text-gray-900">
                      {plan.name}
                    </h3>
                    <p className="mt-2 text-2xl font-bold text-gray-900">
                      {plan.price}
                      <span className="text-base font-medium text-gray-500">
                        {plan.name !== "Free" ? "/event" : ""}
                      </span>
                    </p>
                    <ul className="mt-4 space-y-2">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-center">
                          <svg
                            className="h-5 w-5 text-[#B91C1C]"
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
                          <span className="ml-2 text-sm text-gray-500">
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>
                    {plan.name !== "Free" && (
                      <Button
                        className="mt-6 w-full"
                        onClick={() => handleSubscribe(plan.name)}
                      >
                        Subscribe
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Delete Account
            </h2>
          </div>
          <div className="p-6">
            <p className="text-gray-600 mb-4">
              Once you delete your account, there is no going back. Please be
              certain.
            </p>
            <Button
              variant="danger"
              onClick={handleDeleteAccount}
              className="w-full sm:w-auto"
            >
              Delete Account
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};
