import { Badge } from "@/components/ui/badge";
import type { OrderStatus } from "@/types/order.types";

interface OrderStatusBadgeProps {
  status: OrderStatus;
}

const STATUS_STYLES: Record<OrderStatus, string> = {
  PENDING: "border-amber-200 bg-amber-50 text-amber-700",
  PAID: "border-indigo-200 bg-indigo-50 text-indigo-700",
  CONFIRMED: "border-sky-200 bg-sky-50 text-sky-700",
  SHIPPED: "border-blue-200 bg-blue-50 text-blue-700",
  DONE: "border-emerald-200 bg-emerald-50 text-emerald-700",
  CANCELLED: "border-rose-200 bg-rose-50 text-rose-700",
};

const STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: "Pending",
  PAID: "Paid",
  CONFIRMED: "Confirmed",
  SHIPPED: "Shipped",
  DONE: "Completed",
  CANCELLED: "Cancelled",
};

export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  return (
    <Badge variant="outline" className={STATUS_STYLES[status]}>
      {STATUS_LABELS[status]}
    </Badge>
  );
}

