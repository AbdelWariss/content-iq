import api from "./axios";
import type { RegisterInput, LoginInput } from "@contentiq/shared";

export interface AuthResponse {
  success: boolean;
  data: {
    accessToken: string;
    user: UserData;
    message?: string;
  };
}

export interface UserData {
  _id: string;
  name: string;
  email: string;
  role: "free" | "pro" | "business" | "admin";
  avatarUrl?: string;
  bio?: string;
  emailVerified: boolean;
  credits: { remaining: number; total: number; resetDate: string };
  language: "fr" | "en";
  voicePreferences: {
    ttsVoice: string;
    speed: number;
    autoTts: boolean;
    language: string;
  };
  subscription: { status: string; currentPeriodEnd?: string };
}

export const authService = {
  async register(data: RegisterInput): Promise<AuthResponse> {
    const res = await api.post<AuthResponse>("/auth/register", data);
    return res.data;
  },

  async login(data: LoginInput): Promise<AuthResponse> {
    const res = await api.post<AuthResponse>("/auth/login", data);
    return res.data;
  },

  async logout(): Promise<void> {
    await api.post("/auth/logout");
  },

  async refresh(): Promise<AuthResponse> {
    const res = await api.post<AuthResponse>("/auth/refresh");
    return res.data;
  },

  async getMe(): Promise<{ success: boolean; data: { user: UserData } }> {
    const res = await api.get("/auth/me");
    return res.data;
  },

  async forgotPassword(email: string): Promise<{ success: boolean; data: { message: string } }> {
    const res = await api.post("/auth/forgot-password", { email });
    return res.data;
  },

  async resetPassword(
    token: string,
    password: string,
  ): Promise<{ success: boolean; data: { message: string } }> {
    const res = await api.post("/auth/reset-password", { token, password });
    return res.data;
  },

  getGoogleAuthUrl(): string {
    return `${import.meta.env.VITE_API_URL ?? "/api"}/auth/google`;
  },
};
