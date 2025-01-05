import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { Layout } from "../components/layout/Layout";
import { Button } from "../components/common/Button";
import { useAlert } from "../contexts/AlertContext";
import {
  sessionService,
  Session,
  UpdateSessionDto,
} from "../services/session.service";
import { Loading } from "../components/common/Loading";
import { ConfirmModal } from "../components/common/ConfirmModal";
import { StatusBadge } from "../components/common/StatusBadge";
import {
  formatDate,
  formatDateTime,
  getCurrentTimezone,
  formatForDateTimeInput,
} from "../lib/date-utils";

export const Dashboard: React.FC = () => {
  const { showAlert } = useAlert();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    budget: 0,
    registrationDeadline: "",
    giftExchangeDate: "",
    timezone: getCurrentTimezone(),
  });
  const [sessionToDelete, setSessionToDelete] = useState<Session | null>(null);
  const [sessionToEdit, setSessionToEdit] = useState<Session | null>(null);
  const [editFormData, setEditFormData] = useState<UpdateSessionDto>({
    budget: 0,
    registrationDeadline: "",
    giftExchangeDate: "",
  });

  const loadSessions = useCallback(async () => {
    try {
      setIsLoading(true);
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
  }, [showAlert]);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

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
      const newSession = await sessionService.createSession(formData);
      console.log("Created session in frontend:", newSession);
      showAlert("success", "Session created successfully!");
      setFormData({
        name: "",
        budget: 0,
        registrationDeadline: "",
        giftExchangeDate: "",
        timezone: getCurrentTimezone(),
      });
      setShowCreateForm(false);
      setSessions([newSession, ...sessions]);
    } catch (err: any) {
      console.error("Error creating session:", err);
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
    open: sessions.filter((s) => s.status === "open").length,
    locked: sessions.filter((s) => s.status === "locked").length,
    completed: sessions.filter((s) => s.status === "completed").length,
  };

  const handleEditClick = (session: Session) => {
    setSessionToEdit(session);
    setEditFormData({
      name: session.name,
      budget: session.budget,
      registrationDeadline: formatForDateTimeInput(
        session.registrationDeadline
      ),
      giftExchangeDate: session.giftExchangeDate.split("T")[0],
      timezone: getCurrentTimezone(),
    });
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionToEdit) return;

    try {
      setIsSubmitting(true);
      await sessionService.updateSession(sessionToEdit._id, editFormData);
      showAlert("success", "Session updated successfully");
      setSessionToEdit(null);
      loadSessions();
    } catch (err: any) {
      showAlert(
        "error",
        err.response?.data?.message || "Failed to update session"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({
      ...prev,
      [name]: name === "budget" ? Number(value) : value,
    }));
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
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
          <h1 className="text-3xl font-bold text-gray-900">
            My Secret Santa Sessions
          </h1>
          {!showCreateForm && (
            <Button
              onClick={() => {
                setShowCreateForm(true);
                setTimeout(() => {
                  document
                    .querySelector(".create-form")
                    ?.scrollIntoView({ behavior: "smooth" });
                }, 100);
              }}
            >
              Create New Session
            </Button>
          )}
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                {sessionStats.open}
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-sm font-medium text-blue-500">Locked</div>
            <div className="mt-2 flex items-baseline">
              <div className="text-2xl font-semibold text-gray-900">
                {sessionStats.locked}
              </div>
            </div>
          </div>
        </div>

        {showCreateForm && (
          <div className="bg-white p-6 rounded-lg shadow create-form">
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
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#B91C1C] focus:border-[#B91C1C] sm:text-sm"
                    required
                    maxLength={50}
                    disabled={isSubmitting}
                    autoFocus
                  />
                  <span className="absolute right-3 top-2 text-sm text-gray-400">
                    {formData.name.length}/50
                  </span>
                </div>
              </div>

              <div>
                <label
                  htmlFor="budget"
                  className="block text-sm font-medium text-gray-700"
                >
                  Budget per person (in your currency)
                </label>
                <div className="mt-1">
                  <input
                    type="number"
                    id="budget"
                    min="1"
                    step="0.01"
                    value={formData.budget}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        budget: parseFloat(e.target.value) || 0,
                      })
                    }
                    placeholder="Enter budget amount"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#B91C1C] focus:border-[#B91C1C] sm:text-sm"
                    required
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="registration-deadline"
                  className="block text-sm font-medium text-gray-700"
                >
                  Registration Deadline
                </label>
                <div className="mt-1">
                  <input
                    type="datetime-local"
                    id="registration-deadline"
                    value={formData.registrationDeadline}
                    min={new Date().toISOString().slice(0, 16)}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        registrationDeadline: e.target.value,
                      })
                    }
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#B91C1C] focus:border-[#B91C1C] sm:text-sm"
                    required
                    disabled={isSubmitting}
                  />
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  Last date for participants to join
                </p>
              </div>

              <div>
                <label
                  htmlFor="gift-exchange-date"
                  className="block text-sm font-medium text-gray-700"
                >
                  Gift Exchange Date
                </label>
                <div className="mt-1">
                  <input
                    type="datetime-local"
                    id="gift-exchange-date"
                    value={formData.giftExchangeDate}
                    min={formData.registrationDeadline}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        giftExchangeDate: e.target.value,
                      })
                    }
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#B91C1C] focus:border-[#B91C1C] sm:text-sm"
                    required
                    disabled={isSubmitting}
                  />
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  When the gift exchange will take place
                </p>
              </div>

              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={
                    isSubmitting ||
                    !formData.name.trim() ||
                    formData.budget <= 0 ||
                    !formData.registrationDeadline ||
                    !formData.giftExchangeDate
                  }
                  isLoading={isSubmitting}
                >
                  Create Session
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Sessions List */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {sessions.map((session) => (
              <li key={session._id}>
                <Link
                  to={`/sessions/${session._id}`}
                  className="block hover:bg-gray-50"
                >
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="truncate">
                        <div className="flex items-center space-x-3">
                          <h3 className="text-sm font-medium text-[#B91C1C] truncate">
                            {session.name}
                          </h3>
                          <StatusBadge status={session.status} />
                        </div>
                        <div className="mt-2 flex">
                          <div className="flex items-center text-sm text-gray-500">
                            <svg
                              className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                              />
                            </svg>
                            {session.participants?.length || 0} participants
                          </div>
                          <div className="ml-6 flex items-center text-sm text-gray-500">
                            <svg
                              className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                            Budget: {session.budget}
                          </div>
                          <div className="ml-6 flex items-center text-sm text-gray-500">
                            <svg
                              className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400"
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
                            Exchange: {formatDate(session.giftExchangeDate)}
                          </div>
                        </div>
                      </div>
                      <div className="ml-2 flex-shrink-0 flex">
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            setSessionToDelete(session);
                          }}
                          className="ml-2 flex items-center text-red-600 hover:text-red-900"
                        >
                          <svg
                            className="h-5 w-5"
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
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <ConfirmModal
        isOpen={!!sessionToDelete}
        onClose={() => setSessionToDelete(null)}
        onConfirm={handleDelete}
        title="Delete Session"
        message="Are you sure you want to delete this session? This action cannot be undone."
        confirmText="Delete"
        isSubmitting={isSubmitting}
      />

      {/* Edit Session Modal */}
      {sessionToEdit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-semibold mb-4">Edit Session Details</h2>
            <form onSubmit={handleEditSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={editFormData.name}
                    onChange={handleEditChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Budget
                  </label>
                  <input
                    type="number"
                    name="budget"
                    value={editFormData.budget}
                    onChange={handleEditChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Registration Deadline
                  </label>
                  <input
                    type="datetime-local"
                    name="registrationDeadline"
                    value={editFormData.registrationDeadline}
                    onChange={handleEditChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Gift Exchange Date
                  </label>
                  <input
                    type="date"
                    name="giftExchangeDate"
                    value={editFormData.giftExchangeDate}
                    onChange={handleEditChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    required
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setSessionToEdit(null)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" disabled={isSubmitting}>
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};
