import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Layout } from "../components/layout/Layout";
import { BackButton } from "../components/common/BackButton";
import { useAlert } from "../contexts/AlertContext";
import { participantService } from "../services/participant.service";
import { Loading } from "../components/common/Loading";
import { Participant } from "../services/participant.service";
import { Select } from "../components/common/Select";
import { Button } from "../components/common/Button";
import { sessionService } from "../services/session.service";
import { Session } from "../services/session.service";

export const ParticipantPreferences: React.FC = () => {
  const { sessionId, participantId } = useParams<{
    sessionId: string;
    participantId: string;
  }>();
  const navigate = useNavigate();
  const { showAlert } = useAlert();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [participant, setParticipant] = useState<Participant | null>(null);
  const [preferences, setPreferences] = useState<
    Required<NonNullable<Participant["preferences"]>>
  >({
    interests: "",
    sizes: {
      clothing: "",
      shoe: "",
      ring: "",
    },
    wishlist: "",
    restrictions: "",
    ageGroup: "",
    gender: "",
  });

  useEffect(() => {
    loadPreferences();
  }, [sessionId, participantId]);

  useEffect(() => {
    if (!session) return;

    // Only redirect if session is not active or locked
    if (session.status !== "open" && session.status !== "locked") {
      navigate("/dashboard");
      return;
    }
  }, [session, navigate]);

  const loadPreferences = async () => {
    if (!sessionId || !participantId) return;

    try {
      setIsLoading(true);
      const sessionData = await sessionService.getSession(sessionId);
      setSession(sessionData);
      const participantData = await participantService.getParticipant(
        sessionId,
        participantId
      );
      setParticipant(participantData);
      if (participantData.preferences) {
        // Ensure all fields have at least empty string values
        setPreferences({
          interests: participantData.preferences.interests || "",
          sizes: {
            clothing: participantData.preferences.sizes?.clothing || "",
            shoe: participantData.preferences.sizes?.shoe || "",
            ring: participantData.preferences.sizes?.ring || "",
          },
          wishlist: participantData.preferences.wishlist || "",
          restrictions: participantData.preferences.restrictions || "",
          ageGroup: participantData.preferences.ageGroup || "",
          gender: participantData.preferences.gender || "",
        });
      }
    } catch (err: any) {
      showAlert(
        "error",
        err.response?.data?.message || "Failed to load preferences"
      );
      navigate("/dashboard");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session || !participant) return;

    // Only allow updates if session is open or locked
    if (session.status !== "open" && session.status !== "locked") {
      showAlert("error", "Cannot update preferences for this session");
      return;
    }

    try {
      setIsSubmitting(true);
      await participantService.updatePreferences(
        session._id,
        participant._id,
        preferences
      );
      showAlert("success", "Preferences updated successfully!");
      navigate(`/sessions/${session._id}/participants/${participant._id}`);
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
                  setPreferences((prev) => ({
                    ...prev,
                    interests: e.target.value,
                  }))
                }
                placeholder="e.g., Reading, Cooking, Sports"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#B91C1C] focus:border-[#B91C1C] sm:text-sm"
              />
            </div>

            {/* Sizes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Clothing Size"
                value={preferences.sizes.clothing}
                onChange={(e) =>
                  setPreferences((prev) => ({
                    ...prev,
                    sizes: {
                      ...prev.sizes,
                      clothing: e.target.value,
                    },
                  }))
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
                value={preferences.sizes.shoe}
                onChange={(e) =>
                  setPreferences((prev) => ({
                    ...prev,
                    sizes: {
                      ...prev.sizes,
                      shoe: e.target.value,
                    },
                  }))
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
                value={preferences.sizes.ring}
                onChange={(e) =>
                  setPreferences((prev) => ({
                    ...prev,
                    sizes: {
                      ...prev.sizes,
                      ring: e.target.value,
                    },
                  }))
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
              {/* Gender */}
              <Select
                label="Gender"
                value={preferences.gender}
                onChange={(e) =>
                  setPreferences((prev) => ({
                    ...prev,
                    gender: e.target.value,
                  }))
                }
                options={[
                  { value: "Male", label: "Male" },
                  { value: "Female", label: "Female" },
                  { value: "Non-binary", label: "Non-binary" },
                  { value: "Prefer not to say", label: "Prefer not to say" },
                ]}
              />
            </div>

            {/* Age Group */}
            <Select
              label="Age Group"
              value={preferences.ageGroup}
              onChange={(e) =>
                setPreferences((prev) => ({
                  ...prev,
                  ageGroup: e.target.value,
                }))
              }
              options={[
                { value: "0-12", label: "Child (0-12)" },
                { value: "13-19", label: "Teen (13-19)" },
                { value: "20-29", label: "Young Adult (20-29)" },
                { value: "30-49", label: "Adult (30-49)" },
                { value: "50+", label: "Senior (50+)" },
              ]}
            />

            {/* Wishlist */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Wishlist
              </label>
              <textarea
                value={preferences.wishlist}
                onChange={(e) =>
                  setPreferences((prev) => ({
                    ...prev,
                    wishlist: e.target.value,
                  }))
                }
                placeholder="List specific items you'd like to receive"
                rows={4}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#B91C1C] focus:border-[#B91C1C] sm:text-sm"
              />
            </div>

            {/* Restrictions */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Restrictions
              </label>
              <textarea
                value={preferences.restrictions}
                onChange={(e) =>
                  setPreferences((prev) => ({
                    ...prev,
                    restrictions: e.target.value,
                  }))
                }
                placeholder="Any allergies, dislikes, or things to avoid"
                rows={4}
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
