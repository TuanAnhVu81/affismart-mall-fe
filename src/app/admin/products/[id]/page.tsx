"use client";

import axios from "axios";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, ArrowLeft, Loader2, PackageSearch } from "lucide-react";
import { toast } from "sonner";
import { ProductForm } from "@/components/admin/ProductForm";
import { Button } from "@/components/ui/button";
import { useAdminCategories, useAdminProducts, useUpdateAdminProduct, useUploadAdminProductImage } from "@/hooks/useAdmin";
import type { Product, ProductListResponse } from "@/types/product.types";

interface ApiErrorResponse {
  message?: string;
}

const getErrorMessage = (error: unknown, fallback: string) => {
  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    return error.response?.data?.message ?? fallback;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
};

export default function AdminProductDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const productId = Number(params.id);
  const { data: categoriesData } = useAdminCategories();
  const updateProductMutation = useUpdateAdminProduct();
  const uploadImageMutation = useUploadAdminProductImage();

  const cachedProduct = useMemo(() => {
    const queryEntries = queryClient.getQueriesData<ProductListResponse>({
      queryKey: ["admin-products"],
    });

    for (const [, queryData] of queryEntries) {
      const product = queryData?.content.find((item) => item.id === productId);
      if (product) {
        return product;
      }
    }

    return null;
  }, [productId, queryClient]);

  const fallbackProductsQuery = useAdminProducts({
    page: 0,
    size: 100,
    sortBy: "created_at",
    sortDir: "desc",
  });

  const fallbackProduct = useMemo(
    () => fallbackProductsQuery.data?.content.find((item) => item.id === productId) ?? null,
    [fallbackProductsQuery.data?.content, productId],
  );

  const product: Product | null = cachedProduct ?? fallbackProduct;

  if (!Number.isInteger(productId) || productId <= 0) {
    return (
      <div className="rounded-[28px] border border-border/80 bg-background px-6 py-10 shadow-soft">
        <div className="flex flex-col items-start gap-4">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
            <AlertTriangle className="size-6" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              Invalid product identifier
            </h1>
            <p className="max-w-xl text-sm leading-6 text-muted-foreground">
              This product URL is not valid. Return to the products list and open the item from there.
            </p>
          </div>
          <Button render={<Link href="/admin/products" />} nativeButton={false} className="rounded-full">
            <ArrowLeft className="size-4" />
            Back to products
          </Button>
        </div>
      </div>
    );
  }

  if (!product && fallbackProductsQuery.isLoading) {
    return (
      <div className="flex min-h-[420px] items-center justify-center rounded-[28px] border border-border/80 bg-background shadow-soft">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="rounded-[28px] border border-border/80 bg-background px-6 py-10 shadow-soft">
        <div className="flex flex-col items-start gap-4">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-700">
            <PackageSearch className="size-6" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              Product details are not available yet
            </h1>
            <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
              The current backend still does not expose a dedicated admin product detail endpoint by id. Open this edit view from the products list after loading the relevant page, or add the backend detail API for a fully direct edit flow.
            </p>
          </div>
          <Button render={<Link href="/admin/products" />} nativeButton={false} className="rounded-full">
            <ArrowLeft className="size-4" />
            Back to products
          </Button>
        </div>
      </div>
    );
  }

  return (
    <ProductForm
      mode="edit"
      categories={categoriesData?.items ?? []}
      initialValues={{
        categoryId: product.categoryId,
        name: product.name,
        sku: product.sku ?? "",
        slug: product.slug,
        description: product.description ?? "",
        price: product.price,
        stockQuantity: product.stockQuantity,
        imageUrl: product.imageUrl ?? "",
        isActive: product.isActive,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
      }}
      isSubmitting={updateProductMutation.isPending}
      onCancel={() => router.push("/admin/products")}
      onUploadImage={async (file) => {
        try {
          return await uploadImageMutation.mutateAsync(file);
        } catch (error) {
          toast.error(getErrorMessage(error, "Failed to upload product image."));
          throw error;
        }
      }}
      onSubmit={async (payload) => {
        try {
          await updateProductMutation.mutateAsync({
            productId,
            payload,
          });
          toast.success("Product updated successfully.");
          router.push("/admin/products");
        } catch (error) {
          toast.error(getErrorMessage(error, "Failed to update product."));
          throw error;
        }
      }}
    />
  );
}
