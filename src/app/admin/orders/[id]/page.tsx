"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { useEffect, useMemo } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  BadgeCheck,
  Loader2,
  MapPin,
  PackageCheck,
  Route,
  Truck,
} from "lucide-react";
import { toast } from "sonner";
import { OrderStatusBadge } from "@/components/order/OrderStatusBadge";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { useAdminOrderDetail, useUpdateAdminOrderStatus } from "@/hooks/useAdmin";
import {
  adminOrderStatusUpdateSchema,
  type AdminOrderStatusUpdateFormValues,
} from "@/lib/validators";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { OrderStatus } from "@/types/order.types";

interface ApiErrorResponse {
  message?: string;
}

const STATUS_GUIDANCE: Record<
  OrderStatus,
  { title: string; description: string; nextStatus?: OrderStatus }
> = {
  PENDING: {
    title: "Waiting for payment confirmation",
    description:
      "This order is still pending payment. Admin cannot move it forward until the payment flow completes and the backend marks it as paid.",
  },
  PAID: {
    title: "Ready for manual confirmation",
    description:
      "Payment is recorded. The next valid admin action is to confirm fulfillment readiness.",
    nextStatus: "CONFIRMED",
  },
  CONFIRMED: {
    title: "Ready to hand over for shipping",
    description:
      "The order has been confirmed internally and can now move to the shipping stage.",
    nextStatus: "SHIPPED",
  },
  SHIPPED: {
    title: "Ready to close as delivered",
    description:
      "Use this only when delivery has actually completed, because this step unlocks downstream commission approval logic in the backend.",
    nextStatus: "DONE",
  },
  DONE: {
    title: "Order lifecycle completed",
    description:
      "This order is already completed. No further admin transition is allowed.",
  },
  CANCELLED: {
    title: "Order is cancelled",
    description:
      "Cancelled orders are locked and cannot be progressed by admin actions anymore.",
  },
};

