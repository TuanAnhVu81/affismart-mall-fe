"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Category } from "@/types/product.types";

interface ProductFiltersProps {
  categories: Category[];
}

const SEARCH_DEBOUNCE_MS = 500;

const toPositiveNumberOrEmpty = (value: string) => {
  if (!value.trim()) {
    return "";
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? String(parsed) : "";
};

export function ProductFilters({ categories }: ProductFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchParamsString = searchParams.toString();

  const initialState = useMemo(
    () => ({
      search: searchParams.get("search") ?? "",
      categoryId: searchParams.get("categoryId") ?? "all",
      minPrice: searchParams.get("minPrice") ?? "",
      maxPrice: searchParams.get("maxPrice") ?? "",
      sortBy: searchParams.get("sortBy") ?? "newest",
    }),
    [searchParams],
  );

  const [search, setSearch] = useState(initialState.search);
  const [debouncedSearch, setDebouncedSearch] = useState(initialState.search);
  const [categoryId, setCategoryId] = useState(initialState.categoryId);
  const [minPrice, setMinPrice] = useState(initialState.minPrice);
  const [maxPrice, setMaxPrice] = useState(initialState.maxPrice);
  const [sortBy, setSortBy] = useState(initialState.sortBy);

  useEffect(() => {
    setSearch(initialState.search);
    setDebouncedSearch(initialState.search);
    setCategoryId(initialState.categoryId);
    setMinPrice(initialState.minPrice);
    setMaxPrice(initialState.maxPrice);
    setSortBy(initialState.sortBy);
  }, [initialState]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, SEARCH_DEBOUNCE_MS);

    return () => window.clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    const nextParams = new URLSearchParams(searchParamsString);

    if (debouncedSearch) {
      nextParams.set("search", debouncedSearch);
    } else {
      nextParams.delete("search");
    }

    if (categoryId !== "all") {
      nextParams.set("categoryId", categoryId);
    } else {
      nextParams.delete("categoryId");
    }

    if (minPrice) {
      nextParams.set("minPrice", minPrice);
    } else {
      nextParams.delete("minPrice");
    }

    if (maxPrice) {
      nextParams.set("maxPrice", maxPrice);
    } else {
      nextParams.delete("maxPrice");
    }

    if (sortBy !== "newest") {
      nextParams.set("sortBy", sortBy);
    } else {
      nextParams.delete("sortBy");
    }

    const nextQueryString = nextParams.toString();
    if (nextQueryString === searchParamsString) {
      return;
    }

    const nextHref = nextQueryString ? `${pathname}?${nextQueryString}` : pathname;
    router.replace(nextHref, { scroll: false });
  }, [
    categoryId,
    debouncedSearch,
    maxPrice,
    minPrice,
    pathname,
    router,
    searchParamsString,
    sortBy,
  ]);

  const clearFilters = () => {
    setSearch("");
    setCategoryId("all");
    setMinPrice("");
    setMaxPrice("");
    setSortBy("newest");
  };

  return (
    <aside className="rounded-2xl border border-border bg-card/80 p-4 shadow-soft backdrop-blur">
      <div className="mb-4 flex items-center justify-between">
        <div className="inline-flex items-center gap-2 text-sm font-semibold text-foreground">
          <SlidersHorizontal className="size-4 text-primary" />
          Product filters
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={clearFilters}
          className="h-8 px-2.5 text-xs"
        >
          <X className="size-3.5" />
          Reset
        </Button>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <label
            htmlFor="product-search"
            className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground"
          >
            Search
          </label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="product-search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search products..."
              className="pl-9"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
            Category
          </label>
          <Select value={categoryId} onValueChange={(val) => setCategoryId(val ?? "all")}>
            <SelectTrigger className="h-10 w-full" data-slot="select-trigger">
              <SelectValue placeholder="All categories" />
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
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label
              htmlFor="min-price"
              className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground"
            >
              Min price
            </label>
            <Input
              id="min-price"
              type="number"
              min={0}
              inputMode="numeric"
              value={minPrice}
              onChange={(event) =>
                setMinPrice(toPositiveNumberOrEmpty(event.target.value))
              }
              placeholder="0"
            />
          </div>
          <div className="space-y-2">
            <label
              htmlFor="max-price"
              className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground"
            >
              Max price
            </label>
            <Input
              id="max-price"
              type="number"
              min={0}
              inputMode="numeric"
              value={maxPrice}
              onChange={(event) =>
                setMaxPrice(toPositiveNumberOrEmpty(event.target.value))
              }
              placeholder="5000000"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
            Sort by
          </label>
          <Select value={sortBy} onValueChange={(val) => setSortBy(val ?? "createdAt,desc")}>
            <SelectTrigger className="h-10 w-full" data-slot="select-trigger">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="createdAt,desc">Newest first</SelectItem>
              <SelectItem value="price,asc">Price: Low to high</SelectItem>
              <SelectItem value="price,desc">Price: High to low</SelectItem>
              <SelectItem value="name,asc">Name: A to Z</SelectItem>
              <SelectItem value="name,desc">Name: Z to A</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </aside>
  );
}

