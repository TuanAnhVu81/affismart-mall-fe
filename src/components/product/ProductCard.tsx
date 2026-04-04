import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import type { Product } from "@/types/product.types";

interface ProductCardProps {
  product: Product;
}

const passthroughImageLoader = ({ src }: { src: string }) => src;

export function ProductCard({ product }: ProductCardProps) {
  const isOutOfStock = product.stockQuantity <= 0;
  const isInactive = !product.isActive;

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
            <div className="flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(79,70,229,0.16),_transparent_55%)] text-sm text-muted-foreground">
              No image available
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
          {product.category.name}
        </p>
        <Link
          href={`/products/${product.slug}`}
          className="line-clamp-2 text-base font-semibold leading-snug text-foreground transition-colors hover:text-primary"
        >
          {product.name}
        </Link>
        <p className="text-lg font-semibold text-foreground">
          {formatCurrency(product.price)}
        </p>
      </CardContent>

      <CardFooter className="mt-auto border-t border-border/70 bg-muted/20 px-4 py-3">
        <Button
          render={<Link href={`/products/${product.slug}`} />}
          className="w-full"
          variant="outline"
        >
          View details
          <ArrowRight className="size-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}

