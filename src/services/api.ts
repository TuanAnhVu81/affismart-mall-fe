import axios, {
  AxiosError,
  AxiosHeaders,
  InternalAxiosRequestConfig,
} from "axios";
import {
  clearUiRoleCookie,
  extractAuthResponse,
  resolveUiRole,
  setUiRoleCookie,
} from "@/services/auth.service";
import { useAuthStore } from "@/store/auth.store";

interface RetryableRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

interface ApiErrorPayload {
  errorCode?: string;
  error_code?: string;
}

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

const attachAuthorizationHeader = (
  config: InternalAxiosRequestConfig,
  accessToken: string,
) => {
  const headers = AxiosHeaders.from(config.headers);
  headers.set("Authorization", `Bearer ${accessToken}`);
  config.headers = headers;
};

const redirectToLogin = () => {
  if (typeof window === "undefined") {
    return;
  }

  if (window.location.pathname !== "/login") {
    window.location.assign("/login");
  }
};

const refreshClient = axios.create({
  baseURL,
  withCredentials: true,
});

let refreshPromise: Promise<string> | null = null;

const sleep = (ms: number) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });

const getApiErrorCode = (error: unknown) => {
  if (!axios.isAxiosError<ApiErrorPayload>(error)) {
    return null;
  }

  const payload = error.response?.data;
  return payload?.errorCode ?? payload?.error_code ?? null;
};

const isRefreshConflict = (error: unknown) => {
  if (!axios.isAxiosError(error)) {
    return false;
  }

  return error.response?.status === 409;
};

const isTerminalRefreshError = (error: unknown) => {
  if (!axios.isAxiosError(error)) {
    return true;
  }

  if (error.response?.status === 401) {
    const errorCode = getApiErrorCode(error);
    return !errorCode || TERMINAL_REFRESH_ERROR_CODES.has(errorCode);
  }

  return false;
};

const requestRefreshToken = async (attempt = 0): Promise<string> => {
  try {
    const { data } = await refreshClient.post("/auth/refresh");
    const authResponse = extractAuthResponse(data);

    useAuthStore.getState().setAuth(authResponse.user, authResponse.accessToken);
    setUiRoleCookie(resolveUiRole(authResponse.user));

    return authResponse.accessToken;
  } catch (error) {
    if (isRefreshConflict(error) && attempt < MAX_REFRESH_CONFLICT_RETRIES) {
      await sleep(REFRESH_RETRY_DELAY_MS);
      return requestRefreshToken(attempt + 1);
    }

    throw error;
  }
};

const refreshAccessToken = async () => {
  if (!refreshPromise) {
    refreshPromise = requestRefreshToken()
      .catch((error) => {
        if (isTerminalRefreshError(error)) {
          useAuthStore.getState().clearAuth();
          clearUiRoleCookie();
        }

        throw error;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
};

export const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const accessToken = useAuthStore.getState().accessToken;

  if (accessToken) {
    attachAuthorizationHeader(config, accessToken);
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryableRequestConfig | undefined;
    const status = error.response?.status;

    if (!originalRequest || status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      const newAccessToken = await refreshAccessToken();
      attachAuthorizationHeader(originalRequest, newAccessToken);

      return api(originalRequest);
    } catch (refreshError) {
      if (isTerminalRefreshError(refreshError)) {
        redirectToLogin();
      }

      return Promise.reject(refreshError);
    }
  },
);

export default api;
