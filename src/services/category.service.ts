import api from "@/services/api";
import axios from "axios";
import type { Category } from "@/types/product.types";

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

interface CategoryPayload {
  id: number;
  name: string;
  slug: string;
  active: boolean;
  createdAt?: string;
  created_at?: string;
  updatedAt?: string;
  updated_at?: string;
}

const unwrapData = <T>(payload: ApiResponse<T> | T, errorMessage: string): T => {
  const data =
    payload && typeof payload === "object" && "data" in payload
      ? payload.data
      : payload;

  if (data === undefined || data === null) {
    throw new Error(errorMessage);
  }

  return data as T;
};

const normalizeCategory = (category: CategoryPayload): Category => ({
  id: category.id,
  name: category.name,
  slug: category.slug,
  isActive: category.active,
  createdAt: category.createdAt ?? category.created_at,
  updatedAt: category.updatedAt ?? category.updated_at,
});

export const getActiveCategories = async () => {
  const { data } = await api.get<ApiResponse<CategoryPayload[]>>("/categories");
  const payload = unwrapData(data, "Invalid category list response payload.");

  return payload.map(normalizeCategory);
};

export const getCategoryBySlug = async (slug: string) => {
  try {
    const { data } = await api.get<ApiResponse<CategoryPayload>>(
      `/categories/${encodeURIComponent(slug)}`,
    );
    const payload = unwrapData(data, "Invalid category response payload.");

    return normalizeCategory(payload);
  } catch (error) {
    if (!axios.isAxiosError(error)) {
      throw error;
    }

    if (error.response?.status && ![400, 404].includes(error.response.status)) {
      throw error;
    }

    const categories = await getActiveCategories();
    const normalizedSlug = slug.trim().toLowerCase();
    const matched = categories.find(
      (category) => category.slug.toLowerCase() === normalizedSlug,
    );

    if (!matched) {
      throw error;
    }

    return matched;
  }
};
