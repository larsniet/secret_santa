import { api, setupAxiosInterceptors } from "./api";

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData extends LoginData {
  name: string;
  plan?: string;
}

export interface AuthResponse {
  access_token: string;
  user: {
    id: string;
    email: string;
    name: string;
    isEmailVerified: boolean;
  };
}

export interface VerificationResponse {
  message: string;
  access_token?: string;
  user?: {
    id: string;
    email: string;
    name: string;
    isEmailVerified: boolean;
  };
}

class AuthService {
  constructor() {
    const token = this.getToken();
    if (token) {
      setupAxiosInterceptors(() => token);
    }
  }

  async login(data: LoginData): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>("/auth/login", data);
    this.setToken(response.data.access_token);
    setupAxiosInterceptors(() => response.data.access_token);
    return response.data;
  }

  async register(
    data: RegisterData
  ): Promise<{ message: string; user: AuthResponse["user"] }> {
    const response = await api.post<{
      message: string;
      user: AuthResponse["user"];
    }>("/auth/register", data);
    return response.data;
  }

  async verifyEmail(token: string): Promise<VerificationResponse> {
    const response = await api.get<VerificationResponse>(
      `/auth/verify-email?token=${token}`
    );
    return response.data;
  }

  async resendVerification(email: string): Promise<{ message: string }> {
    const response = await api.post<{ message: string }>(
      "/auth/resend-verification",
      { email }
    );
    return response.data;
  }

  logout(): void {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setupAxiosInterceptors(() => null);
  }

  setToken(token: string): void {
    localStorage.setItem("token", token);
  }

  getToken(): string | null {
    const token = localStorage.getItem("token");
    return token;
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}

export const authService = new AuthService();
