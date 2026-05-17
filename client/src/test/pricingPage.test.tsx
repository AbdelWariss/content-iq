import authReducer from "@/store/authSlice";
import { configureStore } from "@reduxjs/toolkit";
import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (k: string) => k }),
}));
vi.mock("@/services/stripe.service", () => ({
  stripeService: { createCheckout: vi.fn(), openPortal: vi.fn() },
}));
vi.mock("@/hooks/use-toast", () => ({ toast: vi.fn() }));

// mock useNavigate
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>("react-router-dom");
  return { ...actual, useNavigate: () => mockNavigate };
});

import PricingPage from "@/pages/Pricing/PricingPage";

function renderWithStore(user: object | null) {
  const store = configureStore({
    reducer: { auth: authReducer },
    preloadedState: {
      auth: {
        user: user as Parameters<typeof authReducer>[0]["user"],
        accessToken: user ? "tok" : null,
        isAuthenticated: !!user,
        isLoading: false,
      },
    },
  });
  return render(
    <Provider store={store}>
      <MemoryRouter>
        <PricingPage />
      </MemoryRouter>
    </Provider>,
  );
}

describe("PricingPage", () => {
  it("affiche le bouton Retour quand l'utilisateur est connecté", () => {
    renderWithStore({
      id: "1",
      name: "Test",
      email: "test@test.com",
      role: "free",
      emailVerified: true,
      credits: { total: 50, remaining: 50, resetDate: null },
      language: "fr",
    });
    expect(screen.getByRole("button", { name: /retour/i })).toBeInTheDocument();
  });

  it("masque le bouton Retour quand l'utilisateur n'est pas connecté", () => {
    renderWithStore(null);
    expect(screen.queryByRole("button", { name: /retour/i })).not.toBeInTheDocument();
  });
});
