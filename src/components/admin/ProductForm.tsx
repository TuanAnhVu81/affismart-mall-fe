"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { Controller, useForm } from "react-hook-form";
import {
  ArrowLeft,
  ImagePlus,
  Loader2,
  PackagePlus,
  RefreshCcw,
  Sparkles,
  Upload,
} from "lucide-react";
import { useRef, useState } from "react";
import type { Category } from "@/types/product.types";
import type { UpsertProductPayload } from "@/types/admin.types";
import {
  adminProductSchema,
  type AdminProductFormInputValues,
  type AdminProductFormValues,
} from "@/lib/validators";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";

const passthroughImageLoader = ({ src }: { src: string }) => src;

interface ProductFormInitialValues {
  categoryId: number;
  name: string;
  sku?: string;
  slug?: string;
  description?: string | null;
  price: number;
  stockQuantity: number;
  imageUrl?: string | null;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface ProductFormProps {
  mode: "create" | "edit";
  categories: Category[];
  initialValues?: ProductFormInitialValues;
  onSubmit: (payload: UpsertProductPayload) => Promise<void>;
  onUploadImage: (file: File) => Promise<{ secureUrl: string }>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function ProductForm({
  mode,
  categories,
  initialValues,
  onSubmit,
  onUploadImage,
  onCancel,
  isSubmitting = false,
}: ProductFormProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const form = useForm<AdminProductFormInputValues, unknown, AdminProductFormValues>({
    resolver: zodResolver(adminProductSchema),
    defaultValues: {
      categoryId: initialValues?.categoryId ?? 0,
      name: initialValues?.name ?? "",
      sku: initialValues?.sku ?? "",
      slug: initialValues?.slug ?? "",
      description: initialValues?.description ?? "",
      price: initialValues?.price ?? 0,
      stockQuantity: initialValues?.stockQuantity ?? 0,
      imageUrl: initialValues?.imageUrl ?? "",
    },
  });

  const imageUrl = form.watch("imageUrl");
  const stockQuantity = Number(form.watch("stockQuantity") || 0);
  const price = Number(form.watch("price") || 0);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    try {
      setIsUploadingImage(true);
      const result = await onUploadImage(file);
      form.setValue("imageUrl", result.secureUrl, {
        shouldDirty: true,
        shouldValidate: true,
      });
    } finally {
      setIsUploadingImage(false);
      if (event.target) {
        event.target.value = "";
      }
    }
  };

  const submit = async (values: AdminProductFormValues) => {
    await onSubmit({
      categoryId: values.categoryId,
      name: values.name.trim(),
      sku: values.sku.trim(),
      slug: values.slug?.trim() || undefined,
      description: values.description?.trim() || undefined,
      price: values.price,
      stockQuantity: values.stockQuantity,
      imageUrl: values.imageUrl?.trim() || undefined,
    });
  };

  const disableSubmit = isSubmitting || isUploadingImage || categories.length === 0;
  const hasImage = Boolean(imageUrl);
  const stockTone =
    stockQuantity <= 0 ? "destructive" : stockQuantity < 10 ? "outline" : "secondary";

  return (
    <form onSubmit={form.handleSubmit(submit)} noValidate className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_22rem]">
        <section className="overflow-hidden rounded-[28px] border border-border/80 bg-background shadow-soft">
          <div className="border-b border-border/70 bg-gradient-to-br from-primary/6 via-background to-background px-5 py-5 sm:px-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="space-y-2">
                <Badge className="rounded-full bg-primary/8 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">
                  {mode === "create" ? "New product" : "Edit product"}
                </Badge>
                <div>
                  <h1 className="text-3xl font-semibold tracking-tight text-foreground">
                    {mode === "create" ? "Create catalog item" : "Refine product details"}
                  </h1>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                    Keep core product data clean and consistent so the storefront, cart, and future admin reports stay trustworthy.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {mode === "edit" && initialValues?.isActive !== undefined ? (
                  <Badge
                    variant={initialValues.isActive ? "secondary" : "outline"}
                    className={cn(
                      "rounded-full px-3 py-1 text-xs font-semibold",
                      initialValues.isActive
                        ? "bg-emerald-50 text-emerald-700"
                        : "border-amber-200 bg-amber-50 text-amber-700",
                    )}
                  >
                    {initialValues.isActive ? "Currently active" : "Currently inactive"}
                  </Badge>
                ) : null}

                <Button
                  type="button"
                  variant="outline"
                  className="rounded-full"
                  onClick={onCancel}
                >
                  <ArrowLeft className="size-4" />
                  Back
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-6 px-5 py-6 sm:px-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="product-name" className="text-sm font-medium text-foreground">
                  Product name
                </label>
                <Input
                  id="product-name"
                  placeholder="Example: iPhone 15 Pro Max 256GB Black Titan"
                  aria-invalid={Boolean(form.formState.errors.name)}
                  className="h-11 rounded-xl"
                  {...form.register("name")}
                />
                {form.formState.errors.name ? (
                  <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
                ) : null}
              </div>

              <div className="space-y-2">
                <label htmlFor="product-sku" className="text-sm font-medium text-foreground">
                  SKU
                </label>
                <Input
                  id="product-sku"
                  placeholder="Example: IP15PM-256-BLK"
                  aria-invalid={Boolean(form.formState.errors.sku)}
                  className="h-11 rounded-xl"
                  {...form.register("sku")}
                />
                {form.formState.errors.sku ? (
                  <p className="text-sm text-destructive">{form.formState.errors.sku.message}</p>
                ) : null}
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_14rem_14rem]">
              <div className="space-y-2">
                <label htmlFor="product-category" className="text-sm font-medium text-foreground">
                  Category
                </label>
                <Controller
                  control={form.control}
                  name="categoryId"
                  render={({ field }) => {
                    const selectedCategory = categories.find(
                      (category) => category.id === Number(field.value),
                    );

                    return (
                      <Select
                        value={field.value ? String(field.value) : ""}
                        onValueChange={(value) => field.onChange(Number(value))}
                        disabled={categories.length === 0}
                      >
                        <SelectTrigger
                          id="product-category"
                          className="h-11 w-full rounded-xl bg-background"
                        >
                          <span className="truncate text-left">
                            {selectedCategory
                              ? selectedCategory.name
                              : categories.length
                                ? "Select category"
                                : "No categories available"}
                          </span>
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={String(category.id)}>
                              <div className="flex items-center gap-2">
                                <span>{category.name}</span>
                                {!category.isActive ? (
                                  <Badge
                                    variant="outline"
                                    className="rounded-full px-2 py-0 text-[10px] uppercase tracking-[0.14em]"
                                  >
                                    Inactive
                                  </Badge>
                                ) : null}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    );
                  }}
                />
                {form.formState.errors.categoryId ? (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.categoryId.message}
                  </p>
                ) : null}
              </div>

              <div className="space-y-2">
                <label htmlFor="product-price" className="text-sm font-medium text-foreground">
                  Price
                </label>
                <Input
                  id="product-price"
                  type="number"
                  min={1}
                  step="0.01"
                  aria-invalid={Boolean(form.formState.errors.price)}
                  className="h-11 rounded-xl"
                  {...form.register("price")}
                />
                {form.formState.errors.price ? (
                  <p className="text-sm text-destructive">{form.formState.errors.price.message}</p>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    {price > 0 ? `Preview: ${formatCurrency(price)}` : "Enter selling price in VND."}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="product-stock" className="text-sm font-medium text-foreground">
                  Stock quantity
                </label>
                <Input
                  id="product-stock"
                  type="number"
                  min={0}
                  step={1}
                  aria-invalid={Boolean(form.formState.errors.stockQuantity)}
                  className="h-11 rounded-xl"
                  {...form.register("stockQuantity")}
                />
                {form.formState.errors.stockQuantity ? (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.stockQuantity.message}
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Keep this synced with your operational inventory.
                  </p>
                )}
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
              <div className="space-y-2">
                <label htmlFor="product-slug" className="text-sm font-medium text-foreground">
                  Slug
                </label>
                <Input
                  id="product-slug"
                  placeholder="Optional. Leave blank to let backend generate it."
                  aria-invalid={Boolean(form.formState.errors.slug)}
                  className="h-11 rounded-xl"
                  {...form.register("slug")}
                />
                {form.formState.errors.slug ? (
                  <p className="text-sm text-destructive">{form.formState.errors.slug.message}</p>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    A clean slug improves product URLs and storefront SEO.
                  </p>
                )}
              </div>

              <div className="rounded-2xl border border-border/70 bg-muted/15 px-4 py-3">
                <p className="text-sm font-semibold text-foreground">Quick quality check</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Badge
                    variant={stockTone}
                    className={cn(
                      "rounded-full px-3 py-1 text-xs font-medium",
                      stockQuantity > 0 && stockQuantity < 10
                        ? "border-amber-200 bg-amber-50 text-amber-700"
                        : "",
                      stockQuantity >= 10
                        ? "bg-emerald-50 text-emerald-700"
                        : "",
                    )}
                  >
                    {stockQuantity <= 0
                      ? "Out of stock"
                      : stockQuantity < 10
                        ? "Low stock"
                        : "Healthy stock"}
                  </Badge>

                  {hasImage ? (
                    <Badge variant="outline" className="rounded-full px-3 py-1 text-xs">
                      Image ready
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="rounded-full px-3 py-1 text-xs">
                      Needs image
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="product-description" className="text-sm font-medium text-foreground">
                Description
              </label>
              <textarea
                id="product-description"
                rows={7}
                placeholder="Describe key specs, highlights, and selling points for this product."
                aria-invalid={Boolean(form.formState.errors.description)}
                className={cn(
                  "w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
                  form.formState.errors.description
                    ? "border-destructive focus-visible:border-destructive focus-visible:ring-destructive/20"
                    : "",
                )}
                {...form.register("description")}
              />
              {form.formState.errors.description ? (
                <p className="text-sm text-destructive">
                  {form.formState.errors.description.message}
                </p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Richer descriptions make storefront detail pages feel more trustworthy and complete.
                </p>
              )}
            </div>
          </div>
        </section>

        <aside className="space-y-6">
          <section className="overflow-hidden rounded-[28px] border border-border/80 bg-background shadow-soft">
            <div className="border-b border-border/70 px-5 py-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Image and media</h2>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    Upload once, preview instantly, then keep the CDN URL in sync with the form.
                  </p>
                </div>
                <Badge variant="outline" className="rounded-full px-3 py-1 text-xs">
                  Cloudinary
                </Badge>
              </div>
            </div>

            <div className="space-y-4 px-5 py-5">
              <div className="relative aspect-square overflow-hidden rounded-3xl border border-border/70 bg-muted/15">
                {hasImage ? (
                  <Image
                    src={imageUrl as string}
                    alt={form.watch("name") || "Product preview"}
                    fill
                    loader={passthroughImageLoader}
                    unoptimized
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 352px"
                  />
                ) : (
                  <div className="flex h-full flex-col items-center justify-center gap-3 text-center text-muted-foreground">
                    <div className="flex size-14 items-center justify-center rounded-2xl border border-dashed border-primary/20 bg-primary/5 text-primary">
                      <ImagePlus className="size-6" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-foreground">No product image yet</p>
                      <p className="px-6 text-xs leading-5 text-muted-foreground">
                        Upload a clean main image so cards and storefront detail pages look polished from the start.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />

              <div className="space-y-2">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full rounded-full"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingImage}
                >
                  {isUploadingImage ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Uploading image...
                    </>
                  ) : (
                    <>
                      <Upload className="size-4" />
                      Upload image
                    </>
                  )}
                </Button>

                <div className="space-y-2">
                  <label htmlFor="image-url" className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                    Image URL
                  </label>
                  <Input
                    id="image-url"
                    placeholder="https://..."
                    aria-invalid={Boolean(form.formState.errors.imageUrl)}
                    className="h-11 rounded-xl"
                    {...form.register("imageUrl")}
                  />
                  {form.formState.errors.imageUrl ? (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.imageUrl.message}
                    </p>
                  ) : null}
                </div>
              </div>
            </div>
          </section>

          <section className="overflow-hidden rounded-[28px] border border-border/80 bg-background shadow-soft">
            <div className="border-b border-border/70 px-5 py-5">
              <h2 className="text-lg font-semibold text-foreground">Publish notes</h2>
            </div>
            <div className="space-y-4 px-5 py-5">
              <div className="rounded-2xl border border-primary/10 bg-primary/5 p-4">
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 flex size-9 items-center justify-center rounded-2xl bg-white text-primary shadow-sm">
                    <Sparkles className="size-4" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-foreground">Storefront-ready checklist</p>
                    <ul className="mt-2 space-y-1.5 text-sm leading-6 text-muted-foreground">
                      <li>Clear name and SKU</li>
                      <li>Correct category mapping</li>
                      <li>Price greater than zero</li>
                      <li>Accurate stock count</li>
                      <li>Hero image or valid URL</li>
                    </ul>
                  </div>
                </div>
              </div>

              {mode === "edit" && (initialValues?.createdAt || initialValues?.updatedAt) ? (
                <div className="rounded-2xl border border-border/70 bg-muted/15 p-4 text-sm leading-6 text-muted-foreground">
                  {initialValues.createdAt ? (
                    <p>
                      Created: <span className="font-medium text-foreground">{formatDate(initialValues.createdAt)}</span>
                    </p>
                  ) : null}
                  {initialValues.updatedAt ? (
                    <p>
                      Last updated: <span className="font-medium text-foreground">{formatDate(initialValues.updatedAt)}</span>
                    </p>
                  ) : null}
                </div>
              ) : null}

              <div className="flex flex-col gap-3">
                <Button
                  type="submit"
                  disabled={disableSubmit}
                  className="h-11 rounded-full shadow-sm"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Saving product...
                    </>
                  ) : mode === "create" ? (
                    <>
                      <PackagePlus className="size-4" />
                      Create product
                    </>
                  ) : (
                    <>
                      <RefreshCcw className="size-4" />
                      Save changes
                    </>
                  )}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  className="h-11 rounded-full"
                  onClick={onCancel}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </section>
        </aside>
      </div>
    </form>
  );
}
