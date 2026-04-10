import Link from "next/link";
import { ChevronRight, MapPin, Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { OrderSummary } from "@/types/order.types";
import { OrderStatusBadge } from "./OrderStatusBadge";

interface OrderCardProps {
  order: OrderSummary;
}

export function OrderCard({ order }: OrderCardProps) {
  return (
    <Card className="border border-border/80 bg-card/90 shadow-soft">
      <CardHeader className="border-b border-border/70 pb-4">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <CardTitle className="text-lg">Order #{order.id}</CardTitle>
            <CardDescription className="inline-flex items-center gap-1.5 text-xs">
              <Receipt className="size-3.5" />
              Placed on {formatDate(order.createdAt)}
            </CardDescription>
          </div>
          <OrderStatusBadge status={order.status} />
        </div>
      </CardHeader>

      <CardContent className="space-y-3 pt-4">
        <div className="rounded-xl border border-border/70 bg-background/70 p-3">
          <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
            Total amount
          </p>
          <p className="mt-1 text-xl font-semibold text-foreground">
            {formatCurrency(order.totalAmount)}
          </p>
        </div>
        <p className="inline-flex items-start gap-1.5 text-sm text-muted-foreground">
          <MapPin className="mt-0.5 size-4 shrink-0 text-primary" />
          <span className="line-clamp-2">{order.shippingAddress}</span>
        </p>
      </CardContent>

      <CardFooter className="border-t border-border/70 bg-muted/20">
        <Button
          render={<Link href={`/orders/${order.id}`} />}
          variant="outline"
          className="w-full"
        >
          View details
          <ChevronRight className="size-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}

