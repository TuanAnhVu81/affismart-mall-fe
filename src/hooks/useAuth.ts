"use client";

import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { login, logout, register, resolveUiRole } from "@/services/auth.service";
import { useAuthStore } from "@/store/auth.store";
import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  User,
} from "@/types/auth.types";

interface ApiErrorResponse {
  message?: string;
}

const getAuthErrorMessage = (error: unknown, fallbackMessage: string) => {
  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    return error.response?.data?.message ?? fallbackMessage;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallbackMessage;
};

const getPostLoginPath = (user: User) => {
  switch (resolveUiRole(user)) {
    case "ADMIN":
      return "/admin/dashboard";
    case "AFFILIATE":
      return "/affiliate/dashboard";
    case "AFFILIATE_PENDING":
      return "/affiliate/pending";
    case "CUSTOMER":
    default:
      return "/";
  }
};

export function useLogin() {
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation<AuthResponse, unknown, LoginRequest>({
    mutationFn: login,
    onSuccess: (data) => {
      setAuth(data.user, data.accessToken);
      toast.success("Signed in successfully.");
      const nextPath = getPostLoginPath(data.user);

      if (typeof window !== "undefined") {
        window.location.assign(nextPath);
        return;
      }
    },
    onError: (error) => {
      toast.error(
        getAuthErrorMessage(error, "Sign-in failed. Please try again."),
      );
    },
  });
}

export function useRegister() {
  const router = useRouter();

  return useMutation<unknown, unknown, RegisterRequest>({
    mutationFn: register,
    onSuccess: () => {
      toast.success("Registration completed successfully.");
      router.replace("/login");
    },
    onError: (error) => {
      toast.error(
        getAuthErrorMessage(error, "Registration failed. Please try again."),
      );
    },
  });
}

export function useLogout() {
  return useMutation({
    mutationFn: logout,
    onError: (error) => {
      toast.error(
        getAuthErrorMessage(error, "Sign-out failed. Please try again."),
      );
    },
  });
}
