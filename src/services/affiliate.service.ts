import axios from "axios";
import api from "@/services/api";
import type {
  AffiliateAccount,
  AffiliateDashboard,
  AffiliateLinksQueryParams,
  CommissionQueryParams,
  CommissionRecord,
  CreateReferralLinkPayload,
  PaginatedResult,
  PayoutQueryParams,
  PayoutRecord,
  ReferralLink,
  RegisterAffiliatePayload,
  ToggleReferralLinkPayload,
} from "@/types/affiliate.types";

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

interface PagePayload<T> {
  content: T[];
  page: number;
  size: number;
  total_elements: number;
  total_pages: number;
  last: boolean;
}

type CollectionPayload<T> = T[] | PagePayload<T>;

interface AffiliateAccountPayload {
  id: number;
  user_id: number;
  ref_code: string;
  promotion_channel: string;
  status: string;
  commission_rate: number | string;
  balance: number | string;
  created_at?: string;
  updated_at?: string;
}

interface AffiliateDashboardPayload {
  total_clicks?: number | string;
  clicks?: number | string;
  total_conversions?: number | string;
  conversions?: number | string;
  conversion_rate?: number | string;
  balance?: number | string;
  total_commission_earned?: number | string;
  commission_earned?: number | string;
}

interface ReferralLinkPayload {
  id: number;
  affiliate_account_id: number;
  product_id?: number | null;
  product_name?: string | null;
  ref_code: string;
  total_clicks: number | string;
  total_conversions: number | string;
  active: boolean;
  created_at?: string;
  updated_at?: string;
}

interface CommissionPayload {
  id: number;
  order_id?: number;
  order_total_amount?: number | string;
  order_status?: string;
  amount: number | string;
  rate_snapshot?: number | string;
  status: string;
  payout_request_id?: number | null;
  created_at?: string;
  updated_at?: string;
}

