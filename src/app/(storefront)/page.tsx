import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, PackageSearch } from "lucide-react";
import { LazyRecommendationSection } from "@/components/ai/LazyRecommendationSection";
import { ProductCard } from "@/components/product/ProductCard";
import { Button } from "@/components/ui/button";
import { buildPageMetadata } from "@/lib/seo";
import { getProducts } from "@/services/product.service";
import type { Product } from "@/types/product.types";

export const metadata: Metadata = buildPageMetadata({
  title: "Smart Commerce for Customers and Affiliates",
  description:
    "Explore featured products on AffiSmart Mall, where modern storefront shopping meets affiliate-powered growth.",
  path: "/",
});

const getFeaturedProducts = async (): Promise<Product[]> => {
  try {
    // Use "createdAt,desc" to match the backend JPA Pageable sort format
    const productList = await getProducts({
      page: 0,
      size: 8,
      sortBy: "createdAt,desc",
    });

    return productList.content;
  } catch {
    return [];
  }
};

export default async function HomePage() {
  const featuredProducts = await getFeaturedProducts();

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

      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">
            Featured products
          </h2>
          <Link
            href="/products"
            className="text-sm font-medium text-primary transition-colors hover:text-[var(--primary-hover)]"
          >
            View full catalog
          </Link>
        </div>

        {/* Constrain featured grid to 2 cols max so single cards don't stretch full-width */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {featuredProducts.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center rounded-3xl border border-border/60 bg-muted/20 px-6 py-16 text-center ring-1 ring-border/30">
              <span className="mb-4 flex size-14 items-center justify-center rounded-full bg-background shadow-xs ring-1 ring-border/50">
                <PackageSearch className="size-6 text-muted-foreground" />
              </span>
              <p className="text-xl font-semibold tracking-tight text-foreground">Catalog is getting ready</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Products will appear here once the backend catalog is populated.
              </p>
            </div>
          ) : (
            featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))
          )}
        </div>
      </section>

      <LazyRecommendationSection
        variant="homepage"
        title="Picked for your next cart"
        description="A fresh set of product ideas based on current storefront signals."
        limit={4}
      />
    </div>
  );
}
