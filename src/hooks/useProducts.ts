"use client";

import { useQuery } from "@tanstack/react-query";
import {
  getProductBySlug,
  getProducts,
  type GetProductsParams,
} from "@/services/product.service";

export const useProducts = (params: GetProductsParams = {}) =>
  useQuery({
    queryKey: ["products", params],
    queryFn: () => getProducts(params),
  });

export const useProductList = (params: GetProductsParams = {}) =>
  useProducts(params);

export const useProductDetail = (slug: string | null | undefined) =>
  useQuery({
    queryKey: ["product", slug],
    queryFn: () => getProductBySlug(slug as string),
    enabled: Boolean(slug),
  });

