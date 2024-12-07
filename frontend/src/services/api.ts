import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5001/api";

export const api = axios.create({
  baseURL: API_URL,
});

let requestInterceptor: number | null = null;
let responseInterceptor: number | null = null;

// Public endpoints that don't require authentication
const publicEndpoints = ["/auth/login", "/auth/register", "/sessions/join"];

export const setupAxiosInterceptors = (getToken: () => string | null) => {
  // Remove existing interceptors
  if (requestInterceptor !== null) {
    api.interceptors.request.eject(requestInterceptor);
  }
  if (responseInterceptor !== null) {
    api.interceptors.response.eject(responseInterceptor);
  }

  // Add request interceptor
  requestInterceptor = api.interceptors.request.use(
    (config) => {
      const token = getToken();
      const isPublicEndpoint = publicEndpoints.some((endpoint) => {
        // Convert endpoint pattern to regex to handle dynamic segments
        const pattern = endpoint.replace(/:[^/]+/g, "[^/]+");
        const regex = new RegExp(`^${pattern}`);
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
      if (
        error.response?.status === 401 &&
        !error.config.url?.includes("/participants/")
      ) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
      }
      return Promise.reject(error);
    }
  );
};
