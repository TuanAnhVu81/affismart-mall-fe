"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createAdminCategory,
  createAdminProduct,
  getAdminAffiliateAccounts,
  getAdminBlockedIps,
  getAdminCategories,
  getAdminCategoryDetail,
  getAdminLowStockProducts,
  getAdminOrderDetail,
  getAdminOrders,
  getAdminPayoutRequests,
  getAdminProductDetail,
  getAdminProducts,
  getAdminUserDetail,
  getAdminUsers,
  resetAdminUserPassword,
  updateAdminAffiliateAccountStatus,
  updateAdminAffiliateCommissionRate,
  updateAdminCategory,
  updateAdminCategoryStatus,
  updateAdminOrderStatus,
  updateAdminPayoutRequestStatus,
  updateAdminProduct,
  updateAdminProductStatus,
  updateAdminUserStatus,
  unblockAdminBlockedIp,
  uploadAdminProductImage,
} from "@/services/admin.service";
import { useAuthStore } from "@/store/auth.store";
import type {
  AdminAffiliateAccountsQueryParams,
  AdminOrdersQueryParams,
  AdminPayoutRequestsQueryParams,
  AdminProductsQueryParams,
  AdminUsersQueryParams,
  ResetUserPasswordPayload,
  UpdateAffiliateAccountStatusPayload,
  UpdateAffiliateCommissionRatePayload,
  UpdateCategoryStatusPayload,
  UpdateOrderStatusPayload,
  UpdatePayoutRequestStatusPayload,
  UpdateProductStatusPayload,
  UpdateUserStatusPayload,
  UpsertCategoryPayload,
  UpsertProductPayload,
} from "@/types/admin.types";

const ADMIN_CATEGORIES_QUERY_KEY = ["admin-categories"] as const;
const ADMIN_PRODUCTS_QUERY_KEY = ["admin-products"] as const;
const ADMIN_PRODUCT_DETAIL_QUERY_KEY = ["admin-product-detail"] as const;
const ADMIN_LOW_STOCK_PRODUCTS_QUERY_KEY = ["admin-low-stock-products"] as const;
const ADMIN_USERS_QUERY_KEY = ["admin-users"] as const;
const ADMIN_USER_DETAIL_QUERY_KEY = ["admin-user-detail"] as const;
const ADMIN_ORDERS_QUERY_KEY = ["admin-orders"] as const;
const ADMIN_ORDER_DETAIL_QUERY_KEY = ["admin-order-detail"] as const;
const ADMIN_AFFILIATE_ACCOUNTS_QUERY_KEY = ["admin-affiliate-accounts"] as const;
const ADMIN_PAYOUT_REQUESTS_QUERY_KEY = ["admin-payout-requests"] as const;
const ADMIN_BLOCKED_IPS_QUERY_KEY = ["admin-blocked-ips"] as const;

const useAdminQueryEnabled = () => {
  const accessToken = useAuthStore((state) => state.accessToken);
  return Boolean(accessToken);
};

export const useAdminCategories = () =>
  useQuery({
    queryKey: ADMIN_CATEGORIES_QUERY_KEY,
    queryFn: getAdminCategories,
    enabled: useAdminQueryEnabled(),
  });

export const useAdminCategoryDetail = (categoryId: number | null) =>
  useQuery({
    queryKey: [...ADMIN_CATEGORIES_QUERY_KEY, categoryId],
    queryFn: () => getAdminCategoryDetail(categoryId as number),
    enabled: useAdminQueryEnabled() && categoryId !== null,
  });

export const useCreateAdminCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpsertCategoryPayload) => createAdminCategory(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ADMIN_CATEGORIES_QUERY_KEY });
    },
  });
};

export const useUpdateAdminCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      categoryId,
      payload,
    }: {
      categoryId: number;
      payload: UpsertCategoryPayload;
    }) => updateAdminCategory(categoryId, payload),
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: ADMIN_CATEGORIES_QUERY_KEY });
      void queryClient.invalidateQueries({
        queryKey: [...ADMIN_CATEGORIES_QUERY_KEY, variables.categoryId],
      });
    },
  });
};

export const useUpdateAdminCategoryStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      categoryId,
      payload,
    }: {
      categoryId: number;
      payload: UpdateCategoryStatusPayload;
    }) => updateAdminCategoryStatus(categoryId, payload),
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: ADMIN_CATEGORIES_QUERY_KEY });
      void queryClient.invalidateQueries({
        queryKey: [...ADMIN_CATEGORIES_QUERY_KEY, variables.categoryId],
      });
    },
  });
};

export const useAdminProducts = (params: AdminProductsQueryParams = {}) =>
  useQuery({
    queryKey: [...ADMIN_PRODUCTS_QUERY_KEY, params],
    queryFn: () => getAdminProducts(params),
    enabled: useAdminQueryEnabled(),
  });

export const useAdminProductDetail = (productId: number | null) =>
  useQuery({
    queryKey: [...ADMIN_PRODUCT_DETAIL_QUERY_KEY, productId],
    queryFn: () => getAdminProductDetail(productId as number),
    enabled: useAdminQueryEnabled() && productId !== null,
  });

export const useCreateAdminProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpsertProductPayload) => createAdminProduct(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ADMIN_PRODUCTS_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: ADMIN_LOW_STOCK_PRODUCTS_QUERY_KEY });
    },
  });
};

export const useUpdateAdminProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      productId,
      payload,
    }: {
      productId: number;
      payload: UpsertProductPayload;
    }) => updateAdminProduct(productId, payload),
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: ADMIN_PRODUCTS_QUERY_KEY });
      void queryClient.invalidateQueries({
        queryKey: [...ADMIN_PRODUCT_DETAIL_QUERY_KEY, variables.productId],
      });
      void queryClient.invalidateQueries({ queryKey: ADMIN_LOW_STOCK_PRODUCTS_QUERY_KEY });
    },
  });
};

