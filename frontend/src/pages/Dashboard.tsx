import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Layout } from "../components/layout/Layout";
import { Button } from "../components/common/Button";
import { useAlert } from "../contexts/AlertContext";
import { sessionService, Session } from "../services/session.service";
import { loadStripe } from "@stripe/stripe-js";
import { EventPlan, PLAN_LIMITS } from "../types/plans";
import { Loading } from "../components/common/Loading";

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY || "");

export const Dashboard: React.FC = () => {
  const { showAlert } = useAlert();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    plan: EventPlan.FREE,
  });

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      const data = await sessionService.getMySessions();
      setSessions(data);
    } catch (err: any) {
      showAlert(
        "error",
        err.response?.data?.message || "Failed to load sessions"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (sessionId: string, e: React.MouseEvent) => {
    e.preventDefault();
    try {
      await sessionService.deleteSession(sessionId);
      showAlert("success", "Session deleted successfully");
      loadSessions();
    } catch (err: any) {
      showAlert(
        "error",
        err.response?.data?.message || "Failed to delete session"
      );
    }
  };

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Check if trying to create a free session
      if (formData.plan === EventPlan.FREE) {
        // Check for existing active free sessions
        const existingFreeSessions = sessions.filter(
          (s) => s.plan === EventPlan.FREE && s.status === "active"
        );
        if (existingFreeSessions.length > 0) {
          showAlert(
            "error",
            "You can only have one active free session. Please upgrade to a paid plan or complete/delete your existing free session."
          );
          setIsSubmitting(false);
          return;
        }
      }

      const session = await sessionService.createSession(formData);

      // If it's a paid plan, redirect to payment
      if (formData.plan !== EventPlan.FREE) {
        const stripe = await stripePromise;
        if (!stripe) throw new Error("Failed to load payment system");

        const checkoutSession = await sessionService.createCheckoutSession(
          session._id
        );
        await stripe.redirectToCheckout({
          sessionId: checkoutSession.id,
        });
        return;
      }

      showAlert("success", "Session created successfully!");
      setFormData({ name: "", plan: EventPlan.FREE });
      setShowCreateForm(false);
      loadSessions();
    } catch (err: any) {
      showAlert(
        "error",
        err.response?.data?.message || "Failed to create session"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Layout isLoading>
        <Loading />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">
            My Secret Santa Sessions
          </h1>
          {!showCreateForm && (
            <Button onClick={() => setShowCreateForm(true)}>
              Create New Session
            </Button>
          )}
        </div>

        {showCreateForm && (
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Create New Session
              </h2>
              <button
                onClick={() => setShowCreateForm(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <span className="sr-only">Close</span>
                <svg
                  className="h-6 w-6"
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
              </button>
            </div>

            <form onSubmit={handleCreateSession} className="space-y-6">
              <div>
                <label
                  htmlFor="session-name"
                  className="block text-sm font-medium text-gray-700"
                >
                  Session Name
                </label>
                <input
                  type="text"
                  id="session-name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Enter session name"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#B91C1C] focus:border-[#B91C1C] sm:text-sm"
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  Select Plan
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {Object.entries(PLAN_LIMITS).map(([plan, details]) => {
                    const hasActiveFreeSession =
                      plan === EventPlan.FREE &&
                      sessions.some(
                        (s) =>
                          s.plan === EventPlan.FREE && s.status === "active"
                      );

                    return (
                      <div
                        key={plan}
                        className={`relative rounded-lg border p-4 ${
                          hasActiveFreeSession
                            ? "opacity-50 cursor-not-allowed"
                            : "cursor-pointer " +
                              (formData.plan === plan
                                ? "border-[#B91C1C] ring-2 ring-[#B91C1C]"
                                : "border-gray-200 hover:border-[#B91C1C]")
                        }`}
                        onClick={() => {
                          if (!hasActiveFreeSession) {
                            setFormData({
                              ...formData,
                              plan: plan as EventPlan,
                            });
                          }
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-sm font-medium text-gray-900">
                              {plan}
                            </h3>
                            <p className="mt-1 text-sm text-gray-500">
                              {details.price === 0
                                ? "Free"
                                : `€${details.price}`}
                            </p>
                            {hasActiveFreeSession && (
                              <p className="mt-1 text-xs text-red-600">
                                You already have an active free session
                              </p>
                            )}
                          </div>
                          <div
                            className={`h-5 w-5 rounded-full border ${
                              formData.plan === plan && !hasActiveFreeSession
                                ? "border-[#B91C1C] bg-[#B91C1C]"
                                : "border-gray-300 bg-white"
                            } flex items-center justify-center`}
                          >
                            {formData.plan === plan &&
                              !hasActiveFreeSession && (
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
                        <ul className="mt-2 space-y-1">
                          {details.features.map(
                            (feature: string, index: number) => (
                              <li key={index} className="flex items-start">
                                <svg
                                  className="h-4 w-4 text-[#B91C1C] mt-0.5 mr-2"
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
                                <span className="text-xs text-gray-500">
                                  {feature}
                                </span>
                              </li>
                            )
                          )}
                        </ul>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowCreateForm(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" isLoading={isSubmitting}>
                  {formData.plan === EventPlan.FREE
                    ? "Create Session"
                    : "Continue to Payment"}
                </Button>
              </div>
            </form>
          </div>
        )}

        {sessions.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No sessions yet
            </h3>
            <p className="text-gray-500">
              Create your first Secret Santa session to get started!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {sessions.map((session) => {
              const participantSize =
                session.participants?.length >= 10
                  ? "lg"
                  : session.participants?.length >= 5
                  ? "md"
                  : "sm";

              const cardSizeClass = {
                lg: "min-h-[200px]",
                md: "min-h-[160px]",
                sm: "min-h-[140px]",
              }[participantSize];

              const planStyles = {
                BUSINESS:
                  "bg-gradient-to-br from-purple-50 to-white border-purple-200 hover:border-purple-300",
                GROUP:
                  "bg-gradient-to-br from-blue-50 to-white border-blue-200 hover:border-blue-300",
                FREE: "bg-white border-gray-200 hover:border-gray-300",
              }[session.plan as EventPlan];

              const planBadgeStyles = {
                BUSINESS: "bg-purple-100 text-purple-800",
                GROUP: "bg-blue-100 text-blue-800",
                FREE: "bg-gray-100 text-gray-600",
              }[session.plan as EventPlan];

              return (
                <Link
                  key={session._id}
                  to={`/sessions/${session._id}`}
                  className={`block transition-all duration-200 ${cardSizeClass}`}
                >
                  <div
                    className={`h-full p-6 rounded-lg border ${planStyles} hover:shadow-md`}
                  >
                    <div className="flex flex-col h-full">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="text-lg font-medium text-gray-900 mb-1">
                            {session.name}
                          </h3>
                          <span
                            className={`inline-block px-2 py-1 rounded-md text-xs font-medium ${planBadgeStyles}`}
                          >
                            {session.plan}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              session.status === "active"
                                ? "bg-green-100 text-green-800"
                                : session.status === "completed"
                                ? "bg-blue-100 text-blue-800"
                                : session.status === "pending_payment"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {session.status.charAt(0).toUpperCase() +
                              session.status.slice(1)}
                          </span>
                          <button
                            onClick={(e) => handleDelete(session._id, e)}
                            className="p-1 rounded-full hover:bg-red-100 text-red-600 transition-colors"
                            title="Delete session"
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>

                      <div className="mt-auto flex justify-between items-end text-sm text-gray-500">
                        <span>
                          {session.participants?.length || 0} participants
                        </span>
                        <span>
                          Created{" "}
                          {new Date(session.createdAt).toLocaleDateString(
                            "en-GB",
                            {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                            }
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
};
