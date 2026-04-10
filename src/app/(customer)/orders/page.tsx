"use client";

import Link from "next/link";
import axios from "axios";
import { ArrowRight, PackageSearch, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useMyOrders } from "@/hooks/useOrders";
import { OrderCard } from "@/components/order/OrderCard";

interface ApiErrorResponse {
  message?: string;
}

const getOrdersErrorMessage = (error: unknown) => {
  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    return (
      error.response?.data?.message ??
      "Could not load your orders at the moment."
    );
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Could not load your orders at the moment.";
};

export default function OrdersPage() {
  const ordersQuery = useMyOrders({
    page: 0,
    size: 20,
    sortBy: "created_at",
    sortDir: "desc",
  });

  const orders = ordersQuery.data?.content ?? [];

  return (
    <div className="space-y-6 py-8 sm:py-10">
      <section className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          My orders
        </h1>
        <p className="text-sm text-muted-foreground sm:text-base">
          Track order progress, verify delivery status, and review past purchases.
        </p>
      </section>

      {ordersQuery.isLoading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <Card key={index} className="border border-border/70 bg-card/90 p-4">
              <div className="space-y-3">
                <Skeleton className="h-5 w-36" />
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-16 w-full rounded-xl" />
                <Skeleton className="h-10 w-full rounded-lg" />
              </div>
            </Card>
          ))}
        </div>
      ) : null}

      {ordersQuery.isError ? (
        <Card className="border border-border/80 bg-card/90 shadow-soft">
          <CardContent className="space-y-4 px-6 py-8 text-center">
            <p className="text-base font-semibold text-foreground">
              Unable to load orders
            </p>
            <p className="text-sm text-muted-foreground">
              {getOrdersErrorMessage(ordersQuery.error)}
            </p>
            <Button onClick={() => ordersQuery.refetch()}>
              <RotateCcw className="size-4" />
              Try again
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {!ordersQuery.isLoading && !ordersQuery.isError && orders.length === 0 ? (
        <Card className="border border-border/80 bg-card/90 shadow-soft">
          <CardContent className="flex flex-col items-center gap-4 px-6 py-10 text-center">
            <span className="rounded-full border border-border bg-muted/40 p-3 text-muted-foreground">
              <PackageSearch className="size-5" />
            </span>
            <div className="space-y-1">
              <p className="text-xl font-semibold text-foreground">
                No orders yet
              </p>
              <p className="text-sm text-muted-foreground">
                Once you complete checkout, your order history will appear here.
              </p>
            </div>
            <Button render={<Link href="/products" />}>
              Browse products
              <ArrowRight className="size-4" />
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {!ordersQuery.isLoading && !ordersQuery.isError && orders.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      ) : null}
    </div>
  );
}

