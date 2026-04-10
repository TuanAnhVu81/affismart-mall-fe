"use client";

import Link from "next/link";
import { CircleCheckBig, ReceiptText, ShieldCheck } from "lucide-react";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useCartStore } from "@/store/cart.store";

interface PaymentSuccessContentProps {
  orderId?: string;
}

export function PaymentSuccessContent({ orderId }: PaymentSuccessContentProps) {
  const clearCart = useCartStore((state) => state.clearCart);
  const closeDrawer = useCartStore((state) => state.closeDrawer);

  useEffect(() => {
    clearCart();
    closeDrawer();
  }, [clearCart, closeDrawer]);

  return (
    <div className="relative overflow-hidden rounded-3xl border border-border/80 bg-card/90 shadow-soft">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.18),_transparent_55%)]" />

      <Card className="relative border-0 bg-transparent py-0 ring-0">
        <CardHeader className="items-center space-y-4 border-b border-border/70 py-8 text-center">
          <span className="rounded-full bg-emerald-100 p-3 text-emerald-600">
            <CircleCheckBig className="size-7" />
          </span>
          <div className="space-y-1">
            <CardTitle className="text-2xl sm:text-3xl">
              Payment successful
            </CardTitle>
            <CardDescription className="mx-auto max-w-lg text-sm sm:text-base">
              Your order is confirmed. We are preparing your package and you can
              track it from your order history.
            </CardDescription>
          </div>
          {orderId ? (
            <div className="rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5 text-sm font-medium text-emerald-700">
              Order #{orderId}
            </div>
          ) : null}
        </CardHeader>

        <CardContent className="grid gap-3 px-6 py-6 sm:px-8">
          <div className="flex items-start gap-3 rounded-xl border border-border/70 bg-background/70 p-3">
            <ReceiptText className="mt-0.5 size-4 text-primary" />
            <p className="text-sm text-muted-foreground">
              A confirmation email will be sent shortly with order details and
              delivery updates.
            </p>
          </div>
          <div className="flex items-start gap-3 rounded-xl border border-border/70 bg-background/70 p-3">
            <ShieldCheck className="mt-0.5 size-4 text-primary" />
            <p className="text-sm text-muted-foreground">
              Payment verification and order status updates are handled securely
              by backend webhooks.
            </p>
          </div>
        </CardContent>

        <CardFooter className="grid gap-2 border-t border-border/70 bg-muted/20 px-6 py-5 sm:grid-cols-2 sm:px-8">
          <Button render={<Link href="/orders" />} className="w-full">
            View my orders
          </Button>
          <Button
            render={<Link href="/products" />}
            variant="outline"
            className="w-full"
          >
            Continue shopping
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

