"use client";

import axios from "axios";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ProductForm } from "@/components/admin/ProductForm";
import { useAdminCategories, useCreateAdminProduct, useUploadAdminProductImage } from "@/hooks/useAdmin";

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

export default function NewAdminProductPage() {
  const router = useRouter();
  const { data: categoriesData } = useAdminCategories();
  const createProductMutation = useCreateAdminProduct();
  const uploadImageMutation = useUploadAdminProductImage();

  return (
    <ProductForm
      mode="create"
      categories={categoriesData?.items ?? []}
      isSubmitting={createProductMutation.isPending}
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
          await createProductMutation.mutateAsync(payload);
          toast.success("Product created successfully.");
          router.push("/admin/products");
        } catch (error) {
          toast.error(getErrorMessage(error, "Failed to create product."));
          throw error;
        }
      }}
    />
  );
}
