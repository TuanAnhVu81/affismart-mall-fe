"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";
import type { RecommendationSectionProps } from "@/components/ai/RecommendationSection";

const RecommendationSectionLoader = () => (
  <section className="space-y-5" aria-label="Loading recommendations">
    <div className="space-y-2">
      <Skeleton className="h-7 w-64 rounded-full" />
      <Skeleton className="h-4 w-full max-w-xl rounded-full" />
    </div>
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={`lazy-recommendation-${index}`}
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
  </section>
);

const DynamicRecommendationSection = dynamic<RecommendationSectionProps>(
  () =>
    import("@/components/ai/RecommendationSection").then(
      (module) => module.RecommendationSection,
    ),
  {
    loading: RecommendationSectionLoader,
    ssr: false,
  },
);

export function LazyRecommendationSection(props: RecommendationSectionProps) {
  return <DynamicRecommendationSection {...props} />;
}
