import { PackageSearch } from "lucide-react";
import { ProductCard } from "@/components/product/ProductCard";
import type { Product } from "@/types/product.types";

interface ProductGridProps {
  products: Product[];
  emptyTitle?: string;
  emptyDescription?: string;
}

export function ProductGrid({
  products,
  emptyTitle = "No products found",
  emptyDescription = "Try changing your filters or search keyword.",
}: ProductGridProps) {
  if (!products.length) {
    return (
      <div className="flex flex-col items-center justify-center rounded-3xl border border-border/60 bg-muted/20 px-6 py-16 text-center shadow-soft ring-1 ring-border/30">
        <span className="mb-4 flex size-14 items-center justify-center rounded-full bg-background shadow-xs ring-1 ring-border/50">
          <PackageSearch className="size-6 text-muted-foreground" />
        </span>
        <p className="text-xl font-semibold tracking-tight text-foreground">{emptyTitle}</p>
        <p className="mt-2 text-sm text-muted-foreground">{emptyDescription}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

