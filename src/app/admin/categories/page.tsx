"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { FolderTree, Loader2, PencilLine, Plus, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { DataTable, type DataTableColumn } from "@/components/admin/DataTable";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  useAdminCategories,
  useCreateAdminCategory,
  useUpdateAdminCategory,
  useUpdateAdminCategoryStatus,
} from "@/hooks/useAdmin";
import {
  adminCategorySchema,
  type AdminCategoryFormValues,
} from "@/lib/validators";
import { formatDate } from "@/lib/utils";
import type { Category } from "@/types/product.types";

interface ApiErrorResponse {
  message?: string;
}

const getErrorMessage = (error: unknown, fallback: string) => {
  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    return error.response?.data?.message ?? fallback;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
};

function CategoryDialog({
  open,
  onOpenChange,
  initialCategory,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialCategory: Category | null;
}) {
  const createCategoryMutation = useCreateAdminCategory();
  const updateCategoryMutation = useUpdateAdminCategory();
  const isEditMode = Boolean(initialCategory);
  const isPending = createCategoryMutation.isPending || updateCategoryMutation.isPending;

  const form = useForm<AdminCategoryFormValues>({
    resolver: zodResolver(adminCategorySchema),
    values: {
      name: initialCategory?.name ?? "",
      slug: initialCategory?.slug ?? "",
    },
  });

  const handleSubmit = async (values: AdminCategoryFormValues) => {
    try {
      if (initialCategory) {
        await updateCategoryMutation.mutateAsync({
          categoryId: initialCategory.id,
          payload: {
            name: values.name.trim(),
            slug: values.slug?.trim() || undefined,
          },
        });
        toast.success("Category updated successfully.");
      } else {
        await createCategoryMutation.mutateAsync({
          name: values.name.trim(),
          slug: values.slug?.trim() || undefined,
        });
        toast.success("Category created successfully.");
      }

      onOpenChange(false);
      form.reset();
    } catch (error) {
      toast.error(
        getErrorMessage(
          error,
          initialCategory
            ? "Failed to update the category."
            : "Failed to create the category.",
        ),
      );
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (isPending) return;
        onOpenChange(nextOpen);
        if (!nextOpen) {
          form.reset();
        }
      }}
    >
      <DialogContent className="max-w-xl p-0" showCloseButton={!isPending}>
        <DialogHeader className="border-b border-border/70 bg-gradient-to-br from-primary/6 via-background to-background px-5 py-5 sm:px-6">
          <Badge className="mb-3 w-fit rounded-full bg-primary/8 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">
            Catalog taxonomy
          </Badge>
          <DialogTitle className="text-xl">
            {isEditMode ? "Refine category details" : "Create storefront category"}
          </DialogTitle>
          <DialogDescription className="max-w-xl text-sm leading-6">
            Category names and slugs shape storefront filters, product grouping, and admin reporting. Keep them short and clear.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5 px-5 py-6 sm:px-6">
          <div className="rounded-2xl border border-primary/10 bg-primary/5 px-4 py-3 text-sm leading-6 text-muted-foreground">
            Use human-readable names customers recognize instantly. Slugs are optional and can be generated automatically by the backend.
          </div>

          <div className="space-y-2">
            <label htmlFor="category-name" className="text-sm font-medium text-foreground">
              Category name
            </label>
            <Input
              id="category-name"
              placeholder="Example: Electronics"
              aria-invalid={Boolean(form.formState.errors.name)}
              className="h-11 rounded-xl"
              {...form.register("name")}
            />
            {form.formState.errors.name ? (
              <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <label htmlFor="category-slug" className="text-sm font-medium text-foreground">
              Category slug
            </label>
            <Input
              id="category-slug"
              placeholder="Optional. Example: electronics"
              aria-invalid={Boolean(form.formState.errors.slug)}
              className="h-11 rounded-xl"
              {...form.register("slug")}
            />
            {form.formState.errors.slug ? (
              <p className="text-sm text-destructive">{form.formState.errors.slug.message}</p>
            ) : (
              <p className="text-xs text-muted-foreground">
                Short slugs keep URLs tidy and make catalog links easier to share.
              </p>
            )}
          </div>

          <DialogFooter className="rounded-b-xl">
            <Button
              type="button"
              variant="outline"
              className="h-10 min-w-28 rounded-full"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="h-10 min-w-36 rounded-full shadow-sm"
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Saving...
                </>
              ) : isEditMode ? (
                "Save category"
              ) : (
                "Create category"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function AdminCategoriesPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryToToggle, setCategoryToToggle] = useState<Category | null>(null);
  const { data, isLoading, error } = useAdminCategories();
  const updateStatusMutation = useUpdateAdminCategoryStatus();

  const categories = useMemo(() => data?.items ?? [], [data?.items]);
  const activeCount = useMemo(
    () => categories.filter((category) => category.isActive).length,
    [categories],
  );

  const handleToggle = async () => {
    if (!categoryToToggle) {
      return;
    }

    try {
      await updateStatusMutation.mutateAsync({
        categoryId: categoryToToggle.id,
        payload: { active: !categoryToToggle.isActive },
      });
      toast.success(
        categoryToToggle.isActive
          ? "Category hidden from the active catalog."
          : "Category reactivated successfully.",
      );
      setCategoryToToggle(null);
    } catch (toggleError) {
      toast.error(getErrorMessage(toggleError, "Failed to update category status."));
    }
  };

  const columns: DataTableColumn<Category>[] = [
    {
      key: "name",
      header: "Category",
      cell: (category) => (
        <div className="space-y-1">
          <p className="font-semibold text-foreground">{category.name}</p>
          <p className="text-xs text-muted-foreground">Slug: {category.slug}</p>
        </div>
      ),
      skeletonClassName: "max-w-[14rem]",
    },
    {
      key: "status",
      header: "Status",
      cell: (category) => (
        <Badge
          variant="outline"
          className={
            category.isActive
              ? "rounded-full border-emerald-200 bg-emerald-50 px-3 py-1 text-emerald-700"
              : "rounded-full border-amber-200 bg-amber-50 px-3 py-1 text-amber-700"
          }
        >
          {category.isActive ? "Active" : "Inactive"}
        </Badge>
      ),
      cellClassName: "w-[10rem]",
      skeletonClassName: "max-w-[7rem]",
    },
    {
      key: "updatedAt",
      header: "Last updated",
      cell: (category) => (
        <span className="text-sm text-muted-foreground">
          {category.updatedAt ? formatDate(category.updatedAt) : "Recently"}
        </span>
      ),
      cellClassName: "w-[10rem]",
      skeletonClassName: "max-w-[6rem]",
    },
    {
      key: "actions",
      header: "Actions",
      headerClassName: "text-right",
      cellClassName: "w-[14rem] text-right",
      cell: (category) => (
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="rounded-full"
            onClick={() => {
              setEditingCategory(category);
              setIsDialogOpen(true);
            }}
          >
            <PencilLine className="size-3.5" />
            Edit
          </Button>
          <Button
            type="button"
            variant={category.isActive ? "outline" : "default"}
            size="sm"
            className="rounded-full"
            onClick={() => setCategoryToToggle(category)}
          >
            {category.isActive ? "Deactivate" : "Activate"}
          </Button>
        </div>
      ),
      skeletonClassName: "ml-auto max-w-[9rem]",
    },
  ];

  return (
    <div className="space-y-6">
      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.5fr)_repeat(2,minmax(0,1fr))]">
        <div className="rounded-[28px] border border-border/80 bg-gradient-to-br from-primary/8 via-background to-emerald-50/50 px-5 py-6 shadow-soft sm:px-6">
          <Badge className="rounded-full bg-white/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">
            Catalog structure
          </Badge>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-foreground">
            Category management
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Shape how products are grouped across browsing, filters, and future analytics. Keep the taxonomy clean so the storefront feels intuitive.
          </p>
        </div>

        <div className="rounded-[28px] border border-border/80 bg-background px-5 py-6 shadow-soft sm:px-6">
          <div className="flex items-center gap-3">
            <span className="flex size-11 items-center justify-center rounded-2xl bg-primary/8 text-primary">
              <FolderTree className="size-5" />
            </span>
            <div>
              <p className="text-sm text-muted-foreground">Total categories</p>
              <p className="text-3xl font-semibold tracking-tight text-foreground">
                {categories.length}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-[28px] border border-border/80 bg-background px-5 py-6 shadow-soft sm:px-6">
          <div className="flex items-center gap-3">
            <span className="flex size-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
              <Sparkles className="size-5" />
            </span>
            <div>
              <p className="text-sm text-muted-foreground">Active categories</p>
              <p className="text-3xl font-semibold tracking-tight text-foreground">
                {activeCount}
              </p>
            </div>
          </div>
        </div>
      </section>

      <DataTable
        title="Storefront categories"
        description="Create new categories, adjust labels, and control whether each category stays visible in the active public catalog."
        columns={columns}
        data={categories}
        isLoading={isLoading}
        emptyTitle={error ? "Could not load categories" : "No categories created yet"}
        emptyDescription={
          error
            ? getErrorMessage(error, "Please try refreshing the page.")
            : "Your first category will help structure products for filters, navigation, and future reporting."
        }
        toolbar={
          <Button
            type="button"
            className="rounded-full shadow-sm"
            onClick={() => {
              setEditingCategory(null);
              setIsDialogOpen(true);
            }}
          >
            <Plus className="size-4" />
            New category
          </Button>
        }
      />

      <CategoryDialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) {
            setEditingCategory(null);
          }
        }}
        initialCategory={editingCategory}
      />

      <ConfirmDialog
        open={Boolean(categoryToToggle)}
        onOpenChange={(open) => {
          if (!open) {
            setCategoryToToggle(null);
          }
        }}
        title={categoryToToggle?.isActive ? "Deactivate this category?" : "Activate this category?"}
        description={
          categoryToToggle?.isActive
            ? "Inactive categories stay in admin records but should no longer appear in the active storefront catalog."
            : "Activating this category makes it available again for active catalog usage."
        }
        confirmText={categoryToToggle?.isActive ? "Deactivate" : "Activate"}
        isLoading={updateStatusMutation.isPending}
        onConfirm={handleToggle}
      />
    </div>
  );
}
