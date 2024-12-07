import { api } from "./api";

export interface Session {
  _id: string;
  name: string;
  inviteCode: string;
  status: "active" | "completed" | "archived";
  creator: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  completedAt?: string;
}

class SessionService {
  async createSession(name: string): Promise<Session> {
    const response = await api.post<Session>("/sessions", { name });
    return response.data;
  }

  async getUserSessions(): Promise<Session[]> {
    const response = await api.get<Session[]>("/sessions/my-sessions");
    return response.data;
  }

  async getSession(id: string): Promise<Session> {
    const response = await api.get<Session>(`/sessions/${id}`);
    return response.data;
  }

  async getSessionByInviteCode(code: string): Promise<Session> {
    const response = await api.get<Session>(`/sessions/invite/${code}`);
    return response.data;
  }

  async updateSessionStatus(
    sessionId: string,
    status: Session["status"]
  ): Promise<Session> {
    const response = await api.patch<Session>(`/sessions/${sessionId}/status`, {
      status,
    });
    return response.data;
  }

  async deleteSession(sessionId: string): Promise<void> {
    await api.delete(`/sessions/${sessionId}`);
  }
}

export const sessionService = new SessionService();
