import React, { useEffect, useState } from "react";
import { Layout } from "../components/layout/Layout";
import { Button } from "../components/common/Button";
import { sessionService, Session } from "../services/session.service";

export const Dashboard: React.FC = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [newSessionName, setNewSessionName] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      const data = await sessionService.getUserSessions();
      setSessions(data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load sessions");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSessionName.trim()) return;

    try {
      setIsSubmitting(true);
      setError("");
      const session = await sessionService.createSession(newSessionName);
      setSessions([...sessions, session]);
      setNewSessionName("");
      setSuccessMessage("Session created successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create session");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    if (!window.confirm("Are you sure you want to delete this session?"))
      return;

    try {
      setIsDeleting(sessionId);
      await sessionService.deleteSession(sessionId);
      setSessions(sessions.filter((s) => s._id !== sessionId));
      setSuccessMessage("Session deleted successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } finally {
      setIsDeleting(null);
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Create New Session
          </h2>

          {(error || successMessage) && (
            <div
              className={`mb-4 rounded-md ${
                error ? "bg-red-50" : "bg-green-50"
              } p-4`}
            >
              <div
                className={`text-sm ${
                  error ? "text-red-700" : "text-green-700"
                }`}
              >
                {error || successMessage}
              </div>
            </div>
          )}

          <form onSubmit={handleCreateSession}>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label htmlFor="session-name" className="sr-only">
                  Session Name
                </label>
                <input
                  type="text"
                  id="session-name"
                  value={newSessionName}
                  onChange={(e) => setNewSessionName(e.target.value)}
                  placeholder="Enter session name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#B91C1C] focus:border-[#B91C1C] sm:text-sm"
                  disabled={isSubmitting}
                />
              </div>
              <Button type="submit" isLoading={isSubmitting}>
                Create Session
              </Button>
            </div>
          </form>
        </div>

        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">My Sessions</h2>
          </div>

          <div className="divide-y divide-gray-200">
            {sessions.length === 0 ? (
              <p className="px-6 py-4 text-gray-500 text-center">
                No sessions yet. Create one to get started!
              </p>
            ) : (
              sessions.map((session) => (
                <div
                  key={session._id}
                  className="px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                >
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      {session.name}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Created on{" "}
                      {new Date(session.createdAt).toLocaleDateString()}
                    </p>
                    <span
                      className={`mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        session.status === "active"
                          ? "bg-green-100 text-green-800"
                          : session.status === "completed"
                          ? "bg-[#FEE2E2] text-[#B91C1C]"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {session.status}
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button variant="secondary" to={`/sessions/${session._id}`}>
                      View Details
                    </Button>
                    {session.status === "active" && (
                      <Button
                        variant="danger"
                        onClick={() => handleDeleteSession(session._id)}
                        isLoading={isDeleting === session._id}
                      >
                        {isDeleting === session._id ? "Deleting..." : "Delete"}
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};
