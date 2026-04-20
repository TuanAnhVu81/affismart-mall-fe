export type AffiliateAccountStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "SUSPENDED";

export type CommissionStatus = "PENDING" | "APPROVED" | "PAID" | "REJECTED";

export type PayoutStatus =
  | "PENDING"
  | "APPROVED"
  | "TRANSFERRED"
  | "REJECTED";

export interface AffiliateAccount {
  id: number;
  userId: number;
  refCode: string;
  promotionChannel: string;
  status: AffiliateAccountStatus;
  commissionRate: number;
  balance: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface RegisterAffiliatePayload {
  promotionChannel: string;
  bankInfo: string;
}

export interface AffiliateDashboard {
  totalClicks: number;
  totalConversions: number;
  conversionRate: number;
  balance: number;
  totalCommissionEarned: number;
}

export interface ReferralLink {
  id: number;
  affiliateAccountId: number;
  productId: number | null;
  productName?: string | null;
  refCode: string;
  totalClicks: number;
  totalConversions: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AffiliateLinksQueryParams {
  active?: boolean;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: "asc" | "desc";
}

export interface CreateReferralLinkPayload {
  productId?: number | null;
}

export interface ToggleReferralLinkPayload {
  active: boolean;
}

export interface CommissionRecord {
  id: number;
  orderId?: number;
  orderTotalAmount?: number;
  orderStatus?: string;
  amount: number;
  rateSnapshot?: number;
  status: CommissionStatus;
  payoutRequestId?: number | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface CommissionQueryParams {
  status?: CommissionStatus;
  fromDate?: string;
  toDate?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: "asc" | "desc";
}

export interface PayoutRecord {
  id: number;
  amount: number;
  status: PayoutStatus;
  adminNote?: string | null;
  resolvedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface PayoutQueryParams {
  status?: PayoutStatus;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: "asc" | "desc";
}

export interface PaginatedResult<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}
