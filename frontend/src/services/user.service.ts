import { api } from "./api";

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface Subscription {
  id: string;
  planName: string;
  status: "active" | "canceled" | "past_due";
  currentPeriodEnd?: string;
}

export interface ProfileUpdateData {
  name: string;
  email: string;
}

export interface PasswordUpdateData {
  currentPassword: string;
  newPassword: string;
}

class UserService {
  async getCurrentUser(): Promise<User> {
    const response = await api.get<User>("/users/me");
    return response.data;
  }

  async getCurrentSubscription(): Promise<Subscription | null> {
    try {
      const response = await api.get<Subscription>("/users/me/subscription");
      return response.data;
    } catch (err) {
      return null;
    }
  }

  async updateProfile(data: ProfileUpdateData): Promise<User> {
    const response = await api.patch<User>("/users/me", data);
    return response.data;
  }

  async updatePassword(data: PasswordUpdateData): Promise<void> {
    await api.patch("/users/me/password", data);
  }

  async createCheckoutSession(planName: string): Promise<{ id: string }> {
    const response = await api.post<{ id: string }>("/subscriptions/checkout", {
      planName,
    });
    return response.data;
  }

  async cancelSubscription(): Promise<void> {
    await api.post("/subscriptions/cancel");
  }

  async deleteAccount(): Promise<void> {
    await api.delete("/users/me");
  }
}

export const userService = new UserService();
