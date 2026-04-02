import { create } from "zustand";

type UserRole = "CUSTOMER" | "AFFILIATE" | "ADMIN";

export interface AuthUser {
  id: number;
  email: string;
  fullName?: string;
  roles?: UserRole[];
}

interface AuthState {
  accessToken: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  setAccessToken: (accessToken: string | null) => void;
  setUser: (user: AuthUser | null) => void;
  setAuth: (payload: { accessToken: string; user?: AuthUser | null }) => void;
  clearAuth: () => void;
}

const initialState = {
  accessToken: null,
  user: null,
  isAuthenticated: false,
} as const;

export const useAuthStore = create<AuthState>((set) => ({
  ...initialState,
  setAccessToken: (accessToken) =>
    set({
      accessToken,
      isAuthenticated: Boolean(accessToken),
    }),
  setUser: (user) => set({ user }),
  setAuth: ({ accessToken, user = null }) =>
    set({
      accessToken,
      user,
      isAuthenticated: true,
    }),
  clearAuth: () => set(initialState),
}));
