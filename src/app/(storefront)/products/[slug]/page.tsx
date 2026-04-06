import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, PackageCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/utils";
import { getProductBySlug, getProducts } from "@/services/product.service";

interface ProductDetailPageProps {
  params: {
    slug: string;
  };
}

const passthroughImageLoader = ({ src }: { src: string }) => src;

export async function generateStaticParams() {
  try {
    const products = await getProducts({
      page: 0,
      size: 12,
      sortBy: "newest",
    });

    return products.content.map((product) => ({ slug: product.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: ProductDetailPageProps): Promise<Metadata> {
  try {
    const product = await getProductBySlug(params.slug);

    return {
      title: `${product.name} | AffiSmart Mall`,
      description:
        product.description?.slice(0, 160) ??
        `Explore ${product.name} on AffiSmart Mall.`,
    };
  } catch {
    return {
      title: "Product not found | AffiSmart Mall",
      description: "The requested product could not be found.",
    };
  }
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  let product;

  try {
    product = await getProductBySlug(params.slug);
  } catch {
    notFound();
  }

  const isOutOfStock = product.stockQuantity <= 0;
  const updatedAt = product.updatedAt ? formatDate(product.updatedAt) : null;

  return (
    <div className="space-y-8 py-8 sm:py-10">
      <Button
        render={<Link href="/products" />}
        variant="ghost"
        className="w-fit px-0 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to products
      </Button>

      <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12">
        <div className="relative aspect-square overflow-hidden rounded-3xl border border-border bg-muted/30 shadow-soft">
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              loader={passthroughImageLoader}
              unoptimized
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
              No image available
            </div>
          )}
        </div>

        <div className="space-y-5">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2">
              <Badge variant="outline">{product.categoryName}</Badge>
              {isOutOfStock ? (
                <Badge variant="destructive">Out of stock</Badge>
              ) : (
                <Badge variant="secondary">In stock</Badge>
              )}
            </div>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">
              {product.name}
            </h1>
            <p className="text-2xl font-semibold text-foreground">
              {formatCurrency(product.price)}
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card/70 p-4">
            <p className="text-sm leading-7 text-muted-foreground">
              {product.description?.trim()
                ? product.description
                : "Product description will be updated soon."}
            </p>
          </div>

          <div className="space-y-2 text-sm text-muted-foreground">
            <p className="inline-flex items-center gap-2">
              <PackageCheck className="size-4 text-primary" />
              Stock quantity: {product.stockQuantity}
            </p>
            {updatedAt ? <p>Last updated: {updatedAt}</p> : null}
          </div>

          <Button disabled={isOutOfStock} className="h-11 w-full sm:w-auto sm:px-8">
            {isOutOfStock ? "Unavailable" : "Add to cart"}
          </Button>
        </div>
      </div>
    </div>
  );
}

