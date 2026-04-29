export type UserRole = "CUSTOMER" | "AFFILIATE" | "ADMIN";

export type AffiliateStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "SUSPENDED";

export type UiRole = "ADMIN" | "CUSTOMER" | "AFFILIATE" | "AFFILIATE_PENDING";

export interface User {
  id: number;
  email: string;
  fullName: string;
  phone?: string | null;
  defaultShippingAddress?: string | null;
  roles: UserRole[];
  status?: string;
  affiliateStatus?: AffiliateStatus | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
  phone?: string;
  confirmPassword?: string;
}

export interface UpdateProfileRequest {
  fullName: string;
  phone?: string;
  defaultShippingAddress?: string;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}
