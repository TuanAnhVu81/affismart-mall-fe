"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getMe, updateMe } from "@/services/user.service";
import { useAuthStore } from "@/store/auth.store";
import type { UpdateProfileRequest } from "@/types/auth.types";

const syncProfileToAuthStore = async () => {
  const profile = await getMe();
  const { accessToken: currentAccessToken, user: currentUser } =
    useAuthStore.getState();
  const user = {
    ...profile,
    affiliateStatus: profile.affiliateStatus ?? currentUser?.affiliateStatus,
  };

  if (currentAccessToken) {
    useAuthStore.getState().setAuth(user, currentAccessToken);
  }

  return user;
};

export const useMe = () => {
  const accessToken = useAuthStore((state) => state.accessToken);
  const hasBootstrappedAuth = useAuthStore((state) => state.hasBootstrappedAuth);

  return useQuery({
    queryKey: ["users", "me"],
    queryFn: syncProfileToAuthStore,
    enabled: Boolean(accessToken) && hasBootstrappedAuth,
    staleTime: 60_000,
  });
};

export const useUpdateMe = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateProfileRequest) => updateMe(payload),
    onSuccess: (profile) => {
      const { accessToken: currentAccessToken, user: currentUser } =
        useAuthStore.getState();
      const user = {
        ...profile,
        affiliateStatus: profile.affiliateStatus ?? currentUser?.affiliateStatus,
      };

      if (currentAccessToken) {
        useAuthStore.getState().setAuth(user, currentAccessToken);
      }

      queryClient.setQueryData(["users", "me"], user);
    },
  });
};
