import api from "@/services/api";
import { mapAuthUserToUser, type AuthUserPayload } from "@/services/auth.service";
import type { UpdateProfileRequest, User } from "@/types/auth.types";

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}

const extractUserPayload = (payload: ApiResponse<AuthUserPayload> | undefined) => {
  if (!payload?.data) {
    throw new Error("Invalid user profile response payload.");
  }

  return payload.data;
};

export const getMe = async (): Promise<User> => {
  const { data } = await api.get<ApiResponse<AuthUserPayload>>("/users/me");

  return mapAuthUserToUser(extractUserPayload(data));
};

export const updateMe = async (payload: UpdateProfileRequest): Promise<User> => {
  const { data } = await api.put<ApiResponse<AuthUserPayload>>("/users/me", {
    full_name: payload.fullName,
    phone: payload.phone?.trim() || "",
    default_shipping_address: payload.defaultShippingAddress?.trim() || "",
  });

  return mapAuthUserToUser(extractUserPayload(data));
};
