import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Layout } from "../components/layout/Layout";
import { Button } from "../components/common/Button";
import { BackButton } from "../components/common/BackButton";
import { sessionService, Session } from "../services/session.service";
import {
  participantService,
  Participant,
} from "../services/participant.service";
import { useAlert } from "../contexts/AlertContext";
import { Loading } from "../components/common/Loading";
import { PLAN_LIMITS, EventPlan } from "../types/plans";
import { stripePromise } from "../lib/stripe";
import { ConfirmModal } from "../components/common/ConfirmModal";
import { StatusBadge } from "../components/common/StatusBadge";
import { Select } from "../components/common/Select";

export const SessionDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showAlert } = useAlert();
  const [session, setSession] = useState<Session | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [newParticipant, setNewParticipant] = useState({
    name: "",
    email: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [inviteCopied, setInviteCopied] = useState(false);
  const [editingPreferences, setEditingPreferences] = useState<string | null>(
    null
  );

  const [preferences, setPreferences] = useState<
    Participant["preferences"] | undefined
  >({
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
  const [selectedPlan, setSelectedPlan] = useState<EventPlan | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteParticipantId, setDeleteParticipantId] = useState<string | null>(
    null
  );
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState("");

  useEffect(() => {
    if (session) {
      setSelectedPlan(session.plan as EventPlan);
    }
  }, [session]);

  useEffect(() => {
    if (session?.status === "completed") {
      navigate("/dashboard");
      return;
    }
  }, [session, navigate]);

  const loadSessionAndParticipants = useCallback(async () => {
    if (!id) return;

    try {
      setIsLoading(true);
      const sessionData = await sessionService.getSession(id);
      setSession(sessionData);
      const participantsData = await participantService.getParticipants(
        sessionData._id
      );
      setParticipants(participantsData);
    } catch (err: any) {
      console.error("Error loading session:", err);
      showAlert(
        "error",
        err.response?.data?.message || "Failed to load session details"
      );
      // Only navigate away if the session doesn't exist or user is unauthorized
      if (err.response?.status === 404 || err.response?.status === 401) {
        navigate("/dashboard");
      }
    } finally {
      setIsLoading(false);
    }
  }, [id, navigate, showAlert]);

  useEffect(() => {
    loadSessionAndParticipants();
  }, [id, navigate, loadSessionAndParticipants]);

  const handleAddParticipant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) return;

    // Check participant limit based on plan
    const planLimit = PLAN_LIMITS[session.plan as EventPlan].maxParticipants;
    if (participants.length >= planLimit) {
      showAlert(
        "error",
        `Your ${session.plan} plan is limited to ${planLimit} participants. Please upgrade your plan to add more participants.`
      );
      return;
    }

    try {
      setIsSubmitting(true);
      const participant = await participantService.addParticipant(session._id, {
        name: newParticipant.name,
        email: newParticipant.email,
      });
      setParticipants([...participants, participant]);
      setNewParticipant({ name: "", email: "" });
      showAlert("success", "Participant added successfully!");
    } catch (err: any) {
      showAlert(
        "error",
        err.response?.data?.message || "Failed to add participant"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartSession = async () => {
    if (!session) return;

    try {
      setIsSubmitting(true);
      await participantService.createAssignments(session._id);
      showAlert("success", "Secret Santa assignments have been sent!");
      navigate("/dashboard");
    } catch (err: any) {
      showAlert(
        "error",
        err.response?.data?.message ||
          "Failed to create Secret Santa assignments"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!session || session.status === "completed") return;

    try {
      setIsSubmitting(true);
      await sessionService.deleteSession(session._id);
      navigate("/dashboard");
      showAlert("success", "Session deleted successfully");
    } catch (err: any) {
      showAlert(
        "error",
        err.response?.data?.message || "Failed to delete session"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteParticipant = async (participantId: string) => {
    if (!session) return;

    try {
      setIsSubmitting(true);
      await participantService.deleteParticipant(session._id, participantId);
      setParticipants(participants.filter((p) => p._id !== participantId));
      showAlert("success", "Participant removed successfully!");
    } catch (err: any) {
      showAlert(
        "error",
        err.response?.data?.message || "Failed to remove participant"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyInviteLink = () => {
    const inviteLink = `${window.location.origin}/join/${session?.inviteCode}`;

    if (navigator.clipboard && window.isSecureContext) {
      // Use clipboard API when available
      navigator.clipboard.writeText(inviteLink).then(() => {
        setInviteCopied(true);
        setTimeout(() => setInviteCopied(false), 2000);
      });
    } else {
      // Fallback for mobile devices
      const textArea = document.createElement("textarea");
      textArea.value = inviteLink;
      // Avoid scrolling to bottom
      textArea.style.top = "0";
      textArea.style.left = "0";
      textArea.style.position = "fixed";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();

      try {
        document.execCommand("copy");
        setInviteCopied(true);
        setTimeout(() => setInviteCopied(false), 2000);
      } catch (err) {
        console.error("Failed to copy text: ", err);
      }

      document.body.removeChild(textArea);
    }
  };

  const handleUpdatePreferences = async (participantId: string) => {
    if (!session || !preferences) return;

    try {
      setIsSubmitting(true);
      const updatedParticipant = await participantService.updatePreferences(
        session._id,
        participantId,
        preferences
      );
      setParticipants(
        participants.map((p) =>
          p._id === participantId ? updatedParticipant : p
        )
      );
      setEditingPreferences(null);
      showAlert("success", "Preferences updated successfully!");
    } catch (err: any) {
      showAlert(
        "error",
        err.response?.data?.message || "Failed to update preferences"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const startEditingPreferences = (participant: Participant) => {
    setEditingPreferences(participant._id);
    setPreferences(participant.preferences);
  };

  const handleNameSave = async () => {
    if (!session || !editedName.trim()) return;

    try {
      setIsSubmitting(true);
      const updatedSession = await sessionService.updateSession(session._id, {
        name: editedName.trim(),
      });
      setSession(updatedSession);
      setIsEditingName(false);
      showAlert("success", "Session name updated successfully");
    } catch (err: any) {
      showAlert(
        "error",
        err.response?.data?.message || "Failed to update session name"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Layout isLoading>
        <Loading />
      </Layout>
    );
  }

  if (isLoading || !session) {
    return (
      <Layout>
        <Loading />
      </Layout>
    );
  }

  return (
    <Layout>
      <BackButton />
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {session.name}
            </h1>
            <p className="text-sm text-gray-500">
              Created on{" "}
              {new Date(session.createdAt).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              })}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <StatusBadge type="status" value={session.status} />
            <StatusBadge type="plan" value={session.plan} />
            {session.status === "pending_payment" && (
              <Button
                onClick={async () => {
                  try {
                    const checkoutSession =
                      await sessionService.createCheckoutSession(session._id);
                    const stripe = await stripePromise;
                    if (!stripe)
                      throw new Error("Failed to load payment system");
                    await stripe.redirectToCheckout({
                      sessionId: checkoutSession.id,
                    });
                  } catch (err: any) {
                    showAlert(
                      "error",
                      err.response?.data?.message ||
                        "Failed to initiate payment"
                    );
                  }
                }}
              >
                Complete Payment
              </Button>
            )}
            {session.status !== "completed" && (
              <Button
                variant="danger"
                onClick={() => setDeleteModalOpen(true)}
                isLoading={isSubmitting}
              >
                Delete Session
              </Button>
            )}
          </div>
        </div>

        {session.status === "pending_payment" && (
          <div className="mt-6">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
              <h2 className="text-xl font-semibold text-yellow-800 mb-3">
                Payment Required
              </h2>
              <p className="text-yellow-700 mb-4">
                Please complete the payment to activate your session and start
                inviting participants.
              </p>
              <Button
                onClick={async () => {
                  try {
                    const checkoutSession =
                      await sessionService.createCheckoutSession(session._id);
                    const stripe = await stripePromise;
                    if (!stripe)
                      throw new Error("Failed to load payment system");
                    await stripe.redirectToCheckout({
                      sessionId: checkoutSession.id,
                    });
                  } catch (err: any) {
                    showAlert(
                      "error",
                      err.response?.data?.message ||
                        "Failed to initiate payment"
                    );
                  }
                }}
              >
                Complete Payment
              </Button>
            </div>
          </div>
        )}

        {session.status === "active" && (
          <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
            <h2 className="text-lg font-medium text-gray-900 mb-2">
              Invite Participants
            </h2>
            <p className="text-sm text-gray-600 mb-3">
              Share this link with participants to join your Secret Santa
              session:
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={`${window.location.origin}/join/${session.inviteCode}`}
                readOnly
                className="flex-1 p-2 bg-white border border-gray-300 rounded-md text-sm text-gray-600"
              />
              <Button variant="secondary" onClick={copyInviteLink} size="md">
                {inviteCopied ? "Copied!" : "Copy Link"}
              </Button>
            </div>
          </div>
        )}

        {session.status === "active" && (
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Add Participant
              </h2>
              <div className="text-sm text-gray-500">
                {participants.length} /{" "}
                {PLAN_LIMITS[session.plan as EventPlan].maxParticipants}{" "}
                participants
              </div>
            </div>
            {participants.length >=
            PLAN_LIMITS[session.plan as EventPlan].maxParticipants ? (
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Upgrade Plan
                  </h2>
                  <p className="text-sm text-yellow-700">
                    You've reached the maximum number of participants for your{" "}
                    {session.plan} plan
                  </p>
                </div>

                {session.plan !== EventPlan.BUSINESS && (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-4">
                        Select Plan
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {Object.entries(PLAN_LIMITS).map(([plan, details]) => {
                          const isLowerTier =
                            plan === EventPlan.FREE ||
                            (plan === EventPlan.GROUP &&
                              session.plan === EventPlan.BUSINESS);

                          // Calculate price with potential discount
                          const displayPrice =
                            plan === EventPlan.BUSINESS &&
                            session.plan === EventPlan.GROUP
                              ? 6 // Discounted price for GROUP to BUSINESS upgrade
                              : details.price;

                          return (
                            <div
                              key={plan}
                              className={`relative rounded-lg border p-4 ${
                                isLowerTier
                                  ? "opacity-50 cursor-not-allowed"
                                  : "cursor-pointer " +
                                    (plan === selectedPlan
                                      ? "border-[#B91C1C] ring-2 ring-[#B91C1C]"
                                      : "border-gray-200 hover:border-[#B91C1C]")
                              }`}
                              onClick={() => {
                                if (!isLowerTier && plan !== session.plan) {
                                  setSelectedPlan(plan as EventPlan);
                                }
                              }}
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <h3 className="text-sm font-medium text-gray-900">
                                    {plan}
                                  </h3>
                                  <p className="mt-1 text-sm text-gray-500">
                                    {displayPrice === 0
                                      ? "Free"
                                      : `€${displayPrice}`}
                                    {plan === EventPlan.BUSINESS &&
                                      session.plan === EventPlan.GROUP && (
                                        <span className="ml-2 text-xs text-green-600">
                                          40% off upgrade
                                        </span>
                                      )}
                                  </p>
                                  {isLowerTier && (
                                    <p className="mt-1 text-xs text-red-600">
                                      Cannot downgrade to a lower tier
                                    </p>
                                  )}
                                </div>
                                <div
                                  className={`h-5 w-5 rounded-full border ${
                                    plan === selectedPlan && !isLowerTier
                                      ? "border-[#B91C1C] bg-[#B91C1C]"
                                      : "border-gray-300 bg-white"
                                  } flex items-center justify-center`}
                                >
                                  {plan === selectedPlan && !isLowerTier && (
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
                                    <li
                                      key={index}
                                      className="flex items-start"
                                    >
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
                        onClick={() => setSelectedPlan(null)}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={async () => {
                          if (selectedPlan && selectedPlan !== session.plan) {
                            try {
                              const updatedSession =
                                await sessionService.createCheckoutSession(
                                  session._id
                                );
                              const stripe = await stripePromise;
                              if (!stripe)
                                throw new Error(
                                  "Failed to load payment system"
                                );
                              await stripe.redirectToCheckout({
                                sessionId: updatedSession.id,
                              });
                            } catch (err: any) {
                              showAlert(
                                "error",
                                err.response?.data?.message ||
                                  "Failed to initiate upgrade"
                              );
                            }
                          }
                        }}
                        disabled={
                          !selectedPlan || selectedPlan === session.plan
                        }
                      >
                        Continue to Payment
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <form onSubmit={handleAddParticipant}>
                <div className="flex flex-col sm:flex-row gap-4">
                  <input
                    type="text"
                    value={newParticipant.name}
                    onChange={(e) =>
                      setNewParticipant({
                        ...newParticipant,
                        name: e.target.value,
                      })
                    }
                    placeholder="Name"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#B91C1C] focus:border-[#B91C1C] sm:text-sm"
                    required
                    disabled={isSubmitting}
                  />
                  <input
                    type="email"
                    value={newParticipant.email}
                    onChange={(e) =>
                      setNewParticipant({
                        ...newParticipant,
                        email: e.target.value,
                      })
                    }
                    placeholder="Email address"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#B91C1C] focus:border-[#B91C1C] sm:text-sm"
                    required
                    disabled={isSubmitting}
                  />
                  <Button type="submit" isLoading={isSubmitting}>
                    Add Participant
                  </Button>
                </div>
              </form>
            )}
          </div>
        )}

        {(session.status === "active" || session.status === "archived") && (
          <div className="mt-6">
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Participants ({participants.length})
                  </h2>
                  {session.status === "active" && participants.length >= 2 && (
                    <Button
                      onClick={handleStartSession}
                      isLoading={isSubmitting}
                    >
                      Start Secret Santa
                    </Button>
                  )}
                </div>
              </div>

              <div className="divide-y divide-gray-200">
                {participants.length === 0 ? (
                  <p className="px-6 py-4 text-gray-500 text-center">
                    No participants yet. Add one to get started!
                  </p>
                ) : (
                  participants.map((participant) => (
                    <div
                      key={participant._id}
                      className="px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                    >
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">
                          {participant.name}
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">
                          {participant.email}
                        </p>
                        {session.status === "completed" &&
                          participant.assignedTo && (
                            <p className="mt-2 text-sm text-[#B91C1C]">
                              Assigned to: {participant.assignedTo}
                            </p>
                          )}
                        {participant.preferences &&
                          Object.values(participant.preferences).some(
                            Boolean
                          ) && (
                            <div className="mt-2 text-sm text-gray-500">
                              <span className="font-medium">
                                Has gift preferences
                              </span>
                            </div>
                          )}
                      </div>
                      {session.status === "active" && (
                        <div className="flex flex-col sm:flex-row gap-2">
                          <Button
                            variant="secondary"
                            onClick={() => startEditingPreferences(participant)}
                          >
                            {participant.preferences &&
                            Object.values(participant.preferences).some(Boolean)
                              ? "View Preferences"
                              : "Add Preferences"}
                          </Button>
                          <Button
                            variant="danger"
                            onClick={() =>
                              setDeleteParticipantId(participant._id)
                            }
                            isLoading={isSubmitting}
                          >
                            Remove
                          </Button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {editingPreferences && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center !m-0">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[100vh] overflow-y-auto">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">
                  Gift Preferences
                </h3>
              </div>
              <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Interests (optional)
                  </label>
                  <input
                    type="text"
                    value={preferences?.interests || ""}
                    onChange={(e) =>
                      setPreferences(
                        (prevPreferences) =>
                          ({
                            ...prevPreferences,
                            interests: e.target.value || undefined,
                          } as Participant["preferences"])
                      )
                    }
                    placeholder="e.g., Reading, Cooking, Sports"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#B91C1C] focus:border-[#B91C1C] sm:text-sm"
                  />
                </div>
                <div>
                  <Select
                    label="Clothing Size (optional)"
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
                    label="Shoe Size (optional)"
                    value={preferences?.sizes?.shoe || ""}
                    onChange={(e) =>
                      setPreferences({
                        ...preferences,
                        sizes: {
                          ...preferences?.sizes,
                          shoe: e.target.value as
                            | Participant["preferences"]["sizes"]["shoe"],
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
                    label="Ring Size (optional)"
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
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Wishlist (optional)
                  </label>
                  <textarea
                    value={preferences?.wishlist || ""}
                    onChange={(e) =>
                      setPreferences(
                        (prevPreferences) =>
                          ({
                            ...prevPreferences,
                            wishlist: e.target.value || undefined,
                          } as Participant["preferences"])
                      )
                    }
                    placeholder="List any specific items you'd like"
                    rows={3}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#B91C1C] focus:border-[#B91C1C] sm:text-sm"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Restrictions (optional)
                  </label>
                  <input
                    type="text"
                    value={preferences?.restrictions || ""}
                    onChange={(e) =>
                      setPreferences(
                        (prevPreferences) =>
                          ({
                            ...prevPreferences,
                            restrictions: e.target.value || undefined,
                          } as Participant["preferences"])
                      )
                    }
                    placeholder="e.g., No food items, allergies"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#B91C1C] focus:border-[#B91C1C] sm:text-sm"
                  />
                </div>
                <div className="sm:col-span-2">
                  <Select
                    label="Age Group (optional)"
                    value={preferences?.ageGroup || ""}
                    onChange={(e) =>
                      setPreferences(
                        (prevPreferences) =>
                          ({
                            ...prevPreferences,
                            ageGroup: e.target
                              .value as Participant["preferences"]["ageGroup"],
                          } as Participant["preferences"])
                      )
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
                <div className="sm:col-span-2">
                  <Select
                    label="Gender (optional)"
                    value={preferences?.gender || ""}
                    onChange={(e) =>
                      setPreferences(
                        (prevPreferences) =>
                          ({
                            ...prevPreferences,
                            gender: e.target
                              .value as Participant["preferences"]["gender"],
                          } as Participant["preferences"])
                      )
                    }
                    options={[
                      { value: "Male", label: "Male" },
                      { value: "Female", label: "Female" },
                      { value: "Non-binary", label: "Non-binary" },
                      {
                        value: "Prefer not to say",
                        label: "Prefer not to say",
                      },
                    ]}
                  />
                </div>
              </div>
              <div className="px-6 py-4 bg-gray-50 border-t flex justify-end gap-2">
                <Button
                  variant="secondary"
                  onClick={() => setEditingPreferences(null)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => handleUpdatePreferences(editingPreferences)}
                  isLoading={isSubmitting}
                >
                  Save Preferences
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Session Delete Modal */}
        <ConfirmModal
          isOpen={deleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          onConfirm={handleDelete}
          title="Delete Session"
          message="Are you sure you want to delete this session? This action cannot be undone."
          confirmText="Delete Session"
        />

        {/* Participant Delete Modal */}
        <ConfirmModal
          isOpen={!!deleteParticipantId}
          onClose={() => setDeleteParticipantId(null)}
          onConfirm={() => {
            if (deleteParticipantId) {
              handleDeleteParticipant(deleteParticipantId);
              setDeleteParticipantId(null);
            }
          }}
          title="Remove Participant"
          message="Are you sure you want to remove this participant? This action cannot be undone."
          confirmText="Remove Participant"
        />
      </div>
    </Layout>
  );
};
