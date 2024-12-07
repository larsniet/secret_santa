import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Layout } from "../components/layout/Layout";
import { sessionService } from "../services/session.service";
import { participantService } from "../services/participant.service";

export const ParticipantPreferences: React.FC = () => {
  const { sessionId, participantId } = useParams<{
    sessionId: string;
    participantId: string;
  }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [preferences, setPreferences] = useState({
    interests: "",
    sizes: "",
    wishlist: "",
    restrictions: "",
  });

  useEffect(() => {
    const loadSessionAndPreferences = async () => {
      if (!sessionId || !participantId) return;

      try {
        setIsLoading(true);
        await sessionService.getSession(sessionId);

        const participants = await participantService.getParticipants(
          sessionId
        );
        const participant = participants.find((p) => p._id === participantId);

        if (participant?.preferences) {
          setPreferences({
            interests: participant.preferences.interests || "",
            sizes: participant.preferences.sizes || "",
            wishlist: participant.preferences.wishlist || "",
            restrictions: participant.preferences.restrictions || "",
          });
        }
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to load session");
      } finally {
        setIsLoading(false);
      }
    };

    loadSessionAndPreferences();
  }, [sessionId, participantId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionId || !participantId) return;

    try {
      await participantService.updatePreferences(
        sessionId,
        participantId,
        preferences
      );
      setSuccess(true);
      setTimeout(() => {
        navigate(`/session/${sessionId}`);
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update preferences");
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#B91C1C]"></div>
        </div>
      </Layout>
    );
  }

  if (success) {
    return (
      <Layout>
        <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
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
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Preferences Saved!
            </h2>
            <p className="text-gray-600">
              Your gift preferences have been updated successfully.
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
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
      <div className="max-w-md mx-auto mt-10">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Gift Preferences
          </h2>
          <p className="text-gray-600 mb-6">
            Help your Secret Santa choose the perfect gift by sharing your
            preferences. All fields are optional.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Interests & Hobbies
              </label>
              <input
                type="text"
                value={preferences.interests}
                onChange={(e) =>
                  setPreferences({ ...preferences, interests: e.target.value })
                }
                placeholder="e.g., Reading, Cooking, Sports"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#B91C1C] focus:border-[#B91C1C] sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Sizes
              </label>
              <input
                type="text"
                value={preferences.sizes}
                onChange={(e) =>
                  setPreferences({ ...preferences, sizes: e.target.value })
                }
                placeholder="e.g., M for clothes, 9 for shoes"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#B91C1C] focus:border-[#B91C1C] sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Wishlist
              </label>
              <textarea
                value={preferences.wishlist}
                onChange={(e) =>
                  setPreferences({ ...preferences, wishlist: e.target.value })
                }
                placeholder="List any specific items you'd like"
                rows={3}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#B91C1C] focus:border-[#B91C1C] sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Restrictions or Allergies
              </label>
              <input
                type="text"
                value={preferences.restrictions}
                onChange={(e) =>
                  setPreferences({
                    ...preferences,
                    restrictions: e.target.value,
                  })
                }
                placeholder="e.g., No food items, allergies"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#B91C1C] focus:border-[#B91C1C] sm:text-sm"
              />
            </div>

            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#B91C1C] hover:bg-[#991B1B] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#B91C1C]"
            >
              Save Preferences
            </button>
          </form>
        </div>
      </div>
    </Layout>
  );
};