const NEXT_STATUS_LABELS: Record<Extract<OrderStatus, "CONFIRMED" | "SHIPPED" | "DONE">, string> = {
  CONFIRMED: "Confirm order",
  SHIPPED: "Mark as shipped",
  DONE: "Mark as completed",
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

export default function AdminOrderDetailPage() {
  const params = useParams<{ id: string }>();
  const orderId = Number(params.id);
  const orderQuery = useAdminOrderDetail(Number.isFinite(orderId) ? orderId : null);
  const updateStatusMutation = useUpdateAdminOrderStatus();

  const form = useForm<AdminOrderStatusUpdateFormValues>({
    resolver: zodResolver(adminOrderStatusUpdateSchema),
    defaultValues: {
      status: "CONFIRMED",
    },
  });

  const order = orderQuery.data;
  const currentStatus = order?.status;
  const guidance = currentStatus ? STATUS_GUIDANCE[currentStatus] : null;
  const nextStatus = guidance?.nextStatus;

  useEffect(() => {
    if (nextStatus && ["CONFIRMED", "SHIPPED", "DONE"].includes(nextStatus)) {
      form.reset({ status: nextStatus as AdminOrderStatusUpdateFormValues["status"] });
    }
  }, [form, nextStatus]);

  const itemSummary = useMemo(() => {
    const itemCount = order?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0;
    return {
      itemCount,
      skuCount: new Set(order?.items.map((item) => item.productSku || item.productId)).size,
    };
  }, [order?.items]);

  if (!Number.isInteger(orderId) || orderId <= 0) {
    return (
      <div className="rounded-[28px] border border-border/80 bg-background px-6 py-10 shadow-soft">
        <div className="flex flex-col items-start gap-4">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
            <AlertTriangle className="size-6" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              Invalid order identifier
            </h1>
            <p className="max-w-xl text-sm leading-6 text-muted-foreground">
              The order id in this URL is not valid. Return to the orders list and open a valid record from there.
            </p>
          </div>
          <Button render={<Link href="/admin/orders" />} nativeButton={false} className="rounded-full">
            <ArrowLeft className="size-4" />
            Back to orders
          </Button>
        </div>
      </div>
    );
  }

  if (orderQuery.isLoading) {
    return (
      <div className="flex min-h-[420px] items-center justify-center rounded-[28px] border border-border/80 bg-background shadow-soft">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!order || orderQuery.error) {
    return (
      <div className="rounded-[28px] border border-border/80 bg-background px-6 py-10 shadow-soft">
        <div className="flex flex-col items-start gap-4">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-700">
            <AlertTriangle className="size-6" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              Could not load order details
            </h1>
            <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
              {getErrorMessage(orderQuery.error, "Please try again or go back to the order list.")}
            </p>
          </div>
          <Button render={<Link href="/admin/orders" />} nativeButton={false} className="rounded-full">
            <ArrowLeft className="size-4" />
            Back to orders
          </Button>
        </div>
      </div>
    );
  }

  const handleSubmit = async (values: AdminOrderStatusUpdateFormValues) => {
    try {
      await updateStatusMutation.mutateAsync({
        orderId,
        payload: { status: values.status },
      });
      toast.success("Order status updated successfully.");
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to update order status."));
    }
  };

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-border/80 bg-gradient-to-br from-primary/8 via-background to-sky-50/40 px-5 py-6 shadow-soft sm:px-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-3">
            <Badge className="rounded-full bg-white/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">
              Order review
            </Badge>
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-foreground">
                Order #{order.id}
              </h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
                Review order contents, shipping address, and allowed lifecycle transitions before moving the order forward.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <OrderStatusBadge status={order.status} />
            <Button
              render={<Link href="/admin/dashboard" />}
              nativeButton={false}
              variant="outline"
              className="rounded-full bg-background/90"
            >
              Dashboard
            </Button>
            <Button
              render={<Link href="/admin/orders" />}
              nativeButton={false}
              variant="outline"
              className="rounded-full bg-background/90"
            >
              <ArrowLeft className="size-4" />
              Back to orders
            </Button>
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-4">
        <Card className="rounded-[28px] border border-border/80 bg-background py-0 shadow-soft">
          <CardHeader className="px-5 pt-5">
            <CardTitle>Total amount</CardTitle>
            <CardDescription>Current order value.</CardDescription>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            <p className="text-3xl font-semibold tracking-tight text-foreground">
              {formatCurrency(order.totalAmount)}
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-[28px] border border-border/80 bg-background py-0 shadow-soft">
          <CardHeader className="px-5 pt-5">
            <CardTitle>Discount</CardTitle>
            <CardDescription>Reduction applied to this order.</CardDescription>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            <p className="text-3xl font-semibold tracking-tight text-foreground">
              {formatCurrency(order.discountAmount)}
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-[28px] border border-border/80 bg-background py-0 shadow-soft">
          <CardHeader className="px-5 pt-5">
            <CardTitle>Items</CardTitle>
            <CardDescription>Total quantity across line items.</CardDescription>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            <p className="text-3xl font-semibold tracking-tight text-foreground">
              {itemSummary.itemCount}
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              {itemSummary.skuCount} unique products in this order.
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-[28px] border border-border/80 bg-background py-0 shadow-soft">
          <CardHeader className="px-5 pt-5">
            <CardTitle>Placed on</CardTitle>
            <CardDescription>Original order creation date.</CardDescription>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            <p className="text-lg font-semibold tracking-tight text-foreground">
              {formatDate(order.createdAt)}
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              Last updated {formatDate(order.updatedAt)}
            </p>
          </CardContent>
        </Card>
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_22rem]">
        <div className="space-y-6">
          <Card className="rounded-[28px] border border-border/80 bg-background py-0 shadow-soft">
            <CardHeader className="border-b border-border/70 px-5 py-5">
              <CardTitle>Order items</CardTitle>
              <CardDescription>
                Verify SKUs, quantities, and line totals before changing fulfillment status.
              </CardDescription>
            </CardHeader>

            <CardContent className="bg-muted/[0.12] p-4 sm:p-5">
              <div className="space-y-4 md:hidden">
                {order.items.map((item) => (
                  <div
                    key={`${item.productId}-${item.productSku ?? "sku"}`}
                    className="rounded-3xl border border-border/80 bg-background p-4 shadow-[0_18px_40px_-32px_rgba(15,23,42,0.28)]"
                  >
                    <div className="space-y-1">
                      <p className="font-semibold text-foreground">{item.productName}</p>
                      <p className="text-xs text-muted-foreground">
                        SKU: {item.productSku || "No SKU"}
                      </p>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                      <div className="rounded-xl bg-muted/20 p-3">
                        <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                          Quantity
                        </p>
                        <p className="mt-1 font-semibold text-foreground">{item.quantity}</p>
                      </div>
                      <div className="rounded-xl bg-muted/20 p-3">
                        <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                          Unit price
                        </p>
                        <p className="mt-1 font-semibold text-foreground">
                          {formatCurrency(item.priceAtTime)}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 rounded-xl border border-border/70 bg-muted/10 p-3">
                      <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                        Line total
                      </p>
                      <p className="mt-1 text-base font-semibold text-foreground">
                        {formatCurrency(item.lineTotal)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="hidden space-y-3 md:block">
                {order.items.map((item) => (
                  <div
                    key={`${item.productId}-${item.productSku ?? "sku"}`}
                    className="rounded-[26px] border border-border/75 bg-background p-4 shadow-[0_20px_44px_-34px_rgba(15,23,42,0.22)] transition-colors hover:border-primary/15 hover:bg-primary/[0.025]"
                  >
                    <div className="grid gap-3">
                      <div className="grid min-w-0 gap-3 lg:grid-cols-[minmax(0,1.5fr)_minmax(16rem,1fr)]">
                        <div className="min-w-0 rounded-2xl border border-border/70 bg-muted/[0.16] px-4 py-3">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                            Product
                          </p>
                          <p className="mt-2 break-words text-base font-semibold leading-6 text-foreground">
                            {item.productName}
                          </p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            Product #{item.productId}
                          </p>
                        </div>

                        <div className="min-w-0 rounded-2xl border border-border/70 bg-muted/[0.12] px-4 py-3">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                            SKU
                          </p>
                          <p className="mt-2 break-all text-sm font-medium text-foreground">
                            {item.productSku || "No SKU"}
                          </p>
                        </div>
                      </div>

                      <div className="grid gap-3 lg:grid-cols-3">
                        <div className="rounded-2xl border border-border/70 bg-muted/[0.12] px-4 py-3 text-center">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                            Qty
                          </p>
                          <p className="mt-3 text-2xl font-semibold tracking-tight text-foreground">
                            {item.quantity}
                          </p>
                        </div>

                        <div className="rounded-2xl border border-border/70 bg-muted/[0.12] px-4 py-3 text-right">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                            Unit price
                          </p>
                          <p className="mt-3 text-lg font-semibold tracking-tight text-foreground">
                            {formatCurrency(item.priceAtTime)}
                          </p>
                        </div>

                        <div className="rounded-2xl border border-primary/15 bg-primary/[0.045] px-4 py-3 text-right">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary/70">
                            Line total
                          </p>
                          <p className="mt-3 text-xl font-semibold tracking-tight text-foreground">
                            {formatCurrency(item.lineTotal)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="rounded-[28px] border border-border/80 bg-background py-0 shadow-soft">
            <CardHeader className="border-b border-border/70 px-5 py-5">
              <CardTitle>Shipping address</CardTitle>
              <CardDescription>Destination used at checkout time.</CardDescription>
            </CardHeader>
            <CardContent className="px-5 py-5">
              <div className="flex items-start gap-3 rounded-2xl border border-border/70 bg-muted/15 p-4">
                <span className="mt-0.5 flex size-10 items-center justify-center rounded-2xl bg-primary/8 text-primary">
                  <MapPin className="size-4" />
                </span>
                <p className="text-sm leading-6 text-foreground">{order.shippingAddress}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[28px] border border-border/80 bg-background py-0 shadow-soft">
            <CardHeader className="border-b border-border/70 px-5 py-5">
              <CardTitle>Allowed next action</CardTitle>
              <CardDescription>
                This panel only exposes transitions the backend will actually accept.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5 px-5 py-5">
              <div className="rounded-2xl border border-primary/10 bg-primary/5 p-4">
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 flex size-10 items-center justify-center rounded-2xl bg-white text-primary shadow-sm">
                    <Route className="size-4" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{guidance?.title}</p>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      {guidance?.description}
                    </p>
                  </div>
                </div>
              </div>

              {nextStatus ? (
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Next order status</label>
                    <Controller
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger className="h-11 w-full rounded-xl bg-background">
                            <span className="truncate text-left">
                              {NEXT_STATUS_LABELS[field.value]}
                            </span>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={nextStatus}>{NEXT_STATUS_LABELS[nextStatus]}</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {form.formState.errors.status ? (
                      <p className="text-sm text-destructive">
                        {form.formState.errors.status.message}
                      </p>
                    ) : (
                      <p className="text-xs text-muted-foreground">
                        The backend only allows this exact next step from the current order status.
                      </p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    className="h-11 w-full rounded-full shadow-sm"
                    disabled={updateStatusMutation.isPending}
                  >
                    {updateStatusMutation.isPending ? (
                      <>
                        <Loader2 className="size-4 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <PackageCheck className="size-4" />
                        {NEXT_STATUS_LABELS[nextStatus]}
                      </>
                    )}
                  </Button>
                </form>
              ) : (
                <div className="rounded-2xl border border-border/70 bg-muted/15 p-4 text-sm leading-6 text-muted-foreground">
                  No manual admin transition is available for this order right now.
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-[28px] border border-border/80 bg-background py-0 shadow-soft">
            <CardHeader className="border-b border-border/70 px-5 py-5">
              <CardTitle>Operational reminders</CardTitle>
            </CardHeader>
            <CardContent className="px-5 py-5">
              <div className="space-y-3">
                <div className="grid gap-3 rounded-2xl border border-border/70 bg-muted/10 p-4 sm:grid-cols-[2.75rem_minmax(0,1fr)] sm:items-start">
                  <span className="flex size-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 shadow-sm">
                    <BadgeCheck className="size-4" />
                  </span>
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-foreground">Move to CONFIRMED</p>
                    <p className="text-sm leading-6 text-muted-foreground">
                      Only after internal validation confirms payment, stock, and fulfillment readiness.
                    </p>
                  </div>
                </div>

                <div className="grid gap-3 rounded-2xl border border-border/70 bg-muted/10 p-4 sm:grid-cols-[2.75rem_minmax(0,1fr)] sm:items-start">
                  <span className="flex size-11 items-center justify-center rounded-2xl bg-sky-50 text-sky-700 shadow-sm">
                    <Truck className="size-4" />
                  </span>
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-foreground">Move to SHIPPED</p>
                    <p className="text-sm leading-6 text-muted-foreground">
                      Use this only when the parcel has actually been handed over to the shipping carrier.
                    </p>
                  </div>
                </div>

                <div className="grid gap-3 rounded-2xl border border-border/70 bg-muted/10 p-4 sm:grid-cols-[2.75rem_minmax(0,1fr)] sm:items-start">
                  <span className="flex size-11 items-center justify-center rounded-2xl bg-primary/8 text-primary shadow-sm">
                    <PackageCheck className="size-4" />
                  </span>
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-foreground">Move to DONE</p>
                    <p className="text-sm leading-6 text-muted-foreground">
                      Only after delivery completion, because affiliate commission approval is triggered downstream.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
