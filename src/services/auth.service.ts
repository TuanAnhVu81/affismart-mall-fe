import axios from "axios";
import { useAuthStore } from "@/store/auth.store";
import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  UiRole,
  User,
  UserRole,
} from "@/types/auth.types";

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}

interface ApiErrorPayload {
  error_code?: string;
}

interface AuthUserPayload {
  id: number;
  email: string;
  full_name?: string;
  status?: string;
  roles?: string[];
}

interface AuthTokenPayload {
  access_token?: string;
  token_type?: string;
  expires_at?: string;
  user?: AuthUserPayload;
}

type AuthPayload = ApiResponse<AuthTokenPayload> | undefined;

const UI_ROLE_COOKIE = "ui_role";
const LOGIN_PATH = "/login";
const baseURL = process.env.NEXT_PUBLIC_API_URL;
const REFRESH_RETRY_DELAY_MS = 200;
const MAX_REFRESH_CONFLICT_RETRIES = 2;
const TERMINAL_REFRESH_ERROR_CODES = new Set([
  "INVALID_REFRESH_TOKEN",
  "REFRESH_TOKEN_REUSE_DETECTED",
  "UNAUTHORIZED",
]);

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

let refreshSessionPromise: Promise<AuthResponse> | null = null;

const sleep = (ms: number) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
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

const normalizeRole = (role: string): UserRole | null => {
  const normalizedRole = role.replace(/^ROLE_/, "").toUpperCase();

  if (normalizedRole === "ADMIN") {
    return "ADMIN";
  }

  if (normalizedRole === "AFFILIATE") {
    return "AFFILIATE";
  }

  if (normalizedRole === "CUSTOMER") {
    return "CUSTOMER";
  }

  return null;
};

const normalizeRoles = (roles: string[] | undefined): UserRole[] => {
  if (!roles?.length) {
    return ["CUSTOMER"];
  }

  const uniqueRoles = Array.from(
    new Set(roles.map(normalizeRole).filter((role): role is UserRole => Boolean(role))),
  );

  return uniqueRoles.length ? uniqueRoles : ["CUSTOMER"];
};

const buildFallbackFullName = (email: string) => {
  const [localPart = "User"] = email.split("@");
  const normalized = localPart.replace(/[._-]+/g, " ").trim();
  return normalized || "User";
};

const mapAuthUserToUser = (payload: AuthUserPayload): User => ({
  id: payload.id,
  email: payload.email,
  fullName: payload.full_name ?? buildFallbackFullName(payload.email),
  status: payload.status,
  roles: normalizeRoles(payload.roles),
});

export const extractAuthResponse = (payload: AuthPayload): AuthResponse => {
  const authData = payload?.data;
  const accessToken = authData?.access_token;
  const authUser = authData?.user;

  if (!accessToken || !authUser) {
    throw new Error("Invalid auth response payload.");
  }

  return {
    accessToken,
    user: mapAuthUserToUser(authUser),
  };
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

export const clearClientAuthState = () => {
  useAuthStore.getState().clearAuth();
  clearUiRoleCookie();
};

const sanitizeRegisterPayload = (payload: RegisterRequest) => ({
  full_name: payload.fullName,
  email: payload.email,
  password: payload.password,
  phone: payload.phone,
});

const redirectToLogin = () => {
  if (typeof window === "undefined") {
    return;
  }

  window.location.assign(LOGIN_PATH);
};

export const login = async (payload: LoginRequest) => {
  const { data } = await authClient.post<AuthPayload>("/auth/login", payload);
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
  const accessToken = useAuthStore.getState().accessToken;

  try {
    await authClient.post(
      "/auth/logout",
      {},
      {
        withCredentials: true,
        headers: accessToken
          ? {
              Authorization: `Bearer ${accessToken}`,
            }
          : undefined,
      },
    );
  } finally {
    clearClientAuthState();
    redirectToLogin();
  }
};

const getApiErrorCode = (error: unknown) => {
  if (!axios.isAxiosError<ApiErrorPayload>(error)) {
    return null;
  }

  return error.response?.data?.error_code ?? null;
};

const isRefreshConflict = (error: unknown) => {
  if (!axios.isAxiosError(error)) {
    return false;
  }

  return error.response?.status === 409;
};

export const isTerminalRefreshError = (error: unknown) => {
  if (!axios.isAxiosError<ApiErrorPayload>(error)) {
    return false;
  }

  if (error.response?.status !== 401) {
    return false;
  }

  const errorCode = getApiErrorCode(error);
  return !errorCode || TERMINAL_REFRESH_ERROR_CODES.has(errorCode);
};

const requestRefreshSession = async (attempt = 0): Promise<AuthResponse> => {
  try {
    const { data } = await authClient.post<AuthPayload>("/auth/refresh");
    const authResponse = extractAuthResponse(data);

    useAuthStore.getState().setAuth(authResponse.user, authResponse.accessToken);
    setUiRoleCookie(resolveUiRole(authResponse.user));

    return authResponse;
  } catch (error) {
    if (isRefreshConflict(error) && attempt < MAX_REFRESH_CONFLICT_RETRIES) {
      await sleep(REFRESH_RETRY_DELAY_MS);
      return requestRefreshSession(attempt + 1);
    }

    throw error;
  }
};

export const refreshSession = async (): Promise<AuthResponse> => {
  if (!refreshSessionPromise) {
    refreshSessionPromise = requestRefreshSession()
      .catch((error) => {
        if (isTerminalRefreshError(error)) {
          clearClientAuthState();
        }

        throw error;
      })
      .finally(() => {
        refreshSessionPromise = null;
      });
  }

  return refreshSessionPromise;
};

export const refreshToken = async () => {
  return refreshSession();
};
