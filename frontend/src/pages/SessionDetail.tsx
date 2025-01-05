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
import { ConfirmModal } from "../components/common/ConfirmModal";
import { StatusBadge } from "../components/common/StatusBadge";
import { Select } from "../components/common/Select";
import {
  formatDate,
  formatDateTime,
  getCurrentTimezone,
  formatForDateTimeInput,
} from "../lib/date-utils";

const MAX_PARTICIPANTS = 25;

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
  const [isDeleteSessionLoading, setIsDeleteSessionLoading] = useState(false);
  const [loadingParticipantIds, setLoadingParticipantIds] = useState<string[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [inviteCopied, setInviteCopied] = useState(false);
  const [editingPreferences, setEditingPreferences] = useState<string | null>(
    null
  );
  const [isEditingDetails, setIsEditingDetails] = useState(false);
  const [editedDetails, setEditedDetails] = useState({
    budget: 0,
    registrationDeadline: "",
    giftExchangeDate: "",
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
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteParticipantId, setDeleteParticipantId] = useState<string | null>(
    null
  );
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState("");

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

    // Check participant limit
    if (participants.length >= MAX_PARTICIPANTS) {
      showAlert(
        "error",
        `This session is limited to ${MAX_PARTICIPANTS} participants.`
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

  const handleDelete = async () => {
    if (!session || session.status === "completed") return;

    try {
      setIsDeleteSessionLoading(true);
      await sessionService.deleteSession(session._id);
      navigate("/dashboard");
      showAlert("success", "Session deleted successfully");
    } catch (err: any) {
      showAlert(
        "error",
        err.response?.data?.message || "Failed to delete session"
      );
    } finally {
      setIsDeleteSessionLoading(false);
    }
  };

  const handleDeleteParticipant = async (participantId: string) => {
    if (!session) return;

    try {
      setLoadingParticipantIds((prev) => [...prev, participantId]); // Add the ID to the loading list
      await participantService.deleteParticipant(session._id, participantId);
      setParticipants(participants.filter((p) => p._id !== participantId));
      showAlert("success", "Participant removed successfully!");
    } catch (err: any) {
      showAlert(
        "error",
        err.response?.data?.message || "Failed to remove participant"
      );
    } finally {
      setLoadingParticipantIds((prev) =>
        prev.filter((id) => id !== participantId)
      ); // Remove the ID from the loading list
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
    if (participant.preferences) {
      setPreferences({
        interests: participant.preferences.interests || "",
        sizes: {
          clothing: participant.preferences.sizes?.clothing || "",
          shoe: participant.preferences.sizes?.shoe || "",
          ring: participant.preferences.sizes?.ring || "",
        },
        wishlist: participant.preferences.wishlist || "",
        restrictions: participant.preferences.restrictions || "",
        ageGroup: participant.preferences.ageGroup || "",
        gender: participant.preferences.gender || "",
      });
    } else {
      setPreferences(emptyPreferences);
    }
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

  const handleEditDetails = () => {
    setIsEditingDetails(true);
    setEditedDetails({
      budget: session?.budget || 0,
      registrationDeadline: formatForDateTimeInput(
        session?.registrationDeadline || ""
      ),
      giftExchangeDate: session?.giftExchangeDate.split("T")[0] || "",
    });
  };

  const handleDetailsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditedDetails((prev) => ({
      ...prev,
      [name]: name === "budget" ? Number(value) : value,
    }));
  };

  const handleDetailsSave = async () => {
    if (!session) return;

    try {
      setIsSubmitting(true);
      const updatedSession = await sessionService.updateSession(
        session._id,
        editedDetails
      );
      setSession(updatedSession);
      setIsEditingDetails(false);
      showAlert("success", "Session details updated successfully");
    } catch (err: any) {
      showAlert(
        "error",
        err.response?.data?.message || "Failed to update session details"
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
      <BackButton navigateTo="/dashboard" />
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {session.name}
            </h1>
            <div className="space-y-2">
              <p className="text-sm text-gray-500">
                Created on {formatDate(session.createdAt)}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                  <div className="flex justify-between items-start">
                    <h3 className="text-sm font-medium text-gray-500">
                      Budget per person
                    </h3>
                  </div>
                  <p className="mt-1 text-lg font-semibold text-gray-900">
                    {session.budget}
                  </p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                  <h3 className="text-sm font-medium text-gray-500">
                    Registration Deadline
                  </h3>
                  <p className="mt-1 text-lg font-semibold text-gray-900">
                    {formatDateTime(session.registrationDeadline)}
                  </p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                  <h3 className="text-sm font-medium text-gray-500">
                    Gift Exchange Date
                  </h3>
                  <p className="mt-1 text-lg font-semibold text-gray-900">
                    {formatDate(session.giftExchangeDate)}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <StatusBadge status={session.status} />
            {session.status === "open" && (
              <Button variant="secondary" onClick={handleEditDetails}>
                Edit Session
              </Button>
            )}
            {session.status !== "completed" && (
              <Button
                variant="danger"
                onClick={() => setDeleteModalOpen(true)}
                isLoading={isDeleteSessionLoading}
              >
                Delete Session
              </Button>
            )}
          </div>
        </div>

        {/* Invite Link Section */}
        {session.status === "open" && (
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

        {/* Add Participant Form */}
        {session.status === "open" && (
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Add Participant
              </h2>
              <div className="text-sm text-gray-500">
                {participants.length} / {MAX_PARTICIPANTS} participants
              </div>
            </div>
            {participants.length >= MAX_PARTICIPANTS ? (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                <p className="text-sm text-yellow-700">
                  You've reached the maximum number of participants for this
                  session.
                </p>
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

        {/* Participants List */}
        {(session.status === "open" || session.status === "locked") && (
          <div className="mt-6">
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Participants ({participants.length})
                  </h2>
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
                              Assigned to: {participant.assignedTo.name}
                            </p>
                          )}
                        {participant.preferences &&
                          (participant.preferences.interests ||
                            participant.preferences.wishlist ||
                            participant.preferences.restrictions ||
                            participant.preferences.ageGroup ||
                            participant.preferences.gender ||
                            Object.values(participant.preferences.sizes).some(
                              (size) => size
                            )) && (
                            <div className="mt-2 text-sm text-gray-500">
                              <span className="font-medium">
                                Has gift preferences
                              </span>
                            </div>
                          )}
                      </div>
                      {session.status === "open" && (
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
                            isLoading={loadingParticipantIds.includes(
                              participant._id
                            )}
                          >
                            Remove
                          </Button>
                        </div>
                      )}
                      {session.status === "locked" && (
                        <div className="flex flex-col sm:flex-row gap-2">
                          <Button
                            variant="secondary"
                            onClick={() => startEditingPreferences(participant)}
                          >
                            View Preferences
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
                      handleUpdateField("interests", e.target.value)
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
                      handleUpdateSize("clothing", e.target.value)
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
                    value={preferences?.sizes?.ring || ""}
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
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Wishlist (optional)
                  </label>
                  <textarea
                    value={preferences?.wishlist || ""}
                    onChange={(e) =>
                      handleUpdateField("wishlist", e.target.value)
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
                      handleUpdateField("restrictions", e.target.value)
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
                      handleUpdateField("ageGroup", e.target.value)
                    }
                    options={[
                      { value: "0-12", label: "0-12" },
                      { value: "13-19", label: "13-19" },
                      { value: "20-29", label: "20-29" },
                      { value: "30-49", label: "30-49" },
                      { value: "50+", label: "50+" },
                    ]}
                  />
                </div>
                <div className="sm:col-span-2">
                  <Select
                    label="Gender (optional)"
                    value={preferences?.gender || ""}
                    onChange={(e) =>
                      handleUpdateField("gender", e.target.value)
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

        {/* Edit Details Modal */}
        {isEditingDetails && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h2 className="text-xl font-semibold mb-4">
                Edit Session Details
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Budget
                  </label>
                  <input
                    type="number"
                    name="budget"
                    value={editedDetails.budget}
                    onChange={handleDetailsChange}
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
                    value={editedDetails.registrationDeadline}
                    onChange={handleDetailsChange}
                    min={new Date().toISOString().slice(0, 16)}
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
                    value={editedDetails.giftExchangeDate}
                    onChange={handleDetailsChange}
                    min={editedDetails.registrationDeadline.split("T")[0]}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    required
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setIsEditingDetails(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleDetailsSave}
                  disabled={isSubmitting}
                  isLoading={isSubmitting}
                >
                  Save Changes
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
