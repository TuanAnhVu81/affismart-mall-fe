"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AffiliatePaginationProps {
  page: number;
  totalPages: number;
  totalElements: number;
  size: number;
  itemLabel: string;
  onPageChange: (page: number) => void;
  isDisabled?: boolean;
}

export function AffiliatePagination({
  page,
  totalPages,
  totalElements,
  size,
  itemLabel,
  onPageChange,
  isDisabled = false,
}: AffiliatePaginationProps) {
  if (totalElements <= 0) {
    return null;
  }

  const safeTotalPages = Math.max(totalPages, 1);
  const currentPage = Math.min(Math.max(page, 1), safeTotalPages);
  const start = (currentPage - 1) * size + 1;
  const end = Math.min(currentPage * size, totalElements);

  return (
    <div className="flex flex-col gap-3 border-t border-border/70 bg-muted/10 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-muted-foreground">
        Showing <span className="font-semibold text-foreground">{start}-{end}</span> of{" "}
        <span className="font-semibold text-foreground">{totalElements}</span> {itemLabel}
      </p>

      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="rounded-full"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={isDisabled || currentPage <= 1}
        >
          <ChevronLeft className="mr-1 size-4" />
          Previous
        </Button>
        <span className="min-w-24 rounded-full border border-border/70 bg-background px-3 py-1.5 text-center text-sm font-medium text-foreground">
          Page {currentPage} / {safeTotalPages}
        </span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="rounded-full"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={isDisabled || currentPage >= safeTotalPages}
        >
          Next
          <ChevronRight className="ml-1 size-4" />
        </Button>
      </div>
    </div>
  );
}
