"use client";

import axios from "axios";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { isTerminalRefreshError, refreshSession } from "@/services/auth.service";
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
  const hasBootstrappedAuth = useAuthStore((state) => state.hasBootstrappedAuth);
  const markAuthBootstrapped = useAuthStore((state) => state.markAuthBootstrapped);
  const pathname = usePathname();
  const hasInitializedRef = useRef(false);

  useEffect(() => {
    const isAuthPage = pathname === "/login" || pathname === "/register";

    if (
      hasInitializedRef.current ||
      isAuthenticated ||
      hasBootstrappedAuth ||
      isAuthPage
    ) {
      return;
    }

    hasInitializedRef.current = true;

    const redirectToLoginIfProtected = () => {
      if (typeof window === "undefined") {
        return;
      }

      const isProtectedRoute =
        pathname.startsWith("/affiliate") ||
        pathname.startsWith("/orders") ||
        pathname.startsWith("/profile") ||
        pathname.startsWith("/admin") ||
        pathname === "/checkout";

      if (isProtectedRoute) {
        window.location.assign("/login");
      }
    };

    const bootstrapAuth = async (attempt = 0): Promise<void> => {
      try {
        await refreshSession();
      } catch (error) {
        if (axios.isAxiosError<ApiErrorPayload>(error)) {
          if (isTerminalRefreshError(error)) {
            markAuthBootstrapped();
            redirectToLoginIfProtected();
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
      } finally {
        markAuthBootstrapped();
      }
    };

    void bootstrapAuth();
  }, [hasBootstrappedAuth, isAuthenticated, markAuthBootstrapped, pathname]);

  return null;
}
