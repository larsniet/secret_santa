import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Layout } from "../components/layout/Layout";
import { Button } from "../components/common/Button";
import { useAlert } from "../contexts/AlertContext";
import { sessionService, Session } from "../services/session.service";
import { stripePromise } from "../lib/stripe";
import { EventPlan, PLAN_LIMITS } from "../types/plans";
import { Loading } from "../components/common/Loading";
import { ConfirmModal } from "../components/common/ConfirmModal";
import { StatusBadge } from "../components/common/StatusBadge";

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
  const [sessionToDelete, setSessionToDelete] = useState<Session | null>(null);

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

  const handleDelete = async () => {
    if (!sessionToDelete) return;

    try {
      setIsSubmitting(true);
      await sessionService.deleteSession(sessionToDelete._id);
      showAlert("success", "Session deleted successfully");
      loadSessions();
    } catch (err: any) {
      showAlert(
        "error",
        err.response?.data?.message || "Failed to delete session"
      );
    } finally {
      setIsSubmitting(false);
      setSessionToDelete(null);
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

  const sessionStats = {
    total: sessions.length,
    active: sessions.filter((s) => s.status === "active").length,
    pending: sessions.filter((s) => s.status === "pending_payment").length,
    completed: sessions.filter((s) => s.status === "completed").length,
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

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-sm font-medium text-gray-500">
              Total Sessions
            </div>
            <div className="mt-2 flex items-baseline">
              <div className="text-2xl font-semibold text-gray-900">
                {sessionStats.total}
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-sm font-medium text-green-500">Active</div>
            <div className="mt-2 flex items-baseline">
              <div className="text-2xl font-semibold text-gray-900">
                {sessionStats.active}
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-sm font-medium text-yellow-500">
              Pending Payment
            </div>
            <div className="mt-2 flex items-baseline">
              <div className="text-2xl font-semibold text-gray-900">
                {sessionStats.pending}
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-sm font-medium text-blue-500">Completed</div>
            <div className="mt-2 flex items-baseline">
              <div className="text-2xl font-semibold text-gray-900">
                {sessionStats.completed}
              </div>
            </div>
          </div>
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
                <div className="relative mt-1">
                  <input
                    type="text"
                    id="session-name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        name: e.target.value.slice(0, 50),
                      })
                    }
                    placeholder="Enter session name"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#B91C1C] focus:border-[#B91C1C] sm:text-sm pr-16"
                    required
                    maxLength={50}
                    disabled={isSubmitting}
                  />
                  <span className="absolute right-3 top-2 text-sm text-gray-400">
                    {formData.name.length}/50
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  Select Plan
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
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
                        className={`relative rounded-lg border p-6 cursor-pointer ${
                          plan === formData.plan
                            ? "border-[#B91C1C] ring-2 ring-[#B91C1C]"
                            : "border-gray-200 hover:border-[#B91C1C]"
                        } ${
                          {
                            BUSINESS: "col-span-2 md:col-span-1",
                            GROUP: "col-span-2 md:col-span-1",
                            FREE: "col-span-2 md:col-span-1",
                          }[plan as EventPlan]
                        }`}
                        onClick={() =>
                          setFormData({ ...formData, plan: plan as EventPlan })
                        }
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
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
              />
            </svg>
            <h3 className="mt-2 text-lg font-medium text-gray-900">
              No sessions yet
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Create your first Secret Santa session to get started!
            </p>
            <div className="mt-6">
              <Button onClick={() => setShowCreateForm(true)}>
                Create New Session
              </Button>
            </div>
          </div>
        ) : (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">
                Recent Sessions
              </h2>
            </div>
            <div className="divide-y divide-gray-200">
              {sessions.map((session) => {
                const planStyles = {
                  BUSINESS:
                    "bg-gradient-to-br from-purple-50 to-white border-purple-200 hover:border-purple-300",
                  GROUP:
                    "bg-gradient-to-br from-blue-50 to-white border-blue-200 hover:border-blue-300",
                  FREE: "bg-white border-gray-200 hover:border-gray-300",
                }[session.plan as EventPlan];

                return (
                  <Link
                    key={session._id}
                    to={`/sessions/${session._id}`}
                    className="block transition-all duration-200"
                  >
                    <div
                      className={`p-6 ${planStyles} hover:shadow-md transition-all duration-200`}
                    >
                      <div className="flex flex-col h-full">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-lg font-medium text-gray-900 mb-1">
                              {session.name}
                            </h3>
                            <div className="flex items-center gap-2 mb-3">
                              <StatusBadge
                                type="status"
                                value={session.status}
                              />
                              <StatusBadge type="plan" value={session.plan} />
                            </div>
                          </div>
                          <Button
                            variant="danger"
                            onClick={(e) => {
                              e.preventDefault();
                              setSessionToDelete(session);
                            }}
                            isLoading={isSubmitting}
                          >
                            Delete
                          </Button>
                        </div>

                        <div className="flex flex-col gap-2 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <svg
                              className="w-5 h-5 text-gray-400"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                              />
                            </svg>
                            <span>
                              {session.participants?.length || 0} participants
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <svg
                              className="w-5 h-5 text-gray-400"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                              />
                            </svg>
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
                          {session.status === "pending_payment" && (
                            <div className="flex items-center gap-2 text-yellow-600">
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
                                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                              </svg>
                              <span>Payment required to activate</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        <ConfirmModal
          isOpen={!!sessionToDelete}
          onClose={() => setSessionToDelete(null)}
          onConfirm={handleDelete}
          title="Delete Session"
          message={`Are you sure you want to delete the session "${sessionToDelete?.name}"? This action cannot be undone.`}
          confirmText="Delete Session"
        />
      </div>
    </Layout>
  );
};
