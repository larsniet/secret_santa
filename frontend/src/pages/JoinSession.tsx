import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { Layout } from "../components/layout/Layout";
import { Button } from "../components/common/Button";
import { useAlert } from "../contexts/AlertContext";
import { sessionService } from "../services/session.service";
import {
  Participant,
  participantService,
} from "../services/participant.service";
import { Select } from "../components/common/Select";

export const JoinSession: React.FC = () => {
  const { code } = useParams<{ code: string }>();
  const { showAlert } = useAlert();
  const [session, setSession] = useState<any>(null);
  const [participant, setParticipant] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState<
    "join" | "preferences" | "success"
  >("join");
  const [joinData, setJoinData] = useState({
    name: "",
    email: "",
    gender: "",
  });
  const emptyPreferences: Required<NonNullable<Participant["preferences"]>> = {
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
  };

  const [preferences, setPreferences] =
    useState<Required<NonNullable<Participant["preferences"]>>>(
      emptyPreferences
    );

  const handleUpdateField = (
    field: keyof typeof preferences,
    value: string
  ) => {
    setPreferences((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleUpdateSize = (
    field: keyof typeof preferences.sizes,
    value: string
  ) => {
    setPreferences((prev) => ({
      ...prev,
      sizes: {
        ...prev.sizes,
        [field]: value,
      },
    }));
  };

  const loadSession = useCallback(async () => {
    if (!code) return;
    try {
      const data = await sessionService.getSessionByInviteCode(code);
      setSession(data);
    } catch (err: any) {
      console.error("Session loading error:", err);
      showAlert(
        "error",
        err.response?.data?.message ||
          err.response?.data?.error ||
          err.message ||
          "Failed to load session"
      );
    } finally {
      setIsLoading(false);
    }
  }, [code, showAlert]);

  useEffect(() => {
    loadSession();
  }, [loadSession]);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?._id) return;

    try {
      setIsLoading(true);
      const data = await participantService.joinSession(session._id, joinData);
      setParticipant(data);
      setCurrentStep("preferences");
    } catch (err: any) {
      showAlert(
        "error",
        err.response?.data?.message || "Failed to join session"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreferences = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session || !participant) return;

    try {
      setIsLoading(true);
      await participantService.updatePreferences(
        session._id,
        participant._id,
        preferences
      );
      setCurrentStep("success");
    } catch (err: any) {
      showAlert(
        "error",
        err.response?.data?.message || "Failed to save preferences"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepIndicator = () => (
    <div className="mb-8">
      <div className="flex items-center justify-center space-x-4">
        <div className="flex items-center">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center ${
              currentStep === "join"
                ? "bg-[#B91C1C] text-white"
                : "bg-green-500 text-white"
            }`}
          >
            {currentStep === "join" ? "1" : "✓"}
          </div>
          <div className="ml-2 text-sm font-medium text-gray-900">Join</div>
        </div>
        <div className="w-16 h-0.5 bg-gray-200" />
        <div className="flex items-center">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center ${
              currentStep === "preferences"
                ? "bg-[#B91C1C] text-white"
                : currentStep === "success"
                ? "bg-green-500 text-white"
                : "bg-gray-200 text-gray-400"
            }`}
          >
            {currentStep === "success" ? "✓" : "2"}
          </div>
          <div
            className={`ml-2 text-sm font-medium ${
              currentStep === "join" ? "text-gray-400" : "text-gray-900"
            }`}
          >
            Preferences
          </div>
        </div>
      </div>
    </div>
  );

  const renderJoinStep = () => (
    <form onSubmit={handleJoin} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Your Name
        </label>
        <input
          type="text"
          value={joinData.name}
          onChange={(e) => setJoinData({ ...joinData, name: e.target.value })}
          placeholder="Enter your name"
          required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#B91C1C] focus:border-[#B91C1C] sm:text-sm"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Email Address
        </label>
        <input
          type="email"
          value={joinData.email}
          onChange={(e) => setJoinData({ ...joinData, email: e.target.value })}
          placeholder="Enter your email"
          required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#B91C1C] focus:border-[#B91C1C] sm:text-sm"
        />
      </div>
      <div>
        <Select
          label="Gender"
          value={joinData.gender}
          onChange={(e) => setJoinData({ ...joinData, gender: e.target.value })}
          required
          options={[
            { value: "Male", label: "Male" },
            { value: "Female", label: "Female" },
            { value: "Non-binary", label: "Non-binary" },
            { value: "Prefer not to say", label: "Prefer not to say" },
          ]}
        />
      </div>
      <Button type="submit" isLoading={isLoading} className="w-full">
        Join Secret Santa
      </Button>
    </form>
  );

  const renderPreferencesStep = () => (
    <form onSubmit={handlePreferences} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Interests & Hobbies (optional)
        </label>
        <input
          type="text"
          value={preferences.interests}
          onChange={(e) => handleUpdateField("interests", e.target.value)}
          placeholder="e.g., Reading, Cooking, Sports"
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#B91C1C] focus:border-[#B91C1C] sm:text-sm"
        />
      </div>
      <div>
        <Select
          label="Clothing Size (optional)"
          value={preferences.sizes.clothing}
          onChange={(e) => handleUpdateSize("clothing", e.target.value)}
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
          label="Shoe Size (optional)"
          value={preferences.sizes.shoe}
          onChange={(e) => handleUpdateSize("shoe", e.target.value)}
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
          label="Ring Size (optional)"
          value={preferences.sizes.ring}
          onChange={(e) => handleUpdateSize("ring", e.target.value)}
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
          Wishlist (optional)
        </label>
        <textarea
          value={preferences.wishlist}
          onChange={(e) => handleUpdateField("wishlist", e.target.value)}
          placeholder="List any specific items you'd like"
          rows={3}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#B91C1C] focus:border-[#B91C1C] sm:text-sm"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Restrictions (optional)
        </label>
        <input
          type="text"
          value={preferences.restrictions}
          onChange={(e) => handleUpdateField("restrictions", e.target.value)}
          placeholder="e.g., No food items, allergies"
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#B91C1C] focus:border-[#B91C1C] sm:text-sm"
        />
      </div>
      <div>
        <Select
          label="Age Group (optional)"
          value={preferences.ageGroup}
          onChange={(e) => handleUpdateField("ageGroup", e.target.value)}
          options={[
            { value: "0-12", label: "0-12" },
            { value: "13-19", label: "13-19" },
            { value: "20-29", label: "20-29" },
            { value: "30-49", label: "30-49" },
            { value: "50+", label: "50+" },
          ]}
        />
      </div>
      <div>
        <Select
          label="Gender (optional)"
          value={preferences.gender}
          onChange={(e) => handleUpdateField("gender", e.target.value)}
          options={[
            { value: "Male", label: "Male" },
            { value: "Female", label: "Female" },
            { value: "Non-binary", label: "Non-binary" },
            { value: "Prefer not to say", label: "Prefer not to say" },
          ]}
        />
      </div>
      <Button type="submit" isLoading={isLoading} className="w-full">
        Save Preferences
      </Button>
    </form>
  );

  const renderSuccessStep = () => (
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
      <h2 className="text-2xl font-bold text-gray-900 mb-4">You're All Set!</h2>
      <p className="text-gray-600 mb-8">
        You've successfully joined the Secret Santa session
        {session?.name && ` for ${session.name}`}. We'll notify you by email
        when the gift exchange begins!
      </p>
      <Button onClick={() => (window.location.href = "/")}>
        Return to Home
      </Button>
    </div>
  );

  return (
    <Layout>
      <div className="max-w-lg mx-auto">
        <div className="bg-white p-6 rounded-lg shadow-md">
          {currentStep === "success" ? (
            renderSuccessStep()
          ) : (
            <>
              {renderStepIndicator()}
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  {currentStep === "join"
                    ? "Join Secret Santa"
                    : "Set Your Gift Preferences"}
                </h1>
                <p className="text-gray-600">
                  {currentStep === "join"
                    ? "Enter your details to join the Secret Santa gift exchange."
                    : "Help your Secret Santa choose the perfect gift by sharing your preferences."}
                </p>
              </div>

              {currentStep === "join" && renderJoinStep()}
              {currentStep === "preferences" && renderPreferencesStep()}
            </>
          )}
        </div>
      </div>
    </Layout>
  );
};
