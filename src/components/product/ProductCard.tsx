"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { useCartStore } from "@/store/cart.store";
import type { Product } from "@/types/product.types";

interface ProductCardProps {
  product: Product;
}

const passthroughImageLoader = ({ src }: { src: string }) => src;

export function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem);
  const openDrawer = useCartStore((state) => state.openDrawer);
  const isOutOfStock = product.stockQuantity <= 0;
  const isInactive = !product.isActive;
  const categoryLabel = product.categoryName || "Uncategorized";
  const canAddToCart = !isOutOfStock && !isInactive;

  const handleAddToCart = () => {
    if (!canAddToCart) {
      return;
    }

    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrl,
      slug: product.slug,
      quantity: 1,
    });
    openDrawer();
    toast.success(`${product.name} added to cart.`);
  };

  return (
    <Card className="h-full border border-border/80 bg-background/95 py-0 shadow-soft transition-transform duration-200 hover:-translate-y-0.5">
      <Link
        href={`/products/${product.slug}`}
        className="block focus-visible:rounded-t-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <div className="relative aspect-square overflow-hidden rounded-t-xl border-b border-border/70 bg-muted/40">
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              loader={passthroughImageLoader}
              unoptimized
              className="object-cover transition-transform duration-300 hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />
          ) : (
            // Premium mesh gradient placeholder for products without an image
            <div className="relative flex h-full w-full flex-col items-center justify-center gap-2 overflow-hidden bg-muted/20">
              <div className="absolute -left-1/4 -top-1/4 h-full w-full rounded-full bg-violet-500/20 blur-3xl" />
              <div className="absolute -bottom-1/4 -right-1/4 h-full w-full rounded-full bg-indigo-500/20 blur-3xl" />
              <div className="absolute left-1/2 top-1/2 h-full w-full -translate-x-1/2 -translate-y-1/2 rounded-full bg-fuchsia-500/10 blur-3xl" />
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.25"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-muted-foreground/40"
                aria-hidden="true"
              >
                <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                <circle cx="9" cy="9" r="2" />
                <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
              </svg>
              <span className="text-xs text-muted-foreground/50">No image</span>
            </div>
          )}

          <div className="absolute left-3 top-3 flex gap-2">
            {isOutOfStock ? (
              <Badge variant="destructive">Out of stock</Badge>
            ) : null}
            {isInactive ? <Badge variant="outline">Inactive</Badge> : null}
          </div>
        </div>
      </Link>

      <CardContent className="space-y-2 px-4 pb-3 pt-4">
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
          {categoryLabel}
        </p>
        <Link
          href={`/products/${product.slug}`}
          className="line-clamp-2 text-base font-semibold leading-snug text-foreground transition-colors hover:text-primary"
        >
          {product.name}
        </Link>
        <div className="mt-1 flex items-center justify-between">
          <p className="text-[1.125rem] font-bold tracking-normal text-foreground">
            {formatCurrency(product.price)}
          </p>
        </div>
      </CardContent>

      <CardFooter className="mt-auto flex flex-col gap-2 border-t border-border/70 bg-muted/20 px-4 py-3">
        <Button
          type="button"
          className="w-full"
          onClick={handleAddToCart}
          disabled={!canAddToCart}
        >
          <ShoppingCart className="size-4" />
          Add to cart
        </Button>
        <Button
          render={<Link href={`/products/${product.slug}`} />}
          className="w-full"
          variant="outline"
          nativeButton={false}
        >
          View details
          <ArrowRight className="size-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}
