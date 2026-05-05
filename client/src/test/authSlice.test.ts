import { describe, it, expect } from "vitest";
import authReducer, {
  setCredentials,
  updateUser,
  updateCredits,
  logout,
  setLoading,
} from "@/store/authSlice";

const initialState = {
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: true,
};

const fakeUser = {
  id: "u1",
  name: "Alice",
  email: "alice@example.com",
  role: "free" as const,
  avatarUrl: undefined,
  credits: { remaining: 50, total: 50, resetDate: "" },
  language: "fr" as const,
};

describe("authSlice", () => {
  it("state initial correct", () => {
    expect(authReducer(undefined, { type: "@@INIT" })).toEqual(initialState);
  });

  describe("setCredentials", () => {
    it("hydrate user, token et isAuthenticated", () => {
      const state = authReducer(
        undefined,
        setCredentials({ user: fakeUser, accessToken: "tok123" }),
      );
      expect(state.user).toEqual(fakeUser);
      expect(state.accessToken).toBe("tok123");
      expect(state.isAuthenticated).toBe(true);
      expect(state.isLoading).toBe(false);
    });
  });

  describe("updateUser", () => {
    it("met à jour partiellement le user", () => {
      const withUser = authReducer(
        undefined,
        setCredentials({ user: fakeUser, accessToken: "tok" }),
      );
      const updated = authReducer(withUser, updateUser({ name: "Bob" }));
      expect(updated.user?.name).toBe("Bob");
      expect(updated.user?.email).toBe("alice@example.com");
    });
  });

  describe("updateCredits", () => {
    it("met à jour uniquement credits.remaining", () => {
      const withUser = authReducer(
        undefined,
        setCredentials({ user: fakeUser, accessToken: "tok" }),
      );
      const updated = authReducer(withUser, updateCredits({ remaining: 30 }));
      expect(updated.user?.credits.remaining).toBe(30);
      expect(updated.user?.credits.total).toBe(50);
    });
  });

  describe("logout", () => {
    it("réinitialise tout le state", () => {
      const withUser = authReducer(
        undefined,
        setCredentials({ user: fakeUser, accessToken: "tok" }),
      );
      const after = authReducer(withUser, logout());
      expect(after.user).toBeNull();
      expect(after.accessToken).toBeNull();
      expect(after.isAuthenticated).toBe(false);
      expect(after.isLoading).toBe(false);
    });
  });

  describe("setLoading", () => {
    it("change isLoading", () => {
      const s1 = authReducer(undefined, setLoading(false));
      expect(s1.isLoading).toBe(false);
      const s2 = authReducer(s1, setLoading(true));
      expect(s2.isLoading).toBe(true);
    });
  });
});
