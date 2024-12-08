import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Layout } from "../components/layout/Layout";
import { sessionService } from "../services/session.service";
import { participantService } from "../services/participant.service";

export const JoinSession: React.FC = () => {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const [session, setSession] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const loadSession = async () => {
      if (!code) return;

      try {
        setIsLoading(true);
        const sessionData = await sessionService.getSessionByInviteCode(code);
        if (sessionData.status !== "active") {
          setError(
            "This Secret Santa session is no longer accepting participants"
          );
          return;
        }
        setSession(sessionData);
      } catch (err: any) {
        setError(err.response?.data?.message || "Invalid invite code");
      } finally {
        setIsLoading(false);
      }
    };

    loadSession();
  }, [code]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) return;

    try {
      setIsSubmitting(true);
      const participant = await participantService.addParticipant(
        session._id,
        formData
      );
      setSuccess(true);
      // Redirect to preferences page
      setTimeout(() => {
        navigate(
          `/sessions/${session._id}/participant/${participant._id}/preferences`
        );
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to join session");
      setIsSubmitting(false);
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

  if (success) {
    return (
      <Layout>
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
            <svg
              className="h-6 w-6 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Successfully Joined!
          </h2>
          <p className="text-gray-600 mb-4">
            You have joined {session.name}. You will receive an email when the
            Secret Santa assignments are made.
          </p>
          <p className="text-sm text-gray-500">
            Redirecting to set your gift preferences...
          </p>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Oops!</h2>
            <p className="text-gray-600">{error}</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-md mx-auto">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Join {session.name}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700"
              >
                Your Name
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-[#B91C1C] focus:border-[#B91C1C] sm:text-sm"
                required
              />
            </div>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Your Email
              </label>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-[#B91C1C] focus:border-[#B91C1C] sm:text-sm"
                required
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#B91C1C] hover:bg-[#991B1B] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#B91C1C] disabled:bg-[#991B1B] disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Joining..." : "Join Secret Santa"}
            </button>
          </form>
        </div>
      </div>
    </Layout>
  );
};
