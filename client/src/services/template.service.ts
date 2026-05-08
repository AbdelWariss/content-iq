import type { ContentType, TemplateInput } from "@contentiq/shared";
import api from "./axios";

export interface Template {
  _id: string;
  name: string;
  description?: string;
  type: ContentType;
  category: "marketing" | "social" | "business" | "creative";
  promptSchema: string;
  variables: { key: string; label: string; required: boolean }[];
  isPublic: boolean;
  isPro: boolean;
  usageCount: number;
  userId?: string;
  createdAt: string;
}

export interface TemplateListResponse {
  data: Template[];
  pagination: { page: number; limit: number; total: number; pages: number };
}

export const templateService = {
  async list(params?: {
    page?: number;
    category?: string;
    type?: string;
  }): Promise<TemplateListResponse> {
    const { data } = await api.get<{ success: boolean } & TemplateListResponse>("/templates", {
      params,
    });
    return data;
  },

  async getById(id: string): Promise<Template> {
    const { data } = await api.get<{ success: boolean; data: Template }>(`/templates/${id}`);
    return data.data;
  },

  async create(payload: TemplateInput): Promise<Template> {
    const { data } = await api.post<{ success: boolean; data: Template }>("/templates", payload);
    return data.data;
  },

  async update(id: string, payload: Partial<TemplateInput>): Promise<Template> {
    const { data } = await api.put<{ success: boolean; data: Template }>(
      `/templates/${id}`,
      payload,
    );
    return data.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/templates/${id}`);
  },

  async use(id: string): Promise<Template> {
    const { data } = await api.post<{ success: boolean; data: Template }>(`/templates/${id}/use`);
    return data.data;
  },
};
