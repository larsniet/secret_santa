import { api } from "./api";

export interface Session {
  _id: string;
  name: string;
  creator: string;
  participants: string[];
  inviteCode: string;
  status: "open" | "locked" | "completed";
  budget: number;
  registrationDeadline: string;
  giftExchangeDate: string;
  timezone: string;
  createdAt: string;
  completedAt?: string;
}

export interface CreateSessionDto {
  name: string;
  budget: number;
  registrationDeadline: string;
  giftExchangeDate: string;
  timezone: string;
}

export interface UpdateSessionDto {
  name?: string;
  budget?: number;
  registrationDeadline?: string;
  giftExchangeDate?: string;
  timezone?: string;
}

class SessionService {
  async getMySessions(): Promise<Session[]> {
    const response = await api.get<Session[]>("/sessions/my");
    return response.data;
  }

  async createSession(data: CreateSessionDto): Promise<Session> {
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

  async updateSession(id: string, data: UpdateSessionDto): Promise<Session> {
    const response = await api.patch<Session>(`/sessions/${id}`, data);
    return response.data;
  }

  async deleteSession(id: string): Promise<void> {
    console.log("Deleting session:", id);
    try {
      await api.delete(`/sessions/${id}`);
      console.log("Session deleted successfully");
    } catch (error) {
      console.error("Error deleting session:", error);
      throw error;
    }
  }
}

export const sessionService = new SessionService();
