import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Layout } from "../components/layout/Layout";
import { Button } from "../components/common/Button";
import { sessionService, Session } from "../services/session.service";
import {
  participantService,
  Participant,
} from "../services/participant.service";
import { useAlert } from "../contexts/AlertContext";
import { Loading } from "../components/common/Loading";

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
  const [preferences, setPreferences] = useState<{
    interests?: string;
    sizes?: string;
    wishlist?: string;
    restrictions?: string;
  }>({
    interests: "",
    sizes: "",
    wishlist: "",
    restrictions: "",
  });

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
  }, [id, navigate]);

  useEffect(() => {
    loadSessionAndParticipants();
  }, [id, navigate, loadSessionAndParticipants]);

  const handleAddParticipant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) return;

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
      const updatedSession = await sessionService.updateSessionStatus(
        session._id,
        "completed"
      );
      setSession(updatedSession);
      showAlert("success", "Secret Santa assignments have been sent!");
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

  const handleDeleteParticipant = async (participantId: string) => {
    if (
      !session ||
      !window.confirm("Are you sure you want to remove this participant?")
    )
      return;

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
    if (!session) return;

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
    setPreferences({
      interests: participant.preferences?.interests || "",
      sizes: participant.preferences?.sizes || "",
      wishlist: participant.preferences?.wishlist || "",
      restrictions: participant.preferences?.restrictions || "",
    });
  };

  const handleDelete = async () => {
    if (
      !session ||
      !window.confirm("Are you sure you want to delete this session?")
    )
      return;

    try {
      setIsSubmitting(true);
      await sessionService.deleteSession(session._id);
      showAlert("success", "Session deleted successfully");
      navigate("/dashboard");
    } catch (err: any) {
      showAlert(
        "error",
        err.response?.data?.message || "Failed to delete session"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = async (newStatus: Session["status"]) => {
    if (!session) return;

    try {
      setIsSubmitting(true);
      const updatedSession = await sessionService.updateSessionStatus(
        session._id,
        newStatus
      );
      setSession(updatedSession);
      showAlert("success", `Session status updated to ${newStatus}`);
    } catch (err: any) {
      showAlert(
        "error",
        err.response?.data?.message || "Failed to update session status"
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
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{session.name}</h1>
            <p className="mt-1 text-sm text-gray-500">
              Created on {new Date(session.createdAt).toLocaleDateString()}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <select
                value={session.status}
                onChange={(e) =>
                  handleStatusChange(e.target.value as Session["status"])
                }
                className={`appearance-none pl-3 pr-10 py-2 rounded-lg border text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#B91C1C] ${
                  session.status === "active"
                    ? "bg-green-50 text-green-700 border-green-200"
                    : session.status === "completed"
                    ? "bg-blue-50 text-blue-700 border-blue-200"
                    : "bg-gray-50 text-gray-700 border-gray-200"
                }`}
                disabled={isSubmitting}
              >
                <option value="active" className="bg-green-50 text-green-700">
                  Active
                </option>
                <option value="completed" className="bg-blue-50 text-blue-700">
                  Completed
                </option>
                <option value="archived" className="bg-gray-50 text-gray-700">
                  Archived
                </option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>
            <Button
              variant="danger"
              onClick={handleDelete}
              isLoading={isSubmitting}
            >
              Delete Session
            </Button>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
          <h2 className="text-lg font-medium text-gray-900 mb-2">
            Invite Participants
          </h2>
          <p className="text-sm text-gray-600 mb-3">
            Share this link with participants to join your Secret Santa session:
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

        {session.status === "active" && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Add Participant
            </h2>
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
          </div>
        )}

        <div className="mt-6">
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  Participants ({participants.length})
                </h2>
                {session.status === "active" && participants.length >= 2 && (
                  <Button onClick={handleStartSession} isLoading={isSubmitting}>
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
                            handleDeleteParticipant(participant._id)
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
                    value={preferences.interests || ""}
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
                  <label className="block text-sm font-medium text-gray-700">
                    Sizes (optional)
                  </label>
                  <input
                    type="text"
                    value={preferences.sizes || ""}
                    onChange={(e) =>
                      setPreferences({
                        ...preferences,
                        sizes: e.target.value,
                      })
                    }
                    placeholder="e.g., M for clothes, 9 for shoes"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#B91C1C] focus:border-[#B91C1C] sm:text-sm"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Wishlist (optional)
                  </label>
                  <textarea
                    value={preferences.wishlist || ""}
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
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Restrictions (optional)
                  </label>
                  <input
                    type="text"
                    value={preferences.restrictions || ""}
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
      </div>
    </Layout>
  );
};
