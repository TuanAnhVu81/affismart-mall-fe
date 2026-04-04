import api from "@/services/api";
import type { Product, ProductListResponse } from "@/types/product.types";

type ApiEnvelope<T> = T | { data?: T };

export interface GetProductsParams {
  search?: string;
  categoryId?: number;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  size?: number;
  sortBy?: string;
}

const sanitizeProductParams = (params: GetProductsParams) =>
  Object.fromEntries(
    Object.entries(params).filter(
      ([, value]) => value !== undefined && value !== null && value !== "",
    ),
  );

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

export const getProducts = async (params: GetProductsParams = {}) => {
  const { data } = await api.get<ApiEnvelope<ProductListResponse>>("/products", {
    params: sanitizeProductParams(params),
  });

  return unwrapEnvelope(data, "Invalid product list response payload.");
};

export const getProductBySlug = async (slug: string) => {
  const { data } = await api.get<ApiEnvelope<Product>>(
    `/products/${encodeURIComponent(slug)}`,
  );

  return unwrapEnvelope(data, "Invalid product response payload.");
};

