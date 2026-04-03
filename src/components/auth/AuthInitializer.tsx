"use client";

import axios from "axios";
import { useEffect, useRef } from "react";
import { refreshToken } from "@/services/auth.service";
import { useAuthStore } from "@/store/auth.store";

export function AuthInitializer() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const hasInitializedRef = useRef(false);

  useEffect(() => {
    if (hasInitializedRef.current || isAuthenticated) {
      return;
    }

    hasInitializedRef.current = true;

    void refreshToken().catch((error: unknown) => {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        return;
      }

      if (process.env.NODE_ENV !== "production") {
        console.error("Auth bootstrap failed.", error);
      }
    });
  }, [isAuthenticated]);

  return null;
}
