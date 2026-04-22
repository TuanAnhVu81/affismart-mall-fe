import type {
  AffiliateAccountStatus,
  PayoutStatus,
  PaginatedResult,
} from "@/types/affiliate.types";
import type { UserRole } from "@/types/auth.types";
import type { OrderDetail, OrderStatus, OrderSummary } from "@/types/order.types";
import type { Category, Product } from "@/types/product.types";

export type UserStatus = "ACTIVE" | "INACTIVE" | "BANNED";

export interface AdminUserSummary {
  id: number;
  email: string;
  fullName: string;
  phone?: string | null;
  status: UserStatus;
  roles: UserRole[];
  createdAt?: string;
  updatedAt?: string;
}

export interface AdminUserProfile {
  id: number;
  email: string;
  fullName: string;
  phone?: string | null;
  defaultShippingAddress?: string | null;
  status: UserStatus;
  roles: UserRole[];
  createdAt?: string;
  updatedAt?: string;
}

export interface AdminAffiliateAccount {
  id: number;
  userId: number;
  fullName: string;
  email: string;
  bankInfo?: string | null;
  refCode: string;
  promotionChannel: string;
  status: AffiliateAccountStatus;
  commissionRate: number;
  balance: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface AdminPayoutRequest {
  id: number;
  affiliateAccountId: number;
  affiliateUserId: number;
  affiliateFullName: string;
  affiliateEmail: string;
  affiliateRefCode: string;
  bankInfo?: string | null;
  amount: number;
  status: PayoutStatus;
  adminNote?: string | null;
  resolvedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface BlockedIpEntry {
  ipAddress: string;
  reason: string;
  blockedAt?: string | null;
  expiresAt?: string | null;
}

export type AdminProductsResult = PaginatedResult<Product>;
export type AdminUsersResult = PaginatedResult<AdminUserSummary>;
export type AdminOrdersResult = PaginatedResult<OrderSummary>;
export type AdminAffiliateAccountsResult = PaginatedResult<AdminAffiliateAccount>;
export type AdminPayoutRequestsResult = PaginatedResult<AdminPayoutRequest>;

export interface AdminProductsQueryParams {
  search?: string;
  categoryId?: number;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: "asc" | "desc";
  active?: boolean;
}

export interface AdminUsersQueryParams {
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: "asc" | "desc";
}

export interface AdminOrdersQueryParams {
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: "asc" | "desc";
  status?: OrderStatus;
  fromDate?: string;
  toDate?: string;
}

export interface AdminAffiliateAccountsQueryParams {
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: "asc" | "desc";
  status?: AffiliateAccountStatus;
}

export interface AdminPayoutRequestsQueryParams {
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: "asc" | "desc";
  status?: PayoutStatus;
}

export interface UpsertCategoryPayload {
  name: string;
  slug?: string;
}

export interface UpdateCategoryStatusPayload {
  active: boolean;
}

export interface UpsertProductPayload {
  categoryId: number;
  name: string;
  sku: string;
  slug?: string;
  description?: string | null;
  price: number;
  stockQuantity: number;
  imageUrl?: string | null;
}

export interface UpdateProductStatusPayload {
  active: boolean;
}

export interface ProductImageUploadResult {
  secureUrl: string;
}

export interface UpdateUserStatusPayload {
  status: UserStatus;
}

export interface ResetUserPasswordPayload {
  newPassword: string;
}

export interface UpdateOrderStatusPayload {
  status: OrderStatus;
}

export interface UpdateAffiliateAccountStatusPayload {
  status: AffiliateAccountStatus;
}

export interface UpdateAffiliateCommissionRatePayload {
  commissionRate: number;
}

export interface UpdatePayoutRequestStatusPayload {
  status: PayoutStatus;
  adminNote?: string;
}

export interface AdminCategoryListResult {
  items: Category[];
}

export interface AdminLowStockProductsResult {
  items: Product[];
}

export type AdminOrderDetail = OrderDetail;
export interface AdminBlockedIpsResult {
  items: BlockedIpEntry[];
}
