import { api } from "./api";
import { EventPlan } from "../types/plans";

export interface Session {
  _id: string;
  name: string;
  creator: string;
  participants: string[];
  inviteCode: string;
  status: "pending_payment" | "active" | "completed" | "archived";
  plan: EventPlan;
  createdAt: string;
  completedAt?: string;
  paymentId?: string;
}

class SessionService {
  async getMySessions(): Promise<Session[]> {
    const response = await api.get<Session[]>("/sessions/my");
    return response.data;
  }

  async createSession(data: {
    name: string;
    plan: EventPlan;
  }): Promise<Session> {
    const response = await api.post<Session>("/sessions", data);
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
    id: string,
    status: Session["status"]
  ): Promise<Session> {
    const response = await api.patch<Session>(`/sessions/${id}/status`, {
      status,
    });
    return response.data;
  }

  async createCheckoutSession(sessionId: string): Promise<{ id: string }> {
    const response = await api.post<{ id: string }>(
      `/sessions/${sessionId}/checkout`
    );
    return response.data;
  }

  async deleteSession(id: string): Promise<void> {
    await api.delete(`/sessions/${id}`);
  }
}

export const sessionService = new SessionService();
