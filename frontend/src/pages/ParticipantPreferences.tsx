import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Layout } from "../components/layout/Layout";
import { useAlert } from "../contexts/AlertContext";
import { participantService } from "../services/participant.service";
import { Loading } from "../components/common/Loading";

interface Preferences {
  interests: string;
  sizes: string;
  wishlist: string;
  restrictions: string;
}

export const ParticipantPreferences: React.FC = () => {
  const { sessionId, participantId } = useParams<{
    sessionId: string;
    participantId: string;
  }>();
  const { showAlert } = useAlert();
  const [isLoading, setIsLoading] = useState(true);
  const [preferences, setPreferences] = useState<Preferences>({
    interests: "",
    sizes: "",
    wishlist: "",
    restrictions: "",
  });

  useEffect(() => {
    loadPreferences();
  }, [sessionId, participantId]);

  const loadPreferences = async () => {
    if (!sessionId || !participantId) return;

    try {
      const data = await participantService.getPreferences(
        sessionId,
        participantId
      );
      setPreferences({
        interests: data?.interests || "",
        sizes: data?.sizes || "",
        wishlist: data?.wishlist || "",
        restrictions: data?.restrictions || "",
      });
    } catch (err: any) {
      showAlert(
        "error",
        err.response?.data?.message || "Failed to load preferences"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionId || !participantId) return;

    try {
      await participantService.updatePreferences(
        sessionId,
        participantId,
        preferences
      );
      showAlert("success", "Preferences saved successfully!");
      setTimeout(() => {
        window.location.href = `/join/${sessionId}`;
      }, 2000);
    } catch (err: any) {
      showAlert(
        "error",
        err.response?.data?.message || "Failed to update preferences"
      );
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
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Update Your Gift Preferences
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Interests
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
    </Layout>
  );
};
