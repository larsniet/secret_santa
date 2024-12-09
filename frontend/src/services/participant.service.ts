import { api } from "./api";

export interface Participant {
  _id: string;
  name: string;
  email: string;
  assignedTo?: string;
  session: string;
  createdAt: string;
  preferences?: {
    interests?: string;
    sizes?: string;
    wishlist?: string;
    restrictions?: string;
  };
}

class ParticipantService {
  async getParticipants(sessionId: string): Promise<Participant[]> {
    const response = await api.get<Participant[]>(
      `/sessions/${sessionId}/participants`
    );
    return response.data;
  }

  async addParticipant(
    sessionId: string,
    data: { name: string; email: string }
  ): Promise<Participant> {
    const response = await api.post<Participant>(
      `/sessions/${sessionId}/participants`,
      data
    );
    return response.data;
  }

  async deleteAllParticipants(sessionId: string): Promise<void> {
    await api.delete(`/sessions/${sessionId}/participants`);
  }

  async deleteParticipant(
    sessionId: string,
    participantId: string
  ): Promise<void> {
    await api.delete(`/sessions/${sessionId}/participants/${participantId}`);
  }

  async createAssignments(
    sessionId: string
  ): Promise<{ message: string; assignments: any[] }> {
    const response = await api.post(`/sessions/${sessionId}/assignments`);
    return response.data;
  }

  async getAssignments(sessionId: string): Promise<any[]> {
    const response = await api.get(`/sessions/${sessionId}/assignments`);
    return response.data;
  }

  async updatePreferences(
    sessionId: string,
    participantId: string,
    preferences: {
      interests?: string;
      sizes?: string;
      wishlist?: string;
      restrictions?: string;
    }
  ): Promise<Participant> {
    const response = await api.patch<Participant>(
      `/sessions/${sessionId}/participants/${participantId}/preferences`,
      preferences
    );
    return response.data;
  }

  async getParticipantPreferences(
    sessionId: string,
    participantId: string
  ): Promise<Participant> {
    const response = await api.get<Participant>(
      `/sessions/${sessionId}/participants/${participantId}`
    );
    return response.data;
  }

  async joinSession(
    sessionId: string,
    data: { name: string; email: string }
  ): Promise<Participant> {
    const response = await api.post<Participant>(
      `/sessions/${sessionId}/participants`,
      data
    );
    return response.data;
  }

  async getPreferences(
    sessionId: string,
    participantId: string
  ): Promise<Participant["preferences"]> {
    const response = await api.get<Participant>(
      `/sessions/${sessionId}/participants/${participantId}`
    );
    return (
      response.data.preferences || {
        interests: "",
        sizes: "",
        wishlist: "",
        restrictions: "",
      }
    );
  }
}

export const participantService = new ParticipantService();