export const useUpdateAdminProductStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      productId,
      payload,
    }: {
      productId: number;
      payload: UpdateProductStatusPayload;
    }) => updateAdminProductStatus(productId, payload),
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: ADMIN_PRODUCTS_QUERY_KEY });
      void queryClient.invalidateQueries({
        queryKey: [...ADMIN_PRODUCT_DETAIL_QUERY_KEY, variables.productId],
      });
      void queryClient.invalidateQueries({ queryKey: ADMIN_LOW_STOCK_PRODUCTS_QUERY_KEY });
    },
  });
};

export const useUploadAdminProductImage = () =>
  useMutation({
    mutationFn: (file: File) => uploadAdminProductImage(file),
  });

export const useAdminLowStockProducts = () =>
  useQuery({
    queryKey: ADMIN_LOW_STOCK_PRODUCTS_QUERY_KEY,
    queryFn: getAdminLowStockProducts,
    enabled: useAdminQueryEnabled(),
  });

export const useAdminUsers = (params: AdminUsersQueryParams = {}) =>
  useQuery({
    queryKey: [...ADMIN_USERS_QUERY_KEY, params],
    queryFn: () => getAdminUsers(params),
    enabled: useAdminQueryEnabled(),
  });

export const useAdminUserDetail = (userId: number | null) =>
  useQuery({
    queryKey: [...ADMIN_USER_DETAIL_QUERY_KEY, userId],
    queryFn: () => getAdminUserDetail(userId as number),
    enabled: useAdminQueryEnabled() && userId !== null,
  });

export const useUpdateAdminUserStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      payload,
    }: {
      userId: number;
      payload: UpdateUserStatusPayload;
    }) => updateAdminUserStatus(userId, payload),
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: ADMIN_USERS_QUERY_KEY });
      void queryClient.invalidateQueries({
        queryKey: [...ADMIN_USER_DETAIL_QUERY_KEY, variables.userId],
      });
    },
  });
};

export const useResetAdminUserPassword = () =>
  useMutation({
    mutationFn: ({
      userId,
      payload,
    }: {
      userId: number;
      payload: ResetUserPasswordPayload;
    }) => resetAdminUserPassword(userId, payload),
  });

export const useAdminOrders = (params: AdminOrdersQueryParams = {}) =>
  useQuery({
    queryKey: [...ADMIN_ORDERS_QUERY_KEY, params],
    queryFn: () => getAdminOrders(params),
    enabled: useAdminQueryEnabled(),
  });

export const useAdminOrderDetail = (orderId: number | null) =>
  useQuery({
    queryKey: [...ADMIN_ORDER_DETAIL_QUERY_KEY, orderId],
    queryFn: () => getAdminOrderDetail(orderId as number),
    enabled: useAdminQueryEnabled() && orderId !== null,
  });

export const useUpdateAdminOrderStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      orderId,
      payload,
    }: {
      orderId: number;
      payload: UpdateOrderStatusPayload;
    }) => updateAdminOrderStatus(orderId, payload),
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: ADMIN_ORDERS_QUERY_KEY });
      void queryClient.invalidateQueries({
        queryKey: [...ADMIN_ORDER_DETAIL_QUERY_KEY, variables.orderId],
      });
    },
  });
};

export const useAdminAffiliateAccounts = (
  params: AdminAffiliateAccountsQueryParams = {},
) =>
  useQuery({
    queryKey: [...ADMIN_AFFILIATE_ACCOUNTS_QUERY_KEY, params],
    queryFn: () => getAdminAffiliateAccounts(params),
    enabled: useAdminQueryEnabled(),
  });

export const useUpdateAdminAffiliateAccountStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      accountId,
      payload,
    }: {
      accountId: number;
      payload: UpdateAffiliateAccountStatusPayload;
    }) => updateAdminAffiliateAccountStatus(accountId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ADMIN_AFFILIATE_ACCOUNTS_QUERY_KEY });
    },
  });
};

export const useUpdateAdminAffiliateCommissionRate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      accountId,
      payload,
    }: {
      accountId: number;
      payload: UpdateAffiliateCommissionRatePayload;
    }) => updateAdminAffiliateCommissionRate(accountId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ADMIN_AFFILIATE_ACCOUNTS_QUERY_KEY });
    },
  });
};

export const useAdminPayoutRequests = (
  params: AdminPayoutRequestsQueryParams = {},
) =>
  useQuery({
    queryKey: [...ADMIN_PAYOUT_REQUESTS_QUERY_KEY, params],
    queryFn: () => getAdminPayoutRequests(params),
    enabled: useAdminQueryEnabled(),
  });

export const useUpdateAdminPayoutRequestStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      payoutRequestId,
      payload,
    }: {
      payoutRequestId: number;
      payload: UpdatePayoutRequestStatusPayload;
    }) => updateAdminPayoutRequestStatus(payoutRequestId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ADMIN_PAYOUT_REQUESTS_QUERY_KEY });
    },
  });
};

export const useAdminBlockedIps = () =>
  useQuery({
    queryKey: ADMIN_BLOCKED_IPS_QUERY_KEY,
    queryFn: getAdminBlockedIps,
    enabled: useAdminQueryEnabled(),
  });

export const useUnblockAdminBlockedIp = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ipAddress: string) => unblockAdminBlockedIp(ipAddress),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ADMIN_BLOCKED_IPS_QUERY_KEY });
    },
  });
};
