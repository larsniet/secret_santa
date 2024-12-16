import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5001/api";

export const api = axios.create({
  baseURL: API_URL,
});

let requestInterceptor: number | null = null;
let responseInterceptor: number | null = null;

export const setupAxiosInterceptors = (getToken: () => string | null) => {
  if (requestInterceptor !== null) {
    api.interceptors.request.eject(requestInterceptor);
  }
  if (responseInterceptor !== null) {
    api.interceptors.response.eject(responseInterceptor);
  }

  const publicEndpoints = [
    "/auth/login",
    "/auth/register",
    "/sessions/join",
    "/sessions/:sessionId/participants/:participantId",
    "/sessions/:sessionId/participants/:participantId/preferences",
  ];

  // Add request interceptor
  requestInterceptor = api.interceptors.request.use(
    (config) => {
      const token = getToken();
      const isPublicEndpoint = publicEndpoints.some((endpoint) => {
        const pattern = endpoint.replace(/:[^/]+/g, "[^/]+");
        const regex = new RegExp(`^${pattern}$`);
        return regex.test(config.url || "");
      });

      if (token && !isPublicEndpoint) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Add response interceptor
  responseInterceptor = api.interceptors.response.use(
    (response) => response,
    (error) => {
      const isPublicEndpoint = publicEndpoints.some((endpoint) => {
        const pattern = endpoint.replace(/:[^/]+/g, "[^/]+");
        const regex = new RegExp(`^${pattern}$`);
        return regex.test(error.config.url || "");
      });

      if (error.response?.status === 401 && !isPublicEndpoint) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
      }
      return Promise.reject(error);
    }
  );
};
