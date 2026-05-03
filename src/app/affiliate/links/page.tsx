"use client";

import {
  AlertCircle,
  Check,
  ChevronDown,
  Copy,
  Link as LinkIcon,
  Loader2,
  PackageSearch,
  Plus,
  Search,
  Store,
} from "lucide-react";
import Link from "next/link";
import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { AffiliatePagination } from "@/components/affiliate/AffiliatePagination";
import { ReferralLinkStatusBadge } from "@/components/affiliate/AffiliateStatusBadge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAffiliateLinks, useCreateAffiliateLink, useToggleAffiliateLink } from "@/hooks/useAffiliate";
import { useProducts } from "@/hooks/useProducts";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth.store";
import type { Product } from "@/types/product.types";

const LINK_PAGE_SIZE = 10;

type LinkStatusFilter = "ALL" | "ACTIVE" | "INACTIVE";

const LINK_FILTER_LABELS: Record<LinkStatusFilter, string> = {
  ALL: "All links",
  ACTIVE: "Active only",
  INACTIVE: "Inactive only",
};

function CreateLinkDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [productId, setProductId] = useState<string>("store");
  const [selectedProductLabel, setSelectedProductLabel] = useState("Whole store");
  const [productSearch, setProductSearch] = useState("");
  const [isProductPickerOpen, setIsProductPickerOpen] = useState(false);
  const productPickerRef = useRef<HTMLDivElement | null>(null);
  const deferredProductSearch = useDeferredValue(productSearch.trim());
  const createLinkMutation = useCreateAffiliateLink();
  const { data: productsData, isLoading: isLoadingProducts, isFetching: isFetchingProducts } = useProducts({
    search: deferredProductSearch || undefined,
    size: 20,
    sortBy: "newest",
  });

  const products = productsData?.content ?? [];
  const selectedProduct = products.find((product) => product.id.toString() === productId);
  const currentProductLabel =
    productId === "store"
      ? "Whole store"
      : selectedProduct?.name ?? selectedProductLabel;
  const isSearchingProducts = isLoadingProducts || isFetchingProducts;

  useEffect(() => {
    if (!open) {
      setIsProductPickerOpen(false);
      setProductSearch("");
    }
  }, [open]);

  useEffect(() => {
    if (!isProductPickerOpen) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (
        productPickerRef.current
        && !productPickerRef.current.contains(event.target as Node)
      ) {
        setIsProductPickerOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [isProductPickerOpen]);

  const selectWholeStore = () => {
    setProductId("store");
    setSelectedProductLabel("Whole store");
    setProductSearch("");
    setIsProductPickerOpen(false);
  };

  const selectProduct = (product: Product) => {
    setProductId(product.id.toString());
    setSelectedProductLabel(product.name);
    setProductSearch("");
    setIsProductPickerOpen(false);
  };

  const handleCreate = async () => {
    try {
      await createLinkMutation.mutateAsync({
        productId: productId === "store" ? null : Number(productId),
      });
      toast.success("Affiliate link created successfully.");
      onOpenChange(false);
      setProductId("store");
      setSelectedProductLabel("Whole store");
      setProductSearch("");
      setIsProductPickerOpen(false);
    } catch {
      toast.error("Failed to create affiliate link. Please try again.");
    }
  };

  const isPending = createLinkMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={isPending ? undefined : onOpenChange}>
      <DialogContent
        className="flex max-h-[calc(100vh-2rem)] max-w-md flex-col overflow-hidden p-0 sm:max-w-lg"
        showCloseButton={!isPending}
      >
        <DialogHeader className="shrink-0 border-b border-border/70 px-6 py-5">
          <DialogTitle className="inline-flex items-center gap-2 text-lg">
            <LinkIcon className="size-4 text-primary" />
            Create new referral link
          </DialogTitle>
          <DialogDescription>
            Generate a targeted link for a specific product or use a storefront-wide link.
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-6 py-5">
          <div className="rounded-2xl border border-border/70 bg-muted/20 px-4 py-3 text-sm leading-6 text-muted-foreground">
            Pick a product when you want a deep link to a specific detail page. Choose the whole store option when you want a broader campaign entry point.
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Target product</label>
            <div ref={productPickerRef} className="relative">
              <Button
                type="button"
                variant="outline"
                aria-haspopup="listbox"
                aria-expanded={isProductPickerOpen}
                aria-label="Choose referral link target product"
                disabled={isPending}
                className="h-11 w-full justify-between rounded-xl px-3 text-left font-normal"
                onClick={() => setIsProductPickerOpen((current) => !current)}
              >
                <span className="flex min-w-0 items-center gap-2">
                  {productId === "store" ? (
                    <Store className="size-4 shrink-0 text-primary" />
                  ) : (
                    <PackageSearch className="size-4 shrink-0 text-muted-foreground" />
                  )}
                  <span className="truncate">{currentProductLabel}</span>
                </span>
                <ChevronDown
                  className={cn(
                    "size-4 shrink-0 text-muted-foreground transition-transform",
                    isProductPickerOpen ? "rotate-180" : "",
                  )}
                />
              </Button>

              {isProductPickerOpen ? (
                <div className="mt-2 overflow-hidden rounded-2xl border border-border/80 bg-popover text-popover-foreground shadow-[0_18px_48px_rgba(15,23,42,0.16)] ring-1 ring-foreground/5">
                  <div className="border-b border-border/70 p-3">
                    <div className="flex h-10 items-center gap-2 rounded-xl border border-input bg-background px-3 focus-within:border-primary/70 focus-within:ring-3 focus-within:ring-primary/10">
                      <Search className="size-4 shrink-0 text-muted-foreground" />
                      <input
                        value={productSearch}
                        type="search"
                        autoFocus
                        placeholder="Search by product name..."
                        aria-label="Search products"
                        className="h-full min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                        onChange={(event) => setProductSearch(event.target.value)}
                      />
                      {isSearchingProducts ? (
                        <Loader2 className="size-4 shrink-0 animate-spin text-primary" />
                      ) : null}
                    </div>
                  </div>

                  <div className="max-h-48 overflow-y-auto p-2 sm:max-h-56" role="listbox" aria-label="Referral link targets">
                    <button
                      type="button"
                      role="option"
                      aria-selected={productId === "store"}
                      className={cn(
                        "flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors hover:bg-primary/8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
                        productId === "store" ? "bg-primary/8 text-primary" : "",
                      )}
                      onClick={selectWholeStore}
                    >
                      <span className="flex min-w-0 items-center gap-2 font-medium">
                        <Store className="size-4 shrink-0" />
                        Whole store
                      </span>
                      {productId === "store" ? <Check className="size-4 shrink-0" /> : null}
                    </button>

                    <div className="my-2 h-px bg-border/70" />

                    {products.map((product) => (
                      <button
                        key={product.id}
                        type="button"
                        role="option"
                        aria-selected={productId === product.id.toString()}
                        className={cn(
                          "flex w-full items-start justify-between gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
                          productId === product.id.toString() ? "bg-primary/8" : "",
                        )}
                        onClick={() => selectProduct(product)}
                      >
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-medium text-foreground">
                            {product.name}
                          </span>
                          <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                            {product.categoryName} · {product.sku ?? product.slug}
                          </span>
                        </span>
                        {productId === product.id.toString() ? (
                          <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                        ) : null}
                      </button>
                    ))}

                    {!isSearchingProducts && products.length === 0 ? (
                      <div className="px-3 py-8 text-center">
                        <PackageSearch className="mx-auto size-6 text-muted-foreground" />
                        <p className="mt-2 text-sm font-medium text-foreground">No products found</p>
                        <p className="mt-1 text-xs leading-5 text-muted-foreground">
                          Try another keyword or use the whole store link.
                        </p>
                      </div>
                    ) : null}
                  </div>

                  {productsData && productsData.totalElements > products.length ? (
                    <div className="border-t border-border/70 bg-muted/20 px-4 py-2 text-xs text-muted-foreground">
                      Showing {products.length} of {productsData.totalElements} matches. Keep typing to narrow the list.
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>
            <p className="pt-1 text-xs text-muted-foreground">
              Product links open the detail page directly. Store links bring customers to the homepage.
            </p>
          </div>
        </div>

        <DialogFooter className="shrink-0 rounded-b-xl bg-muted/30">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
            className="h-10 min-w-28 rounded-full"
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            disabled={isPending}
            className="h-10 min-w-36 rounded-full shadow-sm"
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Creating...
              </>
            ) : (
              "Generate link"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function ReferralLinksPage() {
  const hasBootstrappedAuth = useAuthStore((state) => state.hasBootstrappedAuth);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<LinkStatusFilter>("ALL");

  const { data: productsData } = useProducts({
    size: 100,
    sortBy: "newest",
  });
  const {
    data: linksData,
    isLoading,
    isFetching,
    error,
  } = useAffiliateLinks({
    page: page - 1,
    size: LINK_PAGE_SIZE,
    active:
      statusFilter === "ALL"
        ? undefined
        : statusFilter === "ACTIVE",
  });
  const toggleLinkMutation = useToggleAffiliateLink();

  useEffect(() => {
    setPage(1);
  }, [statusFilter]);

  const links = linksData?.content ?? [];
  const activeLinksOnPage = links.filter((link) => link.isActive).length;
  const productSlugById = useMemo(
    () => new Map((productsData?.content ?? []).map((product) => [product.id, product.slug])),
    [productsData?.content],
  );

  const handleCopyLink = async (productId: number | null, refCode: string) => {
    if (typeof window === "undefined" || !navigator?.clipboard) {
      toast.error("Clipboard is not available in this browser.");
      return;
    }

    const slug = productId ? productSlugById.get(productId) : undefined;
    const pathname = slug ? `/products/${slug}` : "/";
    const shareUrl = new URL(pathname, window.location.origin);
    shareUrl.searchParams.set("ref", refCode);

    try {
      await navigator.clipboard.writeText(shareUrl.toString());
      toast.success("Referral link copied to clipboard.");
    } catch {
      toast.error("Failed to copy the referral link.");
    }
  };

  const handleToggle = (linkId: number, currentStatus: boolean) => {
    toggleLinkMutation.mutate(
      {
        linkId,
        payload: { active: !currentStatus },
      },
      {
        onError: () => toast.error("Failed to update link status."),
        onSuccess: () =>
          toast.success(
            !currentStatus ? "Link activated successfully." : "Link deactivated successfully.",
          ),
      },
    );
  };

  if (!hasBootstrappedAuth || isLoading) {
    return (
      <div className="flex min-h-[400px] w-full items-center justify-center rounded-2xl border border-dashed border-border/80 bg-muted/20">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[400px] w-full flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-border/80 bg-muted/20 text-muted-foreground">
        <AlertCircle className="size-8 text-destructive" />
        <p>Could not load referral links. Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col items-start justify-between gap-4 lg:flex-row lg:items-center">
        <div className="space-y-3">
          <Badge variant="outline" className="rounded-full border-primary/15 bg-primary/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-primary">
            Share-ready library
          </Badge>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Referral links</h1>
          <p className="max-w-2xl text-base leading-7 text-muted-foreground">
            Create campaign-ready links, control their status, and share URLs that track correctly.
          </p>
        </div>

        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
          <Select
            value={statusFilter}
            onValueChange={(value) => setStatusFilter(value as LinkStatusFilter)}
          >
            <SelectTrigger className="h-11 min-w-44 rounded-full bg-background">
              <span className="flex-1 text-left text-sm font-medium text-foreground">
                {LINK_FILTER_LABELS[statusFilter]}
              </span>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All links</SelectItem>
              <SelectItem value="ACTIVE">Active only</SelectItem>
              <SelectItem value="INACTIVE">Inactive only</SelectItem>
            </SelectContent>
          </Select>

          <Button onClick={() => setIsDialogOpen(true)} className="rounded-full shadow-sm">
            <Plus className="mr-1.5 size-4" />
            Create new link
          </Button>
        </div>
      </div>

      <CreateLinkDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} />

      <Card className="border border-border/80 bg-card/95 shadow-soft">
        <CardHeader className="gap-4 border-b border-border/70 pb-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg">Link library</CardTitle>
            <CardDescription>
              Every copied URL now uses the same `?ref=` format that the storefront tracker listens to.
            </CardDescription>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="rounded-full px-3 py-1 text-xs font-medium">
              {linksData?.totalElements ?? 0} total links
            </Badge>
            <Badge variant="outline" className="rounded-full px-3 py-1 text-xs font-medium">
              {activeLinksOnPage} active on this page
            </Badge>
            {isFetching ? (
              <Badge variant="outline" className="rounded-full px-3 py-1 text-xs font-medium">
                Refreshing...
              </Badge>
            ) : null}
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {links.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
              <div className="rounded-full bg-muted/50 p-4">
                <LinkIcon className="size-6 text-primary/50" />
              </div>
              <p className="mt-4 font-medium text-foreground">No links generated yet</p>
              <p className="mt-1 max-w-sm text-sm">
                Create your first referral link to start tracking clicks, conversions, and product interest.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Button onClick={() => setIsDialogOpen(true)} className="rounded-full">
                  Create your first link
                </Button>
                <Button
                  render={<Link href="/products" />}
                  nativeButton={false}
                  variant="outline"
                  className="rounded-full"
                >
                  Browse products
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="space-y-4 px-4 py-4 md:hidden">
                {links.map((link) => {
                  const togglingThisLink =
                    toggleLinkMutation.isPending &&
                    toggleLinkMutation.variables?.linkId === link.id;

                  return (
                    <div
                      key={link.id}
                      className="rounded-2xl border border-border/70 bg-background/90 p-4 shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 space-y-1">
                          {link.productId ? (
                            <>
                              <p
                                className="line-clamp-2 text-sm font-semibold text-foreground"
                                title={link.productName || `Product #${link.productId}`}
                              >
                                {link.productName || `Product #${link.productId}`}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Product-specific destination
                              </p>
                            </>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-primary">
                              <Store className="size-3.5" />
                              Storefront homepage
                            </span>
                          )}
                        </div>

                        <button
                          type="button"
                          aria-label={
                            link.isActive
                              ? `Deactivate referral link ${link.refCode}`
                              : `Activate referral link ${link.refCode}`
                          }
                          onClick={() => handleToggle(link.id, link.isActive)}
                          disabled={togglingThisLink}
                          className="inline-flex items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
                          title={link.isActive ? "Click to deactivate" : "Click to activate"}
                        >
                          <ReferralLinkStatusBadge isActive={link.isActive} />
                        </button>
                      </div>

                      <div className="mt-4 flex flex-wrap items-center gap-2">
                        <code className="rounded-full bg-muted px-3 py-1 text-xs font-semibold tracking-wider text-muted-foreground">
                          {link.refCode}
                        </code>
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                        <div className="rounded-xl bg-muted/30 p-3">
                          <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                            Clicks
                          </p>
                          <p className="mt-1 font-semibold text-foreground">
                            {link.totalClicks.toLocaleString()}
                          </p>
                        </div>
                        <div className="rounded-xl bg-muted/30 p-3">
                          <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                            Conversions
                          </p>
                          <p className="mt-1 font-semibold text-foreground">
                            {link.totalConversions.toLocaleString()}
                          </p>
                        </div>
                      </div>

                      <Button
                        variant="outline"
                        className="mt-4 w-full rounded-full"
                        onClick={() => handleCopyLink(link.productId, link.refCode)}
                      >
                        <Copy className="mr-1.5 size-4" />
                        Copy link
                      </Button>
                    </div>
                  );
                })}
              </div>

              <div className="hidden md:block">
                <Table>
                  <TableHeader className="bg-muted/30">
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="whitespace-nowrap font-medium">Target</TableHead>
                      <TableHead className="font-medium">Ref code</TableHead>
                      <TableHead className="text-center font-medium">Clicks</TableHead>
                      <TableHead className="text-center font-medium">Conversions</TableHead>
                      <TableHead className="text-center font-medium">Status</TableHead>
                      <TableHead className="text-right font-medium">Actions</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {links.map((link) => {
                      const togglingThisLink =
                        toggleLinkMutation.isPending &&
                        toggleLinkMutation.variables?.linkId === link.id;

                      return (
                        <TableRow key={link.id} className="transition-colors hover:bg-muted/40">
                          <TableCell className="font-medium">
                            {link.productId ? (
                              <div className="space-y-1">
                                <p
                                  className="line-clamp-1 max-w-[240px] text-foreground"
                                  title={link.productName || `Product #${link.productId}`}
                                >
                                  {link.productName || `Product #${link.productId}`}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  Product-specific destination
                                </p>
                              </div>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 text-primary">
                                <Store className="size-3.5" />
                                Storefront homepage
                              </span>
                            )}
                          </TableCell>

                          <TableCell>
                            <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-semibold tracking-wider text-muted-foreground">
                              {link.refCode}
                            </code>
                          </TableCell>

                          <TableCell className="text-center font-medium">
                            {link.totalClicks.toLocaleString()}
                          </TableCell>

                          <TableCell className="text-center font-medium">
                            {link.totalConversions.toLocaleString()}
                          </TableCell>

                          <TableCell className="text-center">
                            <button
                              type="button"
                              aria-label={
                                link.isActive
                                  ? `Deactivate referral link ${link.refCode}`
                                  : `Activate referral link ${link.refCode}`
                              }
                              onClick={() => handleToggle(link.id, link.isActive)}
                              disabled={togglingThisLink}
                              className="inline-flex items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
                              title={link.isActive ? "Click to deactivate" : "Click to activate"}
                            >
                              <ReferralLinkStatusBadge isActive={link.isActive} />
                            </button>
                          </TableCell>

                          <TableCell className="text-right">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 gap-1.5 rounded-full px-3 text-xs text-muted-foreground hover:text-foreground"
                              onClick={() => handleCopyLink(link.productId, link.refCode)}
                            >
                              <Copy className="size-3.5" />
                              Copy link
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              <AffiliatePagination
                page={page}
                totalPages={linksData?.totalPages ?? 1}
                totalElements={linksData?.totalElements ?? 0}
                size={linksData?.size ?? LINK_PAGE_SIZE}
                itemLabel="links"
                onPageChange={setPage}
                isDisabled={isFetching}
              />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
