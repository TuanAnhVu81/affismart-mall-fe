"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import {
  getHomepageRecommendations,
  getRelatedProducts,
  trackRecommendationEvent,
} from "@/services/ai.service";
import type {
  HomepageRecommendationsParams,
  RelatedRecommendationsParams,
  TrackRecommendationEventPayload,
} from "@/types/ai.types";

export const useHomepageRecommendations = (
  params: HomepageRecommendationsParams = {},
) =>
  useQuery({
    queryKey: ["ai", "recommendations", "homepage", params],
    queryFn: () => getHomepageRecommendations(params),
  });

export const useRelatedProductRecommendations = (
  productId: number | null | undefined,
  params: RelatedRecommendationsParams = {},
) =>
  useQuery({
    queryKey: ["ai", "recommendations", "related", productId, params],
    queryFn: () => getRelatedProducts(productId as number, params),
    enabled: Boolean(productId),
  });

export const useTrackRecommendationEvent = () =>
  useMutation({
    mutationFn: (payload: TrackRecommendationEventPayload) =>
      trackRecommendationEvent(payload),
  });
