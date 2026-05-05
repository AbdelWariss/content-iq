import api from "./axios";
import type { GenerateContentInput } from "@contentiq/shared";

export interface ContentItem {
  _id: string;
  type: string;
  title: string;
  bodyPlain?: string;
  body?: string;
  prompt: {
    subject: string;
    tone: string;
    language: string;
    length: string;
    keywords?: string[];
  };
  tokensUsed: number;
  tags: string[];
  isFavorite: boolean;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface ContentListResponse {
  success: boolean;
  data: {
    items: ContentItem[];
    pagination: { page: number; limit: number; total: number; pages: number };
  };
}

export const contentService = {
  async list(params?: {
    page?: number;
    limit?: number;
    type?: string;
    favorite?: boolean;
    tag?: string;
  }): Promise<ContentListResponse> {
    const res = await api.get("/content", { params });
    return res.data;
  },

  async getById(id: string): Promise<{ success: boolean; data: { content: ContentItem } }> {
    const res = await api.get(`/content/${id}`);
    return res.data;
  },

  async update(id: string, data: { body?: string; tags?: string[] }) {
    const res = await api.put(`/content/${id}`, data);
    return res.data;
  },

  async delete(id: string) {
    const res = await api.delete(`/content/${id}`);
    return res.data;
  },

  async toggleFavorite(id: string) {
    const res = await api.patch(`/content/${id}/favorite`);
    return res.data;
  },

  async search(q: string, page = 1): Promise<ContentListResponse> {
    const res = await api.get<ContentListResponse>("/content/search", { params: { q, page } });
    return res.data;
  },

  getGenerateUrl(): string {
    return `${import.meta.env.VITE_API_URL ?? "/api"}/content/generate`;
  },
};
