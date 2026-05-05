import axios from "axios";
import { store } from "@/store/index";
import { logout, setCredentials } from "@/store/authSlice";

// Routes d'auth qui NE doivent PAS déclencher un refresh silencieux
const AUTH_ROUTES = ["/auth/login", "/auth/register", "/auth/refresh", "/auth/forgot-password", "/auth/reset-password"];

const isAuthRoute = (url?: string) => AUTH_ROUTES.some((r) => url?.includes(r));

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "/api",
  timeout: 30000,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

// Attach access token on every request
api.interceptors.request.use((config) => {
  const token = store.getState().auth.accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Silent refresh on 401 — uniquement pour les routes protégées
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

function processQueue(error: unknown, token: string | null = null) {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token!);
  });
  failedQueue = [];
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Ne pas tenter de refresh sur les routes d'auth elles-mêmes
    if (isAuthRoute(originalRequest?.url)) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await axios.post(
          `${import.meta.env.VITE_API_URL ?? "/api"}/auth/refresh`,
          {},
          { withCredentials: true },
        );
        const { accessToken, user } = data.data;
        store.dispatch(setCredentials({ accessToken, user }));
        processQueue(null, accessToken);
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        store.dispatch(logout());
        window.location.href = "/login";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export default api;
