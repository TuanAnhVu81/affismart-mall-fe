"use client";

import axios from "axios";
import Link from "next/link";
import { useDeferredValue, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Boxes,
  Edit3,
  PackagePlus,
  Search,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import { DataTable, type DataTableColumn } from "@/components/admin/DataTable";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import {
  useAdminCategories,
  useAdminLowStockProducts,
  useAdminProducts,
  useUpdateAdminProductStatus,
} from "@/hooks/useAdmin";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Product } from "@/types/product.types";

interface ApiErrorResponse {
  message?: string;
}

const PRODUCT_PAGE_SIZE = 10;

type ProductStatusFilter = "ALL" | "ACTIVE" | "INACTIVE";

const STATUS_LABELS: Record<ProductStatusFilter, string> = {
  ALL: "All products",
  ACTIVE: "Active only",
  INACTIVE: "Inactive only",
};

const getErrorMessage = (error: unknown, fallback: string) => {
  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    return error.response?.data?.message ?? fallback;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
};

export default function AdminProductsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<ProductStatusFilter>("ALL");
  const [productToToggle, setProductToToggle] = useState<Product | null>(null);
  const deferredSearch = useDeferredValue(search);

  const { data: categoriesData } = useAdminCategories();
  const { data: lowStockData } = useAdminLowStockProducts();
  const productsQuery = useAdminProducts({
    page: page - 1,
    size: PRODUCT_PAGE_SIZE,
    search: deferredSearch.trim() || undefined,
    categoryId: categoryFilter === "all" ? undefined : Number(categoryFilter),
    active:
      statusFilter === "ALL"
        ? undefined
        : statusFilter === "ACTIVE",
    sortBy: "created_at",
    sortDir: "desc",
  });
  const updateStatusMutation = useUpdateAdminProductStatus();

  useEffect(() => {
    setPage(1);
  }, [deferredSearch, categoryFilter, statusFilter]);

  const categories = useMemo(() => categoriesData?.items ?? [], [categoriesData?.items]);
  const products = productsQuery.data?.content ?? [];
  const totalProducts = productsQuery.data?.totalElements ?? 0;
  const activeOnPage = products.filter((product) => product.isActive).length;
  const outOfStockOnPage = products.filter((product) => product.stockQuantity <= 0).length;
  const lowStockCount = lowStockData?.items.length ?? 0;

  const categoryNameById = useMemo(
    () => new Map(categories.map((category) => [category.id, category.name])),
    [categories],
  );

  const handleToggle = async () => {
    if (!productToToggle) {
      return;
    }

    try {
      await updateStatusMutation.mutateAsync({
        productId: productToToggle.id,
        payload: { active: !productToToggle.isActive },
      });
      toast.success(
        productToToggle.isActive
          ? "Product hidden from the active catalog."
          : "Product activated successfully.",
      );
      setProductToToggle(null);
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to update product status."));
    }
  };

  const columns: DataTableColumn<Product>[] = [
    {
      key: "product",
      header: "Product",
      cell: (product) => (
        <div className="space-y-1">
          <p className="max-w-[18rem] truncate font-semibold text-foreground" title={product.name}>
            {product.name}
          </p>
          <p className="text-xs text-muted-foreground">
            SKU: {product.sku || "No SKU"} • {product.slug}
          </p>
        </div>
      ),
      skeletonClassName: "max-w-[16rem]",
    },
    {
      key: "category",
      header: "Category",
      cell: (product) => (
        <Badge variant="outline" className="rounded-full px-3 py-1 text-xs">
          {categoryNameById.get(product.categoryId) || product.categoryName || "Uncategorized"}
        </Badge>
      ),
      skeletonClassName: "max-w-[8rem]",
    },
    {
      key: "price",
      header: "Price",
      cell: (product) => (
        <span className="font-semibold text-foreground">{formatCurrency(product.price)}</span>
      ),
      cellClassName: "w-[10rem]",
      skeletonClassName: "max-w-[6rem]",
    },
    {
      key: "stock",
      header: "Stock",
      cell: (product) => (
        <div className="space-y-1">
          <p className="font-semibold text-foreground">{product.stockQuantity}</p>
          <p className="text-xs text-muted-foreground">
            {product.stockQuantity <= 0
              ? "Out of stock"
              : product.stockQuantity < 10
                ? "Low stock"
                : "Healthy"}
          </p>
        </div>
      ),
      cellClassName: "w-[8rem]",
      skeletonClassName: "max-w-[4rem]",
    },
    {
      key: "status",
      header: "Status",
      cell: (product) => (
        <Badge
          variant="outline"
          className={
            product.isActive
              ? "rounded-full border-emerald-200 bg-emerald-50 px-3 py-1 text-emerald-700"
              : "rounded-full border-amber-200 bg-amber-50 px-3 py-1 text-amber-700"
          }
        >
          {product.isActive ? "Active" : "Inactive"}
        </Badge>
      ),
      cellClassName: "w-[9rem]",
      skeletonClassName: "max-w-[6rem]",
    },
    {
      key: "updatedAt",
      header: "Updated",
      cell: (product) => (
        <span className="text-sm text-muted-foreground">
          {product.updatedAt ? formatDate(product.updatedAt) : "Recently"}
        </span>
      ),
      cellClassName: "w-[8rem]",
      skeletonClassName: "max-w-[5rem]",
    },
    {
      key: "actions",
      header: "Actions",
      headerClassName: "text-right",
      cellClassName: "w-[14rem] text-right",
      cell: (product) => (
        <div className="flex justify-end gap-2">
          <Button
            render={<Link href={`/admin/products/${product.id}`} />}
            nativeButton={false}
            variant="outline"
            size="sm"
            className="rounded-full"
          >
            <Edit3 className="size-3.5" />
            Edit
          </Button>
          <Button
            type="button"
            variant={product.isActive ? "outline" : "default"}
            size="sm"
            className="rounded-full"
            onClick={() => setProductToToggle(product)}
          >
            {product.isActive ? "Deactivate" : "Activate"}
          </Button>
        </div>
      ),
      skeletonClassName: "ml-auto max-w-[9rem]",
    },
  ];

  return (
    <div className="space-y-6">
      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.5fr)_repeat(3,minmax(0,1fr))]">
        <div className="rounded-[28px] border border-border/80 bg-gradient-to-br from-primary/8 via-background to-indigo-50/40 px-5 py-6 shadow-soft sm:px-6">
          <Badge className="rounded-full bg-white/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">
            Catalog control
          </Badge>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-foreground">
            Product management
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Review catalog coverage, adjust visibility, and jump into product editing without losing the storefront context.
          </p>
        </div>

        <div className="rounded-[28px] border border-border/80 bg-background px-5 py-6 shadow-soft sm:px-6">
          <div className="flex items-center gap-3">
            <span className="flex size-11 items-center justify-center rounded-2xl bg-primary/8 text-primary">
              <Boxes className="size-5" />
            </span>
            <div>
              <p className="text-sm text-muted-foreground">Matching products</p>
              <p className="text-3xl font-semibold tracking-tight text-foreground">{totalProducts}</p>
            </div>
          </div>
        </div>

        <div className="rounded-[28px] border border-border/80 bg-background px-5 py-6 shadow-soft sm:px-6">
          <div className="flex items-center gap-3">
            <span className="flex size-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
              <ShieldCheck className="size-5" />
            </span>
            <div>
              <p className="text-sm text-muted-foreground">Active on this page</p>
              <p className="text-3xl font-semibold tracking-tight text-foreground">{activeOnPage}</p>
            </div>
          </div>
        </div>

        <div className="rounded-[28px] border border-border/80 bg-background px-5 py-6 shadow-soft sm:px-6">
          <div className="flex items-center gap-3">
            <span className="flex size-11 items-center justify-center rounded-2xl bg-amber-50 text-amber-700">
              <AlertTriangle className="size-5" />
            </span>
            <div>
              <p className="text-sm text-muted-foreground">Low-stock watchlist</p>
              <p className="text-3xl font-semibold tracking-tight text-foreground">{lowStockCount}</p>
            </div>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            {outOfStockOnPage} out-of-stock items on the current page.
          </p>
        </div>
      </section>

      <DataTable
        title="Catalog products"
        description="Search quickly, filter by category or visibility, and open a focused edit flow for each product."
        columns={columns}
        data={products}
        isLoading={productsQuery.isLoading}
        emptyTitle={productsQuery.error ? "Could not load products" : "No products found"}
        emptyDescription={
          productsQuery.error
            ? getErrorMessage(productsQuery.error, "Please try again in a moment.")
            : "Try changing filters or create a new product to start building the catalog."
        }
        pagination={{
          page: productsQuery.data?.page ?? 0,
          size: productsQuery.data?.size ?? PRODUCT_PAGE_SIZE,
          totalElements: productsQuery.data?.totalElements ?? 0,
          totalPages: productsQuery.data?.totalPages ?? 0,
          onPageChange: (nextPage) => setPage(nextPage + 1),
          itemLabel: "products",
          isDisabled: productsQuery.isFetching,
        }}
        toolbar={
          <>
            <div className="relative min-w-[16rem] flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by product name or keyword..."
                className="h-11 rounded-full pl-10"
              />
            </div>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="h-11 min-w-44 rounded-full bg-background">
                <span className="truncate text-left">
                  {categoryFilter === "all"
                    ? "All categories"
                    : categories.find((category) => String(category.id) === categoryFilter)?.name || "Category"}
                </span>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={String(category.id)}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as ProductStatusFilter)}>
              <SelectTrigger className="h-11 min-w-40 rounded-full bg-background">
                <span className="truncate text-left">{STATUS_LABELS[statusFilter]}</span>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All products</SelectItem>
                <SelectItem value="ACTIVE">Active only</SelectItem>
                <SelectItem value="INACTIVE">Inactive only</SelectItem>
              </SelectContent>
            </Select>

            <Button
              render={<Link href="/admin/products/new" />}
              nativeButton={false}
              className="rounded-full shadow-sm"
            >
              <PackagePlus className="size-4" />
              New product
            </Button>
          </>
        }
      />

      <ConfirmDialog
        open={Boolean(productToToggle)}
        onOpenChange={(open) => {
          if (!open) {
            setProductToToggle(null);
          }
        }}
        title={productToToggle?.isActive ? "Deactivate this product?" : "Activate this product?"}
        description={
          productToToggle?.isActive
            ? "Inactive products remain in admin records but should no longer appear in the active storefront catalog."
            : "Activating this product makes it eligible for the active storefront catalog again."
        }
        confirmText={productToToggle?.isActive ? "Deactivate" : "Activate"}
        isLoading={updateStatusMutation.isPending}
        onConfirm={handleToggle}
      />
    </div>
  );
}
