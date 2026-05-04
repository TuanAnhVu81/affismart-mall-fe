import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { LazyRecommendationSection } from "@/components/ai/LazyRecommendationSection";
import { FeaturedProductsSection } from "@/components/product/FeaturedProductsSection";
import { Button } from "@/components/ui/button";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Smart Commerce for Customers and Affiliates",
  description:
    "Explore featured products on AffiSmart Mall, where modern storefront shopping meets affiliate-powered growth.",
  path: "/",
});

export default function HomePage() {
  return (
    <div className="space-y-20 py-8 sm:py-16">
      <section className="relative overflow-hidden rounded-[2.5rem] border border-border bg-card/80 px-6 py-12 shadow-soft ring-1 ring-black/5 sm:px-12 sm:py-20 lg:p-24">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(79,70,229,0.24),_transparent_55%)]" />
        <div className="relative max-w-2xl space-y-6">
          <p className="inline-flex rounded-full border border-border bg-background/90 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
            AffiSmart Mall
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-5xl">
            Smart shopping experiences, powered by affiliate growth.
          </h1>
          <p className="text-base leading-7 text-muted-foreground sm:text-lg">
            Discover curated products, transparent pricing, and a storefront
            engineered for modern commerce teams.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button render={<Link href="/products" />} className="h-10 px-5">
              Browse products
              <ArrowRight className="size-4" />
            </Button>
            <Button
              render={<Link href="/register" />}
              variant="outline"
              className="h-10 px-5"
            >
              Create account
            </Button>
          </div>
        </div>
      </section>

      <FeaturedProductsSection />

      <LazyRecommendationSection
        variant="homepage"
        title="Picked for your next cart"
        description="A fresh set of product ideas based on current storefront signals."
        limit={4}
      />
    </div>
  );
}
