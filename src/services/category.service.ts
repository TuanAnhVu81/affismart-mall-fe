import api from "@/services/api";
import type { Category } from "@/types/product.types";

type ApiEnvelope<T> = T | { data?: T };

const unwrapEnvelope = <T>(payload: ApiEnvelope<T>, errorMessage: string): T => {
  const data =
    payload && typeof payload === "object" && "data" in payload
      ? payload.data
      : payload;

  if (data === undefined || data === null) {
    throw new Error(errorMessage);
  }

  return data;
};

export const getActiveCategories = async () => {
  const { data } = await api.get<ApiEnvelope<Category[]>>("/categories");

  return unwrapEnvelope(data, "Invalid category list response payload.");
};

export const getCategoryBySlug = async (slug: string) => {
  const { data } = await api.get<ApiEnvelope<Category>>(
    `/categories/${encodeURIComponent(slug)}`,
  );

  return unwrapEnvelope(data, "Invalid category response payload.");
};

