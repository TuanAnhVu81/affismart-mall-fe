"use client";

import * as React from "react";
import { Database, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

export interface DataTableColumn<T> {
  key: string;
  header: React.ReactNode;
  cell: (row: T, index: number) => React.ReactNode;
  headerClassName?: string;
  cellClassName?: string;
  skeletonClassName?: string;
}

export interface DataTablePaginationProps {
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  itemLabel?: string;
  isDisabled?: boolean;
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  data: T[];
  isLoading?: boolean;
  pagination?: DataTablePaginationProps;
  rowKey?: (row: T, index: number) => React.Key;
  skeletonRows?: number;
  title?: React.ReactNode;
  description?: React.ReactNode;
  toolbar?: React.ReactNode;
  emptyTitle?: string;
  emptyDescription?: string;
  className?: string;
  tableClassName?: string;
}

function LoadingRows<T>({
  columns,
  rowCount,
}: {
  columns: DataTableColumn<T>[];
  rowCount: number;
}) {
  return (
    <>
      {Array.from({ length: rowCount }).map((_, rowIndex) => (
        <TableRow key={`skeleton-row-${rowIndex}`} className="hover:bg-transparent">
          {columns.map((column) => (
            <TableCell key={`${column.key}-${rowIndex}`} className={column.cellClassName}>
              <Skeleton
                className={cn(
                  "h-5 w-full max-w-[12rem] rounded-full bg-muted/70",
                  column.skeletonClassName,
                )}
              />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
}

function EmptyState({
  colSpan,
  title,
  description,
}: {
  colSpan: number;
  title: string;
  description: string;
}) {
  return (
    <TableRow className="hover:bg-transparent">
      <TableCell colSpan={colSpan} className="px-6 py-16">
        <div className="flex flex-col items-center justify-center gap-4 text-center">
          <div className="flex size-14 items-center justify-center rounded-2xl border border-border/70 bg-muted/20 text-primary shadow-sm">
            <Database className="size-6" />
          </div>
          <div className="space-y-1.5">
            <p className="text-lg font-semibold text-foreground">{title}</p>
            <p className="max-w-lg text-sm leading-6 text-muted-foreground">{description}</p>
          </div>
        </div>
      </TableCell>
    </TableRow>
  );
}

function Pagination({
  page,
  size,
  totalElements,
  totalPages,
  onPageChange,
  itemLabel = "records",
  isDisabled = false,
}: DataTablePaginationProps) {
  if (totalElements <= 0) {
    return null;
  }

  const safeTotalPages = Math.max(totalPages, 1);
  const currentPage = Math.min(Math.max(page, 0), safeTotalPages - 1);
  const start = currentPage * size + 1;
  const end = Math.min((currentPage + 1) * size, totalElements);

  return (
    <div className="flex flex-col gap-3 border-t border-border/70 bg-muted/10 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-muted-foreground">
        Showing <span className="font-semibold text-foreground">{start}-{end}</span> of{" "}
        <span className="font-semibold text-foreground">{totalElements}</span> {itemLabel}
      </p>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="rounded-full"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={isDisabled || currentPage <= 0}
        >
          <ChevronLeft className="size-4" />
          Previous
        </Button>

        <span className="min-w-24 rounded-full border border-border/70 bg-background px-3 py-1.5 text-center text-sm font-medium text-foreground">
          Page {currentPage + 1} / {safeTotalPages}
        </span>

        <Button
          type="button"
          variant="outline"
          size="sm"
          className="rounded-full"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={isDisabled || currentPage >= safeTotalPages - 1}
        >
          Next
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}

export function DataTable<T>({
  columns,
  data,
  isLoading = false,
  pagination,
  rowKey,
  skeletonRows = 5,
  title,
  description,
  toolbar,
  emptyTitle = "No data available",
  emptyDescription = "There is nothing to show here yet. Try adjusting filters or come back later.",
  className,
  tableClassName,
}: DataTableProps<T>) {
  const hasHeader = Boolean(title || description || toolbar);
  const rowCount = pagination?.size ? Math.min(Math.max(pagination.size, 1), 8) : skeletonRows;

  return (
    <section
      className={cn(
        "overflow-hidden rounded-[28px] border border-border/70 bg-background shadow-[0_20px_60px_-48px_rgba(15,23,42,0.35)]",
        className,
      )}
    >
      {hasHeader ? (
        <div className="flex flex-col gap-4 border-b border-border/70 px-5 py-5 sm:px-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-1.5">
              {title ? (
                <h3 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h3>
              ) : null}
              {description ? (
                <p className="max-w-3xl text-sm leading-6 text-muted-foreground">{description}</p>
              ) : null}
            </div>

            {toolbar ? <div className="flex shrink-0 flex-wrap items-center gap-2">{toolbar}</div> : null}
          </div>
        </div>
      ) : null}

      <Table className={cn("min-w-full", tableClassName)}>
        <TableHeader>
          <TableRow className="border-b border-border/70 bg-muted/10 hover:bg-muted/10">
            {columns.map((column) => (
              <TableHead
                key={column.key}
                className={cn(
                  "h-12 px-5 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground sm:px-6",
                  column.headerClassName,
                )}
              >
                {column.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>

        <TableBody>
          {isLoading ? (
            <LoadingRows columns={columns} rowCount={rowCount} />
          ) : data.length ? (
            data.map((row, index) => (
              <TableRow
                key={rowKey ? rowKey(row, index) : `data-row-${index}`}
                className="border-b border-border/60 last:border-b-0"
              >
                {columns.map((column) => (
                  <TableCell
                    key={column.key}
                    className={cn("px-5 py-4 text-sm text-foreground sm:px-6", column.cellClassName)}
                  >
                    {column.cell(row, index)}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <EmptyState
              colSpan={columns.length}
              title={emptyTitle}
              description={emptyDescription}
            />
          )}
        </TableBody>
      </Table>

      {pagination ? <Pagination {...pagination} isDisabled={pagination.isDisabled || isLoading} /> : null}
    </section>
  );
}
