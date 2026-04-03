import axios from "axios";
import { useAuthStore } from "@/store/auth.store";
import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  UiRole,
  User,
} from "@/types/auth.types";

type AuthResponseEnvelope =
  | AuthResponse
  | {
      data?: AuthResponse;
    }
  | undefined;

const UI_ROLE_COOKIE = "ui_role";
const LOGIN_PATH = "/login";
const baseURL = process.env.NEXT_PUBLIC_API_URL;

if (!baseURL) {
  throw new Error("NEXT_PUBLIC_API_URL is not configured.");
}

const authClient = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export const resolveUiRole = (user: User): UiRole => {
  if (user.roles.includes("ADMIN")) {
    return "ADMIN";
  }

  if (user.affiliateStatus === "PENDING") {
    return "AFFILIATE_PENDING";
  }

  if (user.roles.includes("AFFILIATE")) {
    return "AFFILIATE";
  }

  return "CUSTOMER";
};

export const setUiRoleCookie = (uiRole: UiRole) => {
  if (typeof document === "undefined") {
    return;
  }

  document.cookie = `${UI_ROLE_COOKIE}=${uiRole}; path=/; SameSite=Lax`;
};

export const clearUiRoleCookie = () => {
  if (typeof document === "undefined") {
    return;
  }

  document.cookie = `${UI_ROLE_COOKIE}=; Max-Age=0; path=/; SameSite=Lax`;
};

export const extractAuthResponse = (
  payload: AuthResponseEnvelope,
): AuthResponse => {
  const response = (
    payload && "data" in payload ? payload.data : payload
  ) as AuthResponse | undefined;

  if (!response?.accessToken || !response.user) {
    throw new Error("Invalid auth response payload.");
  }

  return response;
};

const sanitizeRegisterPayload = (payload: RegisterRequest) => ({
  full_name: payload.fullName,
  email: payload.email,
  password: payload.password,
});

const redirectToLogin = () => {
  if (typeof window === "undefined") {
    return;
  }

  window.location.assign(LOGIN_PATH);
};

export const login = async (payload: LoginRequest) => {
  const { data } = await authClient.post<AuthResponseEnvelope>("/auth/login", payload);
  const authResponse = extractAuthResponse(data);

  useAuthStore.getState().setAuth(authResponse.user, authResponse.accessToken);
  setUiRoleCookie(resolveUiRole(authResponse.user));

  return authResponse;
};

export const register = async (payload: RegisterRequest) => {
  const { data } = await authClient.post("/auth/register", sanitizeRegisterPayload(payload));

  return data;
};

export const logout = async () => {
  try {
    await authClient.post("/auth/logout");
  } finally {
    useAuthStore.getState().clearAuth();
    clearUiRoleCookie();
    redirectToLogin();
  }
};

export const refreshToken = async () => {
  const { data } = await authClient.post<AuthResponseEnvelope>("/auth/refresh");
  const authResponse = extractAuthResponse(data);

  useAuthStore.getState().setAuth(authResponse.user, authResponse.accessToken);
  setUiRoleCookie(resolveUiRole(authResponse.user));

  return authResponse;
};
