import { api } from "./api";

export interface Participant {
  _id: string;
  name: string;
  email: string;
  session: string;
  assignedTo?: Participant;
  preferences?: {
    interests: string;
    sizes: {
      clothing: string; // 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL' | ''
      shoe: string; // '36' to '45' | ''
      ring: string; // '5' to '10' | ''
    };
    wishlist: string;
    restrictions: string;
    ageGroup: string; // '0-12' | '13-19' | '20-29' | '30-49' | '50+'
    gender: string; // 'Male' | 'Female' | 'Non-binary' | 'Prefer not to say'
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
    preferences: Participant["preferences"]
  ): Promise<Participant> {
    const response = await api.patch<Participant>(
      `/sessions/${sessionId}/participants/${participantId}/preferences`,
      preferences
    );
    return response.data;
  }

  async getParticipant(
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
        sizes: {
          clothing: "",
          shoe: "",
          ring: "",
        },
        wishlist: "",
        restrictions: "",
        ageGroup: "",
        gender: "",
      }
    );
  }

  async getMatchingProducts(
    sessionId: string,
    assignedParticipantId?: string,
    page?: number
  ): Promise<any[]> {
    const response = await api.post(
      `/sessions/${sessionId}/participants/${assignedParticipantId}/products`,
      { page }
    );
    return response.data;
  }
}

export const participantService = new ParticipantService();
