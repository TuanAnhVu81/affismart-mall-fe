import { create } from "zustand";
import { type User } from "@/types/auth.types";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  hasBootstrappedAuth: boolean;
  setAuth: (user: User | null, accessToken: string) => void;
  clearAuth: () => void;
  markAuthBootstrapped: () => void;
}

const initialState = {
  accessToken: null,
  user: null,
  isAuthenticated: false,
  hasBootstrappedAuth: false,
} as const;

export const useAuthStore = create<AuthState>((set) => ({
  ...initialState,
  setAuth: (user, accessToken) =>
    set({
      user,
      accessToken,
      isAuthenticated: true,
      hasBootstrappedAuth: true,
    }),
  clearAuth: () =>
    set({
      ...initialState,
      hasBootstrappedAuth: true,
    }),
  markAuthBootstrapped: () =>
    set((state) => ({
      ...state,
      hasBootstrappedAuth: true,
    })),
}));
