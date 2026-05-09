import api from "./axios";

export interface AdminUser {
  _id: string;
  name: string;
  email: string;
  role: "free" | "pro" | "business" | "admin";
  credits: { remaining: number; total: number };
  subscription: { status: string };
  createdAt: string;
  lastLoginAt?: string;
  emailVerified: boolean;
}

export interface AdminStats {
  users: { total: number; byRole: Record<string, number>; newThisWeek: number };
  contents: number;
  creditsConsumed: number;
}

export interface AppLogEntry {
  _id: string;
  level: "info" | "warn" | "error";
  category: "auth" | "generation" | "credits" | "system" | "admin";
  action: string;
  message: string;
  details?: Record<string, unknown>;
  userId?: string;
  userEmail?: string;
  ip?: string;
  createdAt: string;
}

export interface LogsParams {
  page?: number;
  limit?: number;
  level?: string;
  category?: string;
  from?: string;
  to?: string;
}

export const adminService = {
  async getStats(): Promise<AdminStats> {
    const res = await api.get("/admin/stats");
    return res.data.data as AdminStats;
  },

  async listUsers(params?: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
  }): Promise<{
    users: AdminUser[];
    pagination: { page: number; limit: number; total: number; pages: number };
  }> {
    const res = await api.get("/admin/users", { params });
    return res.data.data;
  },

  async updateRole(userId: string, role: string): Promise<void> {
    await api.put(`/admin/users/${userId}/role`, { role });
  },

  async banUser(userId: string): Promise<void> {
    await api.post(`/admin/users/${userId}/ban`);
  },

  async getLogs(params?: LogsParams) {
    const res = await api.get("/admin/logs", { params });
    return res.data as {
      success: boolean;
      data: {
        logs: AppLogEntry[];
        pagination: { page: number; limit: number; total: number; pages: number };
      };
    };
  },

  async clearLogs(before?: string) {
    const res = await api.delete("/admin/logs", { params: before ? { before } : undefined });
    return res.data as { success: boolean; data: { deleted: number } };
  },
};
