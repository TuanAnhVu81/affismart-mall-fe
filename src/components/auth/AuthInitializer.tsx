"use client";

import axios from "axios";
import { useEffect, useRef } from "react";
import { refreshToken } from "@/services/auth.service";
import { useAuthStore } from "@/store/auth.store";

interface ApiErrorPayload {
  error_code?: string;
}

const REFRESH_BOOTSTRAP_RETRY_DELAY_MS = 200;
const MAX_REFRESH_BOOTSTRAP_RETRIES = 2;

const sleep = (ms: number) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });

export function AuthInitializer() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const hasInitializedRef = useRef(false);

  useEffect(() => {
    if (hasInitializedRef.current || isAuthenticated) {
      return;
    }

    hasInitializedRef.current = true;

    const bootstrapAuth = async (attempt = 0): Promise<void> => {
      try {
        await refreshToken();
      } catch (error) {
        if (axios.isAxiosError<ApiErrorPayload>(error)) {
          if (error.response?.status === 401) {
            return;
          }

          if (
            error.response?.status === 409 &&
            attempt < MAX_REFRESH_BOOTSTRAP_RETRIES
          ) {
            await sleep(REFRESH_BOOTSTRAP_RETRY_DELAY_MS);
            return bootstrapAuth(attempt + 1);
          }
        }

        if (process.env.NODE_ENV !== "production") {
          console.error("Auth bootstrap failed.", error);
        }
      }
    };

    void bootstrapAuth();
  }, [isAuthenticated]);

  return null;
}
