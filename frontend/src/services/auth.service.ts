import { api, setupAxiosInterceptors } from "./api";

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData extends LoginData {
  name: string;
}

export interface AuthResponse {
  access_token: string;
  user: {
    id: string;
    email: string;
    name: string;
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

  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>("/auth/register", data);
    this.setToken(response.data.access_token);
    setupAxiosInterceptors(() => response.data.access_token);
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
    return localStorage.getItem("token");
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}

export const authService = new AuthService();
