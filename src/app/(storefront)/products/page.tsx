import type { Metadata } from "next";
import { ProductFilters } from "@/components/product/ProductFilters";
import { ProductGrid } from "@/components/product/ProductGrid";
import { getActiveCategories } from "@/services/category.service";
import { getProducts, type GetProductsParams } from "@/services/product.service";
import type { ProductListResponse } from "@/types/product.types";

export const metadata: Metadata = {
  title: "Product Catalog | AffiSmart Mall",
  description:
    "Browse the AffiSmart Mall product catalog with smart filtering by keyword, category, and price range.",
};

interface ProductsPageProps {
  searchParams?: Record<string, string | string[] | undefined>;
}

const readSingleParam = (value?: string | string[]) =>
  Array.isArray(value) ? value[0] : value;

const parseNumber = (value?: string) => {
  if (!value) {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const resolveSortBy = (value?: string) => {
  if (!value) {
    return undefined;
  }

  return ["newest", "price_asc", "price_desc"].includes(value)
    ? value
    : undefined;
};

const getCatalogData = async (params: GetProductsParams) => {
  const [productResult, categoryResult] = await Promise.allSettled([
    getProducts(params),
    getActiveCategories(),
  ]);

  const productList: ProductListResponse =
    productResult.status === "fulfilled"
      ? productResult.value
      : {
          content: [],
          page: 0,
          size: params.size ?? 12,
          totalElements: 0,
          totalPages: 0,
          last: true,
        };

  const categories =
    categoryResult.status === "fulfilled" ? categoryResult.value : [];

  return { categories, productList };
};

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const search = readSingleParam(searchParams?.search)?.trim();
  const categoryId = parseNumber(readSingleParam(searchParams?.categoryId));
  const minPrice = parseNumber(readSingleParam(searchParams?.minPrice));
  const maxPrice = parseNumber(readSingleParam(searchParams?.maxPrice));
  const page = parseNumber(readSingleParam(searchParams?.page));
  const size = parseNumber(readSingleParam(searchParams?.size)) ?? 12;
  const sortBy = resolveSortBy(readSingleParam(searchParams?.sortBy));
  const hasActiveFilters = Boolean(
    search || categoryId || minPrice !== undefined || maxPrice !== undefined || sortBy,
  );

  const params: GetProductsParams = {
    search: search || undefined,
    categoryId,
    minPrice,
    maxPrice,
    page,
    size,
    sortBy,
  };

  const { categories, productList } = await getCatalogData(params);

  return (
    <div className="space-y-6 py-8 sm:py-10">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          Product catalog
        </h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr] lg:items-start">
        <ProductFilters categories={categories} />
        <section className="space-y-4">
          <div className="flex items-center justify-between rounded-2xl border border-border/70 bg-card/60 px-4 py-2.5">
            <p className="text-sm text-muted-foreground">
              Showing{" "}
              <span className="font-semibold text-foreground">
                {productList.totalElements}
              </span>{" "}
              product{productList.totalElements === 1 ? "" : "s"}
            </p>
            {hasActiveFilters ? (
              <span className="rounded-full border border-border bg-background px-2.5 py-1 text-xs font-medium text-muted-foreground">
                Filtered view
              </span>
            ) : null}
          </div>
          <ProductGrid products={productList.content} />
        </section>
      </div>
    </div>
  );
}
