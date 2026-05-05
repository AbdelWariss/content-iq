import api from "./axios";

export interface AdminUser {
  _id: string;
  name: string;
  email: string;
  role: string;
  emailVerified: boolean;
  credits: { remaining: number; total: number };
  subscription: { status: string };
  createdAt: string;
  lastLoginAt?: string;
}

export interface AdminStats {
  users: { total: number; byRole: Record<string, number>; newThisWeek: number };
  contents: number;
  creditsConsumed: number;
}

interface UsersResponse {
  users: AdminUser[];
  pagination: { page: number; limit: number; total: number; pages: number };
}

export const adminService = {
  async getStats(): Promise<AdminStats> {
    const { data } = await api.get<{ success: boolean; data: AdminStats }>("/admin/stats");
    return data.data;
  },

  async listUsers(params: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
  }): Promise<UsersResponse> {
    const { data } = await api.get<{ success: boolean; data: UsersResponse }>("/admin/users", {
      params,
    });
    return data.data;
  },

  async updateRole(userId: string, role: string): Promise<void> {
    await api.put(`/admin/users/${userId}/role`, { role });
  },

  async banUser(userId: string): Promise<void> {
    await api.post(`/admin/users/${userId}/ban`);
  },
};
