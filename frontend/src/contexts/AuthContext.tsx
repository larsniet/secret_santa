import React, { createContext, useContext, useState, useEffect } from "react";
import { authService, AuthResponse } from "../services/auth.service";
import { setupAxiosInterceptors } from "../services/api";

interface AuthContextType {
  isAuthenticated: boolean;
  user: AuthResponse["user"] | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<AuthResponse["user"] | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const setupAuth = (token: string, userData: AuthResponse["user"]) => {
    setIsAuthenticated(true);
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
    setupAxiosInterceptors(() => token);
  };

  useEffect(() => {
    const initializeAuth = () => {
      const token = authService.getToken();
      const storedUser = localStorage.getItem("user");

      if (token && storedUser) {
        const userData = JSON.parse(storedUser);
        setupAuth(token, userData);
      }
      setIsInitialized(true);
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const response = await authService.login({ email, password });
    setupAuth(response.access_token, response.user);
  };

  const register = async (name: string, email: string, password: string) => {
    const response = await authService.register({ name, email, password });
    setupAuth(response.access_token, response.user);
  };

  const logout = () => {
    authService.logout();
    setIsAuthenticated(false);
    setUser(null);
    setupAxiosInterceptors(() => null);
  };

  if (!isInitialized) {
    return <div>Loading...</div>;
  }

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, user, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
