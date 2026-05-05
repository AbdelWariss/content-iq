import api from "./axios";

export const stripeService = {
  async createCheckout(plan: "pro" | "business"): Promise<void> {
    const { data } = await api.post<{ success: boolean; data: { url: string } }>(
      "/stripe/checkout",
      { plan },
    );
    if (data.data.url) window.location.href = data.data.url;
  },

  async openPortal(): Promise<void> {
    const { data } = await api.post<{ success: boolean; data: { url: string } }>(
      "/stripe/portal",
    );
    if (data.data.url) window.location.href = data.data.url;
  },
};
