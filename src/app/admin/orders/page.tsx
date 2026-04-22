"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  ArrowRight,
  BadgeCheck,
  CalendarRange,
  CircleDollarSign,
  FolderKanban,
  Truck,
} from "lucide-react";
import { DataTable, type DataTableColumn } from "@/components/admin/DataTable";
import { OrderStatusBadge } from "@/components/order/OrderStatusBadge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { useAdminOrders } from "@/hooks/useAdmin";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { OrderStatus, OrderSummary } from "@/types/order.types";

type OrderStatusFilter = OrderStatus | "ALL";

interface ApiErrorResponse {
  message?: string;
}

const ORDER_PAGE_SIZE = 10;

const STATUS_OPTIONS: Array<{ value: OrderStatusFilter; label: string }> = [
  { value: "ALL", label: "All statuses" },
  { value: "PENDING", label: "Pending" },
  { value: "PAID", label: "Paid" },
  { value: "CONFIRMED", label: "Confirmed" },
  { value: "SHIPPED", label: "Shipped" },
  { value: "DONE", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" },
];

const toStartOfDay = (date: string) => `${date}T00:00:00`;
const toEndOfDay = (date: string) => `${date}T23:59:59`;

const getErrorMessage = (error: unknown, fallback: string) => {
  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    return error.response?.data?.message ?? fallback;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
};

export default function AdminOrdersPage() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<OrderStatusFilter>("ALL");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  useEffect(() => {
    setPage(1);
  }, [statusFilter, fromDate, toDate]);

  const ordersQuery = useAdminOrders({
    page: page - 1,
    size: ORDER_PAGE_SIZE,
    sortBy: "createdAt",
    sortDir: "desc",
    status: statusFilter === "ALL" ? undefined : statusFilter,
    fromDate: fromDate ? toStartOfDay(fromDate) : undefined,
    toDate: toDate ? toEndOfDay(toDate) : undefined,
  });

  const orders = useMemo(() => ordersQuery.data?.content ?? [], [ordersQuery.data?.content]);

  const summary = useMemo(() => {
    const awaitingConfirmation = orders.filter((order) => order.status === "PAID").length;
    const inDelivery = orders.filter(
      (order) => order.status === "CONFIRMED" || order.status === "SHIPPED",
    ).length;
    const completedValue = orders
      .filter((order) => order.status === "DONE")
      .reduce((sum, order) => sum + order.totalAmount, 0);

    return {
      total: ordersQuery.data?.totalElements ?? 0,
      awaitingConfirmation,
      inDelivery,
      completedValue,
    };
  }, [orders, ordersQuery.data?.totalElements]);

  const columns: DataTableColumn<OrderSummary>[] = [
    {
      key: "order",
      header: "Order",
      cell: (order) => (
        <div className="space-y-1">
          <p className="font-semibold text-foreground">#{order.id}</p>
          <p className="text-xs text-muted-foreground">Placed {formatDate(order.createdAt)}</p>
        </div>
      ),
      skeletonClassName: "max-w-[7rem]",
    },
    {
      key: "status",
      header: "Status",
      cell: (order) => <OrderStatusBadge status={order.status} />,
      cellClassName: "w-[10rem]",
      skeletonClassName: "max-w-[7rem]",
    },
    {
      key: "amount",
      header: "Total amount",
      cell: (order) => (
        <span className="font-semibold text-foreground">{formatCurrency(order.totalAmount)}</span>
      ),
      cellClassName: "w-[11rem]",
      skeletonClassName: "max-w-[7rem]",
    },
    {
      key: "shipping",
      header: "Shipping address",
      cell: (order) => (
        <p className="max-w-[20rem] truncate text-sm text-muted-foreground" title={order.shippingAddress}>
          {order.shippingAddress}
        </p>
      ),
      skeletonClassName: "max-w-[14rem]",
    },
    {
      key: "actions",
      header: "Actions",
      headerClassName: "text-right",
      cellClassName: "w-[10rem] text-right",
      cell: (order) => (
        <Button
          render={<Link href={`/admin/orders/${order.id}`} />}
          nativeButton={false}
          variant="outline"
          size="sm"
          className="rounded-full"
        >
          Review
          <ArrowRight className="size-3.5" />
        </Button>
      ),
      skeletonClassName: "ml-auto max-w-[6rem]",
    },
  ];

  return (
    <div className="space-y-6">
      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.4fr)_repeat(3,minmax(0,1fr))]">
        <div className="rounded-[28px] border border-border/80 bg-gradient-to-br from-primary/8 via-background to-sky-50/40 px-5 py-6 shadow-soft sm:px-6">
          <Badge className="rounded-full bg-white/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">
            Fulfillment queue
          </Badge>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-foreground">
            Order management
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Review payment progress, keep shipping transitions disciplined, and avoid jumping orders into states the backend will reject.
          </p>
        </div>

        <div className="rounded-[28px] border border-border/80 bg-background px-5 py-6 shadow-soft sm:px-6">
          <div className="flex items-center gap-3">
            <span className="flex size-11 items-center justify-center rounded-2xl bg-primary/8 text-primary">
              <FolderKanban className="size-5" />
            </span>
            <div>
              <p className="text-sm text-muted-foreground">Matching orders</p>
              <p className="text-3xl font-semibold tracking-tight text-foreground">{summary.total}</p>
            </div>
          </div>
        </div>

        <div className="rounded-[28px] border border-border/80 bg-background px-5 py-6 shadow-soft sm:px-6">
          <div className="flex items-center gap-3">
            <span className="flex size-11 items-center justify-center rounded-2xl bg-amber-50 text-amber-700">
              <BadgeCheck className="size-5" />
            </span>
            <div>
              <p className="text-sm text-muted-foreground">Awaiting confirmation</p>
              <p className="text-3xl font-semibold tracking-tight text-foreground">
                {summary.awaitingConfirmation}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-[28px] border border-border/80 bg-background px-5 py-6 shadow-soft sm:px-6">
          <div className="flex items-center gap-3">
            <span className="flex size-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
              <CircleDollarSign className="size-5" />
            </span>
            <div>
              <p className="text-sm text-muted-foreground">Completed GMV in result set</p>
              <p className="text-xl font-semibold tracking-tight text-foreground">
                {formatCurrency(summary.completedValue)}
              </p>
            </div>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            {summary.inDelivery} orders currently in confirmation or shipping.
          </p>
        </div>
      </section>

      <DataTable
        title="Order queue"
        description="Filter by lifecycle stage and date range, then open the detail page for safe status progression."
        columns={columns}
        data={orders}
        isLoading={ordersQuery.isLoading}
        emptyTitle={ordersQuery.error ? "Could not load orders" : "No matching orders"}
        emptyDescription={
          ordersQuery.error
            ? getErrorMessage(ordersQuery.error, "Please try again in a moment.")
            : "Adjust the filters or date range to review a different slice of the order pipeline."
        }
        pagination={{
          page: ordersQuery.data?.page ?? 0,
          size: ordersQuery.data?.size ?? ORDER_PAGE_SIZE,
          totalElements: ordersQuery.data?.totalElements ?? 0,
          totalPages: ordersQuery.data?.totalPages ?? 0,
          onPageChange: (nextPage) => setPage(nextPage + 1),
          itemLabel: "orders",
          isDisabled: ordersQuery.isFetching,
        }}
        toolbar={
          <>
            <Select
              value={statusFilter}
              onValueChange={(value) => setStatusFilter(value as OrderStatusFilter)}
            >
              <SelectTrigger className="h-11 min-w-44 rounded-full bg-background">
                <span className="truncate text-left">
                  {STATUS_OPTIONS.find((option) => option.value === statusFilter)?.label}
                </span>
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex min-w-[13rem] items-center gap-2 rounded-full border border-border/70 bg-background px-3">
              <CalendarRange className="size-4 text-muted-foreground" />
              <Input
                type="date"
                value={fromDate}
                onChange={(event) => setFromDate(event.target.value)}
                className="h-11 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
              />
            </div>

            <div className="flex min-w-[13rem] items-center gap-2 rounded-full border border-border/70 bg-background px-3">
              <Truck className="size-4 text-muted-foreground" />
              <Input
                type="date"
                value={toDate}
                min={fromDate || undefined}
                onChange={(event) => setToDate(event.target.value)}
                className="h-11 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
              />
            </div>
          </>
        }
      />
    </div>
  );
}
