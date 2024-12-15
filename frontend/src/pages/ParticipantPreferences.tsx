import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Layout } from "../components/layout/Layout";
import { BackButton } from "../components/common/BackButton";
import { useAlert } from "../contexts/AlertContext";
import { participantService } from "../services/participant.service";
import { Loading } from "../components/common/Loading";
import { Participant } from "../services/participant.service";
import { Select } from "../components/common/Select";

export const ParticipantPreferences: React.FC = () => {
  const { sessionId, participantId } = useParams<{
    sessionId: string;
    participantId: string;
  }>();
  const { showAlert } = useAlert();
  const [isLoading, setIsLoading] = useState(true);
  const [preferences, setPreferences] = useState<Participant["preferences"]>({
    interests: "",
    sizes: {
      clothing: undefined,
      shoe: undefined,
      ring: undefined,
    },
    wishlist: "",
    restrictions: "",
    ageGroup: undefined,
    gender: undefined,
    favoriteColors: "",
    dislikes: "",
    hobbies: "",
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
      setPreferences(data);
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
      <BackButton />
      <div className="max-w-2xl mx-auto">
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
                value={preferences?.interests}
                onChange={(e) =>
                  setPreferences({
                    ...preferences,
                    interests: e.target.value,
                  })
                }
                placeholder="e.g., Reading, Cooking, Sports"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#B91C1C] focus:border-[#B91C1C] sm:text-sm"
              />
            </div>

            <div>
              <Select
                label="Clothing Size"
                value={preferences?.sizes?.clothing || ""}
                onChange={(e) =>
                  setPreferences({
                    ...preferences,
                    sizes: {
                      ...preferences?.sizes,
                      clothing: e.target
                        .value as Participant["preferences"]["sizes"]["clothing"],
                    },
                  })
                }
                options={[
                  { value: "XS", label: "XS" },
                  { value: "S", label: "S" },
                  { value: "M", label: "M" },
                  { value: "L", label: "L" },
                  { value: "XL", label: "XL" },
                  { value: "XXL", label: "XXL" },
                ]}
              />
            </div>

            <div>
              <Select
                label="Shoe Size"
                value={preferences?.sizes?.shoe || ""}
                onChange={(e) =>
                  setPreferences({
                    ...preferences,
                    sizes: {
                      ...preferences?.sizes,
                      shoe: e.target
                        .value as Participant["preferences"]["sizes"]["shoe"],
                    },
                  })
                }
                options={[
                  { value: "36", label: "36" },
                  { value: "37", label: "37" },
                  { value: "38", label: "38" },
                  { value: "39", label: "39" },
                  { value: "40", label: "40" },
                  { value: "41", label: "41" },
                  { value: "42", label: "42" },
                  { value: "43", label: "43" },
                  { value: "44", label: "44" },
                  { value: "45", label: "45" },
                ]}
              />
            </div>

            <div>
              <Select
                label="Ring Size"
                value={preferences?.sizes?.ring || ""}
                onChange={(e) =>
                  setPreferences({
                    ...preferences,
                    sizes: {
                      ...preferences?.sizes,
                      ring: e.target
                        .value as Participant["preferences"]["sizes"]["ring"],
                    },
                  })
                }
                options={[
                  { value: "5", label: "5" },
                  { value: "6", label: "6" },
                  { value: "7", label: "7" },
                  { value: "8", label: "8" },
                  { value: "9", label: "9" },
                  { value: "10", label: "10" },
                ]}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Wishlist
              </label>
              <textarea
                value={preferences?.wishlist}
                onChange={(e) =>
                  setPreferences({
                    ...preferences,
                    wishlist: e.target.value,
                  })
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
                value={preferences?.restrictions}
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

            <div>
              <Select
                label="Age Group"
                value={preferences?.ageGroup || ""}
                onChange={(e) =>
                  setPreferences({
                    ...preferences,
                    ageGroup: e.target
                      .value as Participant["preferences"]["ageGroup"],
                  })
                }
                options={[
                  { value: "18-25", label: "18-25" },
                  { value: "26-35", label: "26-35" },
                  { value: "36-45", label: "36-45" },
                  { value: "46-55", label: "46-55" },
                  { value: "56+", label: "56+" },
                ]}
              />
            </div>

            <div>
              <Select
                label="Gender"
                value={preferences?.gender || ""}
                onChange={(e) =>
                  setPreferences({
                    ...preferences,
                    gender: e.target
                      .value as Participant["preferences"]["gender"],
                  })
                }
                options={[
                  { value: "Male", label: "Male" },
                  { value: "Female", label: "Female" },
                  { value: "Non-binary", label: "Non-binary" },
                  { value: "Prefer not to say", label: "Prefer not to say" },
                ]}
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
