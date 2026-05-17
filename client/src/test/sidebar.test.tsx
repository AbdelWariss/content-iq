import { Sidebar } from "@/components/Layout/Sidebar";
import authReducer from "@/store/authSlice";
import { configureStore } from "@reduxjs/toolkit";
import { fireEvent, render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

// jsdom in this env may not have working localStorage — provide a mock
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();
Object.defineProperty(globalThis, "localStorage", { value: localStorageMock, writable: true });

// Mock useAuth
vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({ logout: vi.fn() }),
}));

// Mock i18next
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: "fr" },
  }),
}));

function makeStore(
  user = {
    id: "u1",
    name: "Test User",
    email: "test@example.com",
    credits: { total: 500, remaining: 250, resetDate: "" },
    role: "free" as const,
    emailVerified: true,
    language: "fr" as const,
  },
) {
  return configureStore({
    reducer: { auth: authReducer },
    preloadedState: { auth: { user, accessToken: "tok", isAuthenticated: true, isLoading: false } },
  });
}

function renderSidebar(props = {}) {
  const store = makeStore();
  return render(
    <Provider store={store}>
      <MemoryRouter>
        <Sidebar {...props} />
      </MemoryRouter>
    </Provider>,
  );
}

describe("Sidebar", () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  it("affiche le bouton logout", () => {
    renderSidebar();
    expect(screen.getByTitle("sidebar.collapse")).toBeInTheDocument();
  });

  it("se replie au clic sur le toggle et persiste dans localStorage", () => {
    renderSidebar();
    const toggle = screen.getByTitle("sidebar.collapse");
    fireEvent.click(toggle);
    expect(localStorage.getItem("ciq-sidebar-collapsed")).toBe("true");
  });

  it("se déplie si localStorage contient 'true' et le toggle est cliqué", () => {
    localStorage.setItem("ciq-sidebar-collapsed", "true");
    renderSidebar();
    const toggle = screen.getByTitle("sidebar.expand");
    fireEvent.click(toggle);
    expect(localStorage.getItem("ciq-sidebar-collapsed")).toBe("false");
  });

  it("affiche le bouton Se déconnecter", () => {
    renderSidebar();
    expect(screen.getByText("sidebar.logout")).toBeInTheDocument();
  });
});
