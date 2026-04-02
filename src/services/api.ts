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

const baseURL = process.env.NEXT_PUBLIC_API_URL;

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

const refreshAccessToken = async () => {
  if (!refreshPromise) {
    refreshPromise = refreshClient
      .post("/auth/refresh")
      .then(({ data }) => {
        const authResponse = extractAuthResponse(data);

        useAuthStore
          .getState()
          .setAuth(authResponse.user, authResponse.accessToken);
        setUiRoleCookie(resolveUiRole(authResponse.user));

        return authResponse.accessToken;
      })
      .catch((error) => {
        useAuthStore.getState().clearAuth();
        clearUiRoleCookie();
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
      redirectToLogin();
      return Promise.reject(refreshError);
    }
  },
);

export default api;
