"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { setUiRoleCookie } from "@/services/auth.service";
import {
  createLink,
  createPayoutRequest,
  getMyAffiliateAccount,
  getMyCommissions,
  getMyDashboard,
  getMyLinks,
  getMyPayouts,
  registerAffiliate,
  toggleLink,
} from "@/services/affiliate.service";
import { useAuthStore } from "@/store/auth.store";
import type {
  AffiliateLinksQueryParams,
  CommissionQueryParams,
  CreateReferralLinkPayload,
  PayoutQueryParams,
  RegisterAffiliatePayload,
  ToggleReferralLinkPayload,
} from "@/types/affiliate.types";

const AFFILIATE_ACCOUNT_QUERY_KEY = ["affiliate-account"] as const;
const AFFILIATE_DASHBOARD_QUERY_KEY = ["affiliate-dashboard"] as const;
const AFFILIATE_LINKS_QUERY_KEY = ["affiliate-links"] as const;
const AFFILIATE_COMMISSIONS_QUERY_KEY = ["affiliate-commissions"] as const;
const AFFILIATE_PAYOUTS_QUERY_KEY = ["affiliate-payouts"] as const;

const useAffiliateQueryEnabled = () => {
  const accessToken = useAuthStore((state) => state.accessToken);
  return Boolean(accessToken);
};

export const useRegisterAffiliate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: RegisterAffiliatePayload) => registerAffiliate(payload),
    onSuccess: (affiliateAccount) => {
      useAuthStore.setState((state) => {
        if (!state.user) {
          return state;
        }

        return {
          ...state,
          user: {
            ...state.user,
            affiliateStatus: affiliateAccount.status,
          },
        };
      });

      if (affiliateAccount.status === "PENDING") {
        setUiRoleCookie("AFFILIATE_PENDING");
      }

      void queryClient.invalidateQueries({
        queryKey: AFFILIATE_ACCOUNT_QUERY_KEY,
      });
      void queryClient.invalidateQueries({
        queryKey: AFFILIATE_DASHBOARD_QUERY_KEY,
      });
    },
  });
};

export const useMyAffiliateAccount = () =>
  // Wait until an in-memory access token exists to avoid 401 -> refresh races.
  useQuery({
    queryKey: AFFILIATE_ACCOUNT_QUERY_KEY,
    queryFn: getMyAffiliateAccount,
    enabled: useAffiliateQueryEnabled(),
  });

export const useAffiliateDashboard = () =>
  useQuery({
    queryKey: AFFILIATE_DASHBOARD_QUERY_KEY,
    queryFn: getMyDashboard,
    enabled: useAffiliateQueryEnabled(),
    staleTime: 5 * 60 * 1_000, // Cache for 5 minutes
  });

export const useAffiliateLinks = (params: AffiliateLinksQueryParams = {}) =>
  useQuery({
    queryKey: [...AFFILIATE_LINKS_QUERY_KEY, params],
    queryFn: () => getMyLinks(params),
    enabled: useAffiliateQueryEnabled(),
  });

export const useCreateAffiliateLink = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateReferralLinkPayload) => createLink(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: AFFILIATE_LINKS_QUERY_KEY });
    },
  });
};

export const useToggleAffiliateLink = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      linkId,
      payload,
    }: {
      linkId: number;
      payload: ToggleReferralLinkPayload;
    }) => toggleLink(linkId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: AFFILIATE_LINKS_QUERY_KEY });
    },
  });
};

export const useAffiliateCommissions = (params: CommissionQueryParams = {}) =>
  useQuery({
    queryKey: [...AFFILIATE_COMMISSIONS_QUERY_KEY, params],
    queryFn: () => getMyCommissions(params),
    enabled: useAffiliateQueryEnabled(),
  });

export const useAffiliatePayouts = (params: PayoutQueryParams = {}) =>
  useQuery({
    queryKey: [...AFFILIATE_PAYOUTS_QUERY_KEY, params],
    queryFn: () => getMyPayouts(params),
    enabled: useAffiliateQueryEnabled(),
  });

export const useCreatePayoutRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createPayoutRequest,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: AFFILIATE_PAYOUTS_QUERY_KEY });
      void queryClient.invalidateQueries({
        queryKey: AFFILIATE_DASHBOARD_QUERY_KEY,
      });
    },
  });
};
