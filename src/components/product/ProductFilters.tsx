"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronDown, Search, SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Category } from "@/types/product.types";

interface ProductFiltersProps {
  categories: Category[];
}

interface FilterSelectOption {
  value: string;
  label: string;
}

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

  const initialState = useMemo(() => {
    const parsedSearchParams = new URLSearchParams(searchParamsString);

    return {
      search: parsedSearchParams.get("search") ?? "",
      categoryId: parsedSearchParams.get("categoryId") ?? "all",
      minPrice: parsedSearchParams.get("minPrice") ?? "",
      maxPrice: parsedSearchParams.get("maxPrice") ?? "",
      sortBy: parsedSearchParams.get("sortBy") ?? "newest",
    };
  }, [searchParamsString]);

  const [searchInput, setSearchInput] = useState(initialState.search);
  const [search, setSearch] = useState(initialState.search);
  const [categoryId, setCategoryId] = useState(initialState.categoryId);
  const [minPrice, setMinPrice] = useState(initialState.minPrice);
  const [maxPrice, setMaxPrice] = useState(initialState.maxPrice);
  const [sortBy, setSortBy] = useState(initialState.sortBy);

  useEffect(() => {
    setSearchInput(initialState.search);
    setSearch(initialState.search);
    setCategoryId(initialState.categoryId);
    setMinPrice(initialState.minPrice);
    setMaxPrice(initialState.maxPrice);
    setSortBy(initialState.sortBy);
  }, [initialState]);

  useEffect(() => {
    const nextParams = new URLSearchParams(searchParamsString);

    if (search) {
      nextParams.set("search", search);
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
    maxPrice,
    minPrice,
    pathname,
    router,
    search,
    searchParamsString,
    sortBy,
  ]);

  const clearFilters = () => {
    setSearchInput("");
    setSearch("");
    setCategoryId("all");
    setMinPrice("");
    setMaxPrice("");
    setSortBy("newest");
  };

  const applySearch = () => {
    setSearch(searchInput.trim());
  };

  const categoryOptions = useMemo<FilterSelectOption[]>(
    () => [
      { value: "all", label: "All categories" },
      ...categories.map((category) => ({
        value: String(category.id),
        label: category.name,
      })),
    ],
    [categories],
  );

  const sortOptions: FilterSelectOption[] = [
    { value: "newest", label: "Newest first" },
    { value: "price_asc", label: "Price: Low to high" },
    { value: "price_desc", label: "Price: High to low" },
  ];
  const activeFilterCount = [
    Boolean(search),
    categoryId !== "all",
    Boolean(minPrice),
    Boolean(maxPrice),
    sortBy !== "newest",
  ].filter(Boolean).length;
  const isSearchChanged = searchInput.trim() !== search;

  return (
    <aside className="rounded-3xl border border-border bg-card/80 p-5 shadow-soft backdrop-blur">
      <div className="mb-5 flex items-start justify-between">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 text-sm font-semibold text-foreground">
            <SlidersHorizontal className="size-4 text-primary" />
            Product filters
          </div>
          <p className="text-xs text-muted-foreground">
            Refine products by category, price, and sorting.
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={clearFilters}
          className="h-8 rounded-full px-3 text-xs"
          disabled={activeFilterCount === 0}
        >
          <X className="size-3.5" />
          Reset
        </Button>
      </div>

      <div className="space-y-5">
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
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  applySearch();
                }
              }}
              placeholder="Search products..."
              className="h-11 rounded-xl border-border/80 bg-background pl-9 pr-20"
            />
            <Button
              type="button"
              size="sm"
              onClick={applySearch}
              disabled={!isSearchChanged}
              className="absolute right-1.5 top-1/2 h-8 -translate-y-1/2 rounded-lg px-3 text-xs"
            >
              Search
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
            Category
          </label>
          <div className="relative">
            <select
              value={categoryId}
              onChange={(event) => setCategoryId(event.target.value)}
              className="h-11 w-full appearance-none rounded-xl border border-input bg-background px-4 pr-10 text-base text-foreground outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm"
              aria-label="Category filter"
            >
              {categoryOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          </div>
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
              className="h-11 rounded-xl border-border/80 bg-background"
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
              className="h-11 rounded-xl border-border/80 bg-background"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
            Sort by
          </label>
          <div className="relative">
            <select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value)}
              className="h-11 w-full appearance-none rounded-xl border border-input bg-background px-4 pr-10 text-base text-foreground outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm"
              aria-label="Sort products"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          </div>
        </div>
      </div>

      <div className="mt-5 border-t border-border/70 pt-4">
        <p className="text-xs text-muted-foreground">
          {activeFilterCount === 0
            ? "No active filters"
            : `${activeFilterCount} active filter${
                activeFilterCount === 1 ? "" : "s"
              }`}
        </p>
      </div>
    </aside>
  );
}
