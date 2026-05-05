import api from "./axios";

export interface AssistantMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  isVoice: boolean;
}

export interface AssistantSession {
  messages: AssistantMessage[];
  sessionId?: string;
}

export const assistantService = {
  getChatUrl(): string {
    return `${import.meta.env.VITE_API_URL ?? "/api"}/assistant/chat`;
  },

  async getSession(): Promise<AssistantSession> {
    const { data } = await api.get<{ success: boolean; data: AssistantSession }>("/assistant/session");
    return data.data;
  },

  async clearSession(): Promise<void> {
    await api.delete("/assistant/session");
  },
};
