import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Layout } from "../components/layout/Layout";
import { BackButton } from "../components/common/BackButton";
import { useAlert } from "../contexts/AlertContext";
import { participantService } from "../services/participant.service";
import { Loading } from "../components/common/Loading";
import { Participant } from "../services/participant.service";
import { Select } from "../components/common/Select";
import { Button } from "../components/common/Button";

export const ParticipantPreferences: React.FC = () => {
  const { sessionId, participantId } = useParams<{
    sessionId: string;
    participantId: string;
  }>();
  const { showAlert } = useAlert();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
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
      setIsSubmitting(true);
      await participantService.updatePreferences(
        sessionId,
        participantId,
        preferences
      );
      showAlert("success", "Preferences saved successfully!");
    } catch (err: any) {
      showAlert(
        "error",
        err.response?.data?.message || "Failed to update preferences"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <Loading />
      </Layout>
    );
  }

  return (
    <Layout>
      <BackButton
        navigateTo={`/sessions/${sessionId}/participants/${participantId}`}
      />
      <div className="space-y-6">
        <header className="bg-white shadow p-6 rounded-lg">
          <h1 className="text-2xl font-bold text-gray-900">
            Update Gift Preferences
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Customize your preferences to help your Secret Santa find the
            perfect gift.
          </p>
        </header>
        <div className="bg-white p-6 rounded-lg shadow">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Interests */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Interests
              </label>
              <input
                type="text"
                value={preferences.interests}
                onChange={(e) =>
                  setPreferences({
                    ...preferences,
                    interests: e.target.value,
                  })
                }
                placeholder="e.g., Reading, Cooking, Sports"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#B91C1C] focus:border-[#B91C1C] sm:text-sm"
              />
            </div>

            {/* Sizes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Clothing Size"
                value={preferences.sizes?.clothing || ""}
                onChange={(e) =>
                  setPreferences({
                    ...preferences,
                    sizes: {
                      ...preferences.sizes,
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
              <Select
                label="Shoe Size"
                value={preferences.sizes?.shoe || ""}
                onChange={(e) =>
                  setPreferences({
                    ...preferences,
                    sizes: {
                      ...preferences.sizes,
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
              <Select
                label="Ring Size"
                value={preferences.sizes?.ring || ""}
                onChange={(e) =>
                  setPreferences({
                    ...preferences,
                    sizes: {
                      ...preferences.sizes,
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

            {/* Favorite Colors */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Favorite Colors
              </label>
              <input
                type="text"
                value={preferences.favoriteColors}
                onChange={(e) =>
                  setPreferences({
                    ...preferences,
                    favoriteColors: e.target.value,
                  })
                }
                placeholder="e.g., Red, Blue, Green"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#B91C1C] focus:border-[#B91C1C] sm:text-sm"
              />
            </div>

            {/* Dislikes */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Dislikes
              </label>
              <input
                type="text"
                value={preferences.dislikes}
                onChange={(e) =>
                  setPreferences({
                    ...preferences,
                    dislikes: e.target.value,
                  })
                }
                placeholder="e.g., Socks, Candles"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#B91C1C] focus:border-[#B91C1C] sm:text-sm"
              />
            </div>

            {/* Gender */}
            <Select
              label="Gender"
              value={preferences.gender || ""}
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

            {/* Hobbies */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Hobbies
              </label>
              <textarea
                value={preferences.hobbies}
                onChange={(e) =>
                  setPreferences({
                    ...preferences,
                    hobbies: e.target.value,
                  })
                }
                placeholder="e.g., Gardening, Cycling"
                rows={3}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#B91C1C] focus:border-[#B91C1C] sm:text-sm"
              />
            </div>

            <Button type="submit" isLoading={isSubmitting} className="w-full">
              Save Preferences
            </Button>
          </form>
        </div>
      </div>
    </Layout>
  );
};
