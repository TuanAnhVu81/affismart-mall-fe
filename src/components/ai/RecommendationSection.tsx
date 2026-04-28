"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { ProductGrid } from "@/components/product/ProductGrid";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useHomepageRecommendations,
  useRelatedProductRecommendations,
} from "@/hooks/useRecommendations";
import { getProductsByIds } from "@/services/product.service";

type RecommendationSectionVariant = "homepage" | "related";

export interface RecommendationSectionProps {
  variant: RecommendationSectionVariant;
  productId?: number;
  title?: string;
  description?: string;
  limit?: number;
}

function RecommendationSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={`recommendation-skeleton-${index}`}
          className="rounded-xl border border-border/80 bg-background p-3"
        >
          <Skeleton className="aspect-square rounded-lg" />
          <div className="mt-4 space-y-2">
            <Skeleton className="h-3 w-24 rounded-full" />
            <Skeleton className="h-5 w-full rounded-full" />
            <Skeleton className="h-5 w-2/3 rounded-full" />
          </div>
          <Skeleton className="mt-5 h-10 rounded-lg" />
        </div>
      ))}
    </div>
  );
}

export function RecommendationSection({
  variant,
  productId,
  title,
  description,
  limit = 4,
}: RecommendationSectionProps) {
  const homepageQuery = useHomepageRecommendations(
    variant === "homepage" ? { limit } : {},
    { enabled: variant === "homepage" },
  );
  const relatedQuery = useRelatedProductRecommendations(
    variant === "related" ? productId : null,
    { limit },
    { enabled: variant === "related" },
  );

  const recommendationQuery = variant === "homepage" ? homepageQuery : relatedQuery;
  const visibleRecommendedIds = useMemo(
    () => {
      const recommendedIds = recommendationQuery.data?.productIds ?? [];

      return recommendedIds
        .filter((recommendedProductId) => recommendedProductId !== productId)
        .slice(0, limit);
    },
    [limit, productId, recommendationQuery.data?.productIds],
  );

  const productsQuery = useQuery({
    queryKey: ["products", "recommended", visibleRecommendedIds],
    queryFn: () => getProductsByIds(visibleRecommendedIds),
    enabled: visibleRecommendedIds.length > 0,
  });

  const isLoading = recommendationQuery.isLoading || productsQuery.isLoading;
  const products = productsQuery.data ?? [];

  if (recommendationQuery.isError || productsQuery.isError) {
    return null;
  }

  if (!isLoading && !products.length) {
    return null;
  }

  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">
            {title ?? (variant === "homepage" ? "Recommended for you" : "You may also like")}
          </h2>
          {description ? (
            <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
              {description}
            </p>
          ) : null}
        </div>
      </div>

      {isLoading ? (
        <RecommendationSkeleton />
      ) : (
        <ProductGrid
          products={products}
          emptyTitle="No recommendations yet"
          emptyDescription="Recommendations will appear once the catalog has enough signal."
        />
      )}
    </section>
  );
}
