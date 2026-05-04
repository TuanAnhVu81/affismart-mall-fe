"use client";

import Link from "next/link";
import { PackageSearch } from "lucide-react";
import { ProductCard } from "@/components/product/ProductCard";
import { Skeleton } from "@/components/ui/skeleton";
import { useProducts } from "@/hooks/useProducts";

const FEATURED_PRODUCTS_LIMIT = 8;

function FeaturedProductsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="overflow-hidden rounded-3xl border border-border/70 bg-card shadow-soft"
        >
          <Skeleton className="aspect-square rounded-none" />
          <div className="space-y-3 p-5">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-5 w-4/5" />
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-10 w-full rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function FeaturedProductsSection() {
  const {
    data: productsData,
    isLoading,
    isError,
  } = useProducts({
    page: 0,
    size: FEATURED_PRODUCTS_LIMIT,
    sortBy: "createdAt,desc",
  });

  const featuredProducts = productsData?.content ?? [];

  return (
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

      {isLoading ? (
        <FeaturedProductsSkeleton />
      ) : featuredProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-border/60 bg-muted/20 px-6 py-16 text-center ring-1 ring-border/30">
          <span className="mb-4 flex size-14 items-center justify-center rounded-full bg-background shadow-xs ring-1 ring-border/50">
            <PackageSearch className="size-6 text-muted-foreground" />
          </span>
          <p className="text-xl font-semibold tracking-tight text-foreground">
            {isError ? "Catalog is waking up" : "Catalog is getting ready"}
          </p>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            {isError
              ? "The product API is taking longer than usual. Please refresh in a moment."
              : "Products will appear here once the backend catalog is populated."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
}
