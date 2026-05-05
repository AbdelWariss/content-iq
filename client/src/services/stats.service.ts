import api from "./axios";

export interface DashboardStats {
  totals: {
    contents: number;
    contentsThisMonth: number;
    favorites: number;
    tokensUsed: number;
    creditsConsumedThisMonth: number;
    activeUsers?: number;
  };
  credits: { remaining: number; total: number } | null;
  typeBreakdown: { type: string; count: number }[];
  dailyActivity: { date: string; count: number; tokens: number }[];
}

export const statsService = {
  async getDashboard(): Promise<DashboardStats> {
    const { data } = await api.get<{ success: boolean; data: DashboardStats }>("/stats");
    return data.data;
  },
};