interface PayoutPayload {
  id: number;
  amount: number | string;
  status: string;
  admin_note?: string | null;
  resolved_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

const baseURL = process.env.NEXT_PUBLIC_API_URL;

if (!baseURL) {
  throw new Error("NEXT_PUBLIC_API_URL is not configured.");
}

const affiliateClient = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

const unwrapData = <T>(payload: ApiResponse<T> | T, errorMessage: string): T => {
  const data =
    payload && typeof payload === "object" && "data" in payload
      ? payload.data
      : payload;

  if (data === undefined || data === null) {
    throw new Error(errorMessage);
  }

  return data as T;
};

const toNumber = (value: number | string | undefined | null, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const toAffiliateAccount = (payload: AffiliateAccountPayload): AffiliateAccount => ({
  id: payload.id,
  userId: payload.user_id,
  refCode: payload.ref_code,
  promotionChannel: payload.promotion_channel,
  status: payload.status as AffiliateAccount["status"],
  commissionRate: toNumber(payload.commission_rate),
  balance: toNumber(payload.balance),
  createdAt: payload.created_at,
  updatedAt: payload.updated_at,
});

const toAffiliateDashboard = (
  payload: AffiliateDashboardPayload,
): AffiliateDashboard => ({
  totalClicks: toNumber(payload.total_clicks ?? payload.clicks),
  totalConversions: toNumber(payload.total_conversions ?? payload.conversions),
  conversionRate: toNumber(payload.conversion_rate),
  balance: toNumber(payload.balance),
  totalCommissionEarned: toNumber(
    payload.total_commission_earned ?? payload.commission_earned,
  ),
});

const toReferralLink = (payload: ReferralLinkPayload): ReferralLink => ({
  id: payload.id,
  affiliateAccountId: payload.affiliate_account_id,
  productId: payload.product_id ?? null,
  productName: payload.product_name ?? null,
  refCode: payload.ref_code,
  totalClicks: toNumber(payload.total_clicks),
  totalConversions: toNumber(payload.total_conversions),
  isActive: payload.active,
  createdAt: payload.created_at,
  updatedAt: payload.updated_at,
});

const toCommissionRecord = (payload: CommissionPayload): CommissionRecord => ({
  id: payload.id,
  orderId: payload.order_id,
  orderTotalAmount:
    payload.order_total_amount !== undefined
      ? toNumber(payload.order_total_amount)
      : undefined,
  orderStatus: payload.order_status,
  amount: toNumber(payload.amount),
  rateSnapshot: payload.rate_snapshot !== undefined ? toNumber(payload.rate_snapshot) : undefined,
  status: payload.status as CommissionRecord["status"],
  payoutRequestId: payload.payout_request_id ?? null,
  createdAt: payload.created_at,
  updatedAt: payload.updated_at,
});

const toPayoutRecord = (payload: PayoutPayload): PayoutRecord => ({
  id: payload.id,
  amount: toNumber(payload.amount),
  status: payload.status as PayoutRecord["status"],
  adminNote: payload.admin_note ?? null,
  resolvedAt: payload.resolved_at ?? null,
  createdAt: payload.created_at,
  updatedAt: payload.updated_at,
});

const toPaginatedResult = <T, U>(
  payload: CollectionPayload<T>,
  mapper: (item: T) => U,
): PaginatedResult<U> => {
  if (Array.isArray(payload)) {
    const content = payload.map(mapper);
    return {
      content,
      page: 0,
      size: content.length,
      totalElements: content.length,
      totalPages: content.length > 0 ? 1 : 0,
      last: true,
    };
  }

  return {
    content: payload.content.map(mapper),
    page: payload.page,
    size: payload.size,
    totalElements: payload.total_elements,
    totalPages: payload.total_pages,
    last: payload.last,
  };
};

const sanitizeListParams = (params: {
  status?: string;
  fromDate?: string;
  toDate?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: string;
  active?: boolean;
}) =>
  Object.fromEntries(
    [
      ["status", params.status],
      ["from_date", params.fromDate],
      ["to_date", params.toDate],
      ["page", params.page],
      ["size", params.size],
      ["sort_by", params.sortBy],
      ["sort_dir", params.sortDir],
      ["active", params.active],
    ].filter(([, value]) => value !== undefined && value !== null && value !== ""),
  );

export const registerAffiliate = async (payload: RegisterAffiliatePayload) => {
  const { data } = await api.post<ApiResponse<AffiliateAccountPayload>>(
    "/affiliate/register",
    {
      promotion_channel: payload.promotionChannel.trim(),
      bank_info: payload.bankInfo.trim(),
    },
  );
  const responsePayload = unwrapData(
    data,
    "Invalid affiliate registration response payload.",
  );

  return toAffiliateAccount(responsePayload);
};

export const getMyAffiliateAccount = async () => {
  const { data } = await api.get<ApiResponse<AffiliateAccountPayload>>(
    "/affiliate/me",
  );
  const responsePayload = unwrapData(
    data,
    "Invalid affiliate account response payload.",
  );

  return toAffiliateAccount(responsePayload);
};

export const getMyDashboard = async () => {
  const { data } = await api.get<ApiResponse<AffiliateDashboardPayload>>(
    "/affiliate/me/dashboard",
  );
  const responsePayload = unwrapData(
    data,
    "Invalid affiliate dashboard response payload.",
  );

  return toAffiliateDashboard(responsePayload);
};

export const getMyLinks = async (params: AffiliateLinksQueryParams = {}) => {
  const { data } = await api.get<
    ApiResponse<CollectionPayload<ReferralLinkPayload>>
  >("/affiliate/me/links", {
    params: sanitizeListParams(params),
  });
  const responsePayload = unwrapData(data, "Invalid affiliate links response payload.");

  return toPaginatedResult(responsePayload, toReferralLink);
};

export const createLink = async (payload: CreateReferralLinkPayload = {}) => {
  const requestBody =
    payload.productId === undefined
      ? {}
      : {
          product_id: payload.productId,
        };

  const { data } = await api.post<ApiResponse<ReferralLinkPayload>>(
    "/affiliate/me/links",
    requestBody,
  );
  const responsePayload = unwrapData(data, "Invalid create link response payload.");

  return toReferralLink(responsePayload);
};

export const toggleLink = async (
  linkId: number,
  payload: ToggleReferralLinkPayload,
) => {
  const { data } = await api.put<ApiResponse<ReferralLinkPayload>>(
    `/affiliate/me/links/${linkId}/status`,
    {
      active: payload.active,
    },
  );
  const responsePayload = unwrapData(data, "Invalid toggle link response payload.");

  return toReferralLink(responsePayload);
};

export const getMyCommissions = async (
  params: CommissionQueryParams = {},
) => {
  const { data } = await api.get<
    ApiResponse<CollectionPayload<CommissionPayload>>
  >("/affiliate/me/commissions", {
    params: sanitizeListParams(params),
  });
  const responsePayload = unwrapData(
    data,
    "Invalid affiliate commissions response payload.",
  );

  return toPaginatedResult(responsePayload, toCommissionRecord);
};

export const getMyPayouts = async (params: PayoutQueryParams = {}) => {
  const { data } = await api.get<ApiResponse<CollectionPayload<PayoutPayload>>>(
    "/affiliate/me/payouts",
    {
      params: sanitizeListParams(params),
    },
  );
  const responsePayload = unwrapData(
    data,
    "Invalid affiliate payouts response payload.",
  );

  return toPaginatedResult(responsePayload, toPayoutRecord);
};

export const createPayoutRequest = async () => {
  const { data } = await api.post<ApiResponse<PayoutPayload>>(
    "/affiliate/me/payouts",
    {},
  );
  const responsePayload = unwrapData(
    data,
    "Invalid create payout response payload.",
  );

  return toPayoutRecord(responsePayload);
};

export const trackAffiliateClick = (refCode: string) =>
  affiliateClient.post<ApiResponse<unknown>>("/affiliate/track-click", {
    ref_code: refCode,
  });
