import type { Metadata } from "next";
import Link from "next/link";
import { CircleAlert, RotateCcw, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { buildPageMetadata } from "@/lib/seo";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = buildPageMetadata({
  title: "Payment Cancelled | AffiSmart Mall",
  description:
    "Your payment was cancelled. You can return to checkout or continue browsing products.",
  path: "/payment/cancel",
  noIndex: true,
});

export default function PaymentCancelPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="relative overflow-hidden rounded-3xl border border-border/80 bg-card/90 shadow-soft">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(245,158,11,0.16),_transparent_55%)]" />

        <Card className="relative border-0 bg-transparent py-0 ring-0">
          <CardHeader className="items-center space-y-4 border-b border-border/70 py-8 text-center">
            <span className="rounded-full bg-amber-100 p-3 text-amber-600">
              <CircleAlert className="size-7" />
            </span>
            <div className="space-y-1">
              <CardTitle className="text-2xl sm:text-3xl">
                Payment cancelled
              </CardTitle>
              <CardDescription className="mx-auto max-w-lg text-sm sm:text-base">
                No worries. Your cart is still available and you can complete
                payment whenever you are ready.
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="grid gap-3 px-6 py-6 sm:px-8">
            <div className="rounded-xl border border-border/70 bg-background/70 p-3 text-sm text-muted-foreground">
              You can return to checkout to retry payment, or continue shopping
              to update your cart before placing an order again.
            </div>
          </CardContent>

          <CardFooter className="grid gap-2 border-t border-border/70 bg-muted/20 px-6 py-5 sm:grid-cols-2 sm:px-8">
            <Button render={<Link href="/checkout" />} className="w-full">
              <RotateCcw className="size-4" />
              Back to cart
            </Button>
            <Button
              render={<Link href="/products" />}
              variant="outline"
              className="w-full"
            >
              <ShoppingBag className="size-4" />
              Continue shopping
            </Button>
          </CardFooter>
        </Card>
      </div>
    </main>
  );
}
