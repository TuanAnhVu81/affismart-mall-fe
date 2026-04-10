"use client";

import Link from "next/link";
import axios from "axios";
import { useParams } from "next/navigation";
import { ArrowLeft, MapPin, PackageCheck, RotateCcw, XCircle } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { OrderStatusBadge } from "@/components/order/OrderStatusBadge";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useCancelOrder, useMyOrderDetail } from "@/hooks/useOrders";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { OrderStatus } from "@/types/order.types";

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

const canCancelOrder = (status: OrderStatus) =>
  status === "PENDING" || status === "PAID";

export default function OrderDetailPage() {
  const params = useParams<{ id: string }>();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const orderId = useMemo(() => {
    const parsed = Number(params.id);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
  }, [params.id]);

  const orderDetailQuery = useMyOrderDetail(orderId);
  const cancelOrderMutation = useCancelOrder();

  const handleCancelOrder = async () => {
    if (!orderId) {
      return;
    }

    try {
      await cancelOrderMutation.mutateAsync(orderId);
      setIsConfirmOpen(false);
      toast.success("Order cancelled successfully.");
      await orderDetailQuery.refetch();
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to cancel order."));
    }
  };

  if (!orderId) {
    return (
      <div className="py-10">
        <Card className="border border-border/80 bg-card/90 shadow-soft">
          <CardContent className="space-y-4 px-6 py-8 text-center">
            <p className="text-xl font-semibold text-foreground">Invalid order ID</p>
            <p className="text-sm text-muted-foreground">
              Please return to your order list and select a valid order.
            </p>
            <Button render={<Link href="/orders" />}>Back to my orders</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (orderDetailQuery.isLoading) {
    return (
      <div className="space-y-4 py-8">
        <Skeleton className="h-8 w-48" />
        <Card className="border border-border/70 bg-card/90 p-6">
          <div className="space-y-3">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-64" />
            <Skeleton className="h-28 w-full rounded-xl" />
          </div>
        </Card>
      </div>
    );
  }

  if (orderDetailQuery.isError || !orderDetailQuery.data) {
    return (
      <div className="py-10">
        <Card className="border border-border/80 bg-card/90 shadow-soft">
          <CardContent className="space-y-4 px-6 py-8 text-center">
            <p className="text-xl font-semibold text-foreground">
              Unable to load order detail
            </p>
            <p className="text-sm text-muted-foreground">
              {getErrorMessage(
                orderDetailQuery.error,
                "We could not retrieve this order right now.",
              )}
            </p>
            <div className="flex items-center justify-center gap-2">
              <Button onClick={() => orderDetailQuery.refetch()}>
                <RotateCcw className="size-4" />
                Retry
              </Button>
              <Button render={<Link href="/orders" />} variant="outline">
                Back to my orders
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const order = orderDetailQuery.data;
  const cancelable = canCancelOrder(order.status);

  return (
    <div className="space-y-6 py-8 sm:py-10">
      <Button
        render={<Link href="/orders" />}
        variant="ghost"
        className="w-fit px-0 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to my orders
      </Button>

      <Card className="border border-border/80 bg-card/90 shadow-soft">
        <CardHeader className="border-b border-border/70 pb-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-1">
              <CardTitle className="text-2xl">Order #{order.id}</CardTitle>
              <CardDescription className="text-sm">
                Placed on {formatDate(order.createdAt)}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <OrderStatusBadge status={order.status} />
              {cancelable ? (
                <Button
                  variant="outline"
                  className="border-rose-200 text-rose-700 hover:bg-rose-50"
                  onClick={() => setIsConfirmOpen(true)}
                  disabled={cancelOrderMutation.isPending}
                >
                  <XCircle className="size-4" />
                  Cancel order
                </Button>
              ) : null}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 pt-5">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-border/70 bg-background/70 p-3">
              <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                Total amount
              </p>
              <p className="mt-1 text-lg font-semibold text-foreground">
                {formatCurrency(order.totalAmount)}
              </p>
            </div>
            <div className="rounded-xl border border-border/70 bg-background/70 p-3">
              <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                Discount
              </p>
              <p className="mt-1 text-lg font-semibold text-foreground">
                {formatCurrency(order.discountAmount)}
              </p>
            </div>
            <div className="rounded-xl border border-border/70 bg-background/70 p-3">
              <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                Last updated
              </p>
              <p className="mt-1 text-sm font-medium text-foreground">
                {formatDate(order.updatedAt)}
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-border/70 bg-background/70 p-4">
            <p className="inline-flex items-start gap-2 text-sm text-muted-foreground">
              <MapPin className="mt-0.5 size-4 shrink-0 text-primary" />
              <span>{order.shippingAddress}</span>
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="inline-flex items-center gap-2 text-lg font-semibold text-foreground">
              <PackageCheck className="size-5 text-primary" />
              Items
            </h2>

            <Card className="border border-border/70 bg-background/90">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="px-4">Product</TableHead>
                      <TableHead>SKU</TableHead>
                      <TableHead className="text-right">Qty</TableHead>
                      <TableHead className="text-right">Unit price</TableHead>
                      <TableHead className="px-4 text-right">Line total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {order.items.map((item) => (
                      <TableRow key={item.productId}>
                        <TableCell className="px-4 font-medium text-foreground">
                          {item.productName}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {item.productSku || "-"}
                        </TableCell>
                        <TableCell className="text-right text-foreground">
                          {item.quantity}
                        </TableCell>
                        <TableCell className="text-right text-foreground">
                          {formatCurrency(item.priceAtTime)}
                        </TableCell>
                        <TableCell className="px-4 text-right font-medium text-foreground">
                          {formatCurrency(item.lineTotal)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={isConfirmOpen}
        onOpenChange={setIsConfirmOpen}
        title="Cancel this order?"
        description="This action cannot be undone. You can only cancel orders that are pending or already paid."
        confirmText="Confirm cancellation"
        cancelText="Keep order"
        isLoading={cancelOrderMutation.isPending}
        onConfirm={handleCancelOrder}
      />
    </div>
  );
}

