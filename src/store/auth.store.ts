import { create } from "zustand";
import { type User } from "@/types/auth.types";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User | null, accessToken: string) => void;
  clearAuth: () => void;
}

const initialState = {
  accessToken: null,
  user: null,
  isAuthenticated: false,
} as const;

export const useAuthStore = create<AuthState>((set) => ({
  ...initialState,
  setAuth: (user, accessToken) =>
    set({
      user,
      accessToken,
      isAuthenticated: true,
    }),
  clearAuth: () => set(initialState),
}));
