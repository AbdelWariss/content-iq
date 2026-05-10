import type { UserRole } from "@contentiq/shared";
import { type PayloadAction, createSlice } from "@reduxjs/toolkit";

interface UserState {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  emailVerified: boolean;
  credits: {
    remaining: number;
    total: number;
    resetDate: string;
  };
  language: "fr" | "en";
}

interface AuthState {
  user: UserState | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const initialState: AuthState = {
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: true,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials(state, action: PayloadAction<{ user: UserState; accessToken: string }>) {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.isAuthenticated = true;
      state.isLoading = false;
    },
    updateUser(state, action: PayloadAction<Partial<UserState>>) {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
    updateCredits(state, action: PayloadAction<{ remaining: number }>) {
      if (state.user) {
        state.user.credits.remaining = action.payload.remaining;
      }
    },
    logout(state) {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
      state.isLoading = false;
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },
  },
});

export const { setCredentials, updateUser, updateCredits, logout, setLoading } = authSlice.actions;
export default authSlice.reducer;
