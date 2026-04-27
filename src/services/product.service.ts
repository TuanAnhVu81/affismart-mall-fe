import axios from "axios";
import api from "@/services/api";
import type { Product, ProductListResponse } from "@/types/product.types";

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  total_elements: number;
  total_pages: number;
  last: boolean;
}

interface ProductPayload {
  id: number;
  category_id?: number;
  category_name?: string;
  name: string;
  sku?: string;
  slug: string;
  description?: string | null;
  price: number | string;
  stock_quantity?: number;
  image_url?: string | null;
  active: boolean;
  created_at?: string;
  updated_at?: string;
}

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
    [
      ["keyword", params.search],
      ["categoryId", params.categoryId],
      ["minPrice", params.minPrice],
      ["maxPrice", params.maxPrice],
      ["page", params.page],
      ["size", params.size],
      ["sortBy", params.sortBy],
    ].filter(([, value]) => value !== undefined && value !== null && value !== ""),
  );

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

const normalizeProduct = (product: ProductPayload): Product => ({
  id: product.id,
  categoryId: product.category_id ?? 0,
  categoryName: product.category_name ?? "Uncategorized",
  name: product.name,
  sku: product.sku,
  slug: product.slug,
  description: product.description ?? null,
  price: Number(product.price),
  stockQuantity: product.stock_quantity ?? 0,
  imageUrl: product.image_url ?? null,
  isActive: product.active,
  createdAt: product.created_at,
  updatedAt: product.updated_at,
});

const normalizeProductList = (
  response: PageResponse<ProductPayload>,
): ProductListResponse => ({
  content: response.content.map(normalizeProduct),
  page: response.page,
  size: response.size,
  totalElements: response.total_elements ?? 0,
  totalPages: response.total_pages ?? 0,
  last: response.last,
});

const findProductBySlugFromCatalog = async (slug: string) => {
  const normalizedSlug = slug.trim().toLowerCase();
  const pageSize = 100;
  const firstPage = await getProducts({
    page: 0,
    size: pageSize,
    sortBy: "newest",
  });
  const firstMatch = firstPage.content.find(
    (product) => product.slug.toLowerCase() === normalizedSlug,
  );
  if (firstMatch) {
    return firstMatch;
  }

  const pagesToScan = Math.min(firstPage.totalPages, 5);
  for (let page = 1; page < pagesToScan; page += 1) {
    const pagedResult = await getProducts({
      page,
      size: pageSize,
      sortBy: "newest",
    });
    const matched = pagedResult.content.find(
      (product) => product.slug.toLowerCase() === normalizedSlug,
    );
    if (matched) {
      return matched;
    }
  }

  return null;
};

export const getProducts = async (params: GetProductsParams = {}) => {
  const { data } = await api.get<ApiResponse<PageResponse<ProductPayload>>>(
    "/products",
    {
      params: sanitizeProductParams(params),
    },
  );
  const payload = unwrapData(data, "Invalid product list response payload.");

  return normalizeProductList(payload);
};

export const getProductBySlug = async (slug: string) => {
  try {
    const { data } = await api.get<ApiResponse<ProductPayload>>(
      `/products/${encodeURIComponent(slug)}`,
    );
    const payload = unwrapData(data, "Invalid product response payload.");

    return normalizeProduct(payload);
  } catch (error) {
    if (!axios.isAxiosError(error)) {
      throw error;
    }

    if (error.response?.status && ![400, 404].includes(error.response.status)) {
      throw error;
    }

    const matched = await findProductBySlugFromCatalog(slug);

    if (!matched) {
      throw error;
    }

    return matched;
  }
};

export const getProductsByIds = async (productIds: number[]) => {
  const uniqueProductIds = Array.from(new Set(productIds)).filter((id) => Number.isFinite(id));

  if (!uniqueProductIds.length) {
    return [];
  }

  const productById = new Map<number, Product>();
  const pageSize = Math.max(100, uniqueProductIds.length);
  const firstPage = await getProducts({
    page: 0,
    size: pageSize,
    sortBy: "createdAt,desc",
  });

  firstPage.content.forEach((product) => {
    if (uniqueProductIds.includes(product.id)) {
      productById.set(product.id, product);
    }
  });

  const pagesToScan = Math.min(firstPage.totalPages, 5);
  for (let page = 1; page < pagesToScan && productById.size < uniqueProductIds.length; page += 1) {
    const pagedResult = await getProducts({
      page,
      size: pageSize,
      sortBy: "createdAt,desc",
    });

    pagedResult.content.forEach((product) => {
      if (uniqueProductIds.includes(product.id)) {
        productById.set(product.id, product);
      }
    });
  }

  return uniqueProductIds
    .map((productId) => productById.get(productId))
    .filter((product): product is Product => Boolean(product));
};
