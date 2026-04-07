"use client";

import Link from "next/link";
import { ShoppingBag, X } from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { useCartStore } from "@/store/cart.store";
import { CartItem } from "./CartItem";

export function CartDrawer() {
  const items = useCartStore((state) => state.items);
  const totalItems = useCartStore((state) => state.totalItems);
  const totalPrice = useCartStore((state) => state.totalPrice);
  const isDrawerOpen = useCartStore((state) => state.isDrawerOpen);
  const clearCart = useCartStore((state) => state.clearCart);
  const setDrawerOpen = useCartStore((state) => state.setDrawerOpen);
  const closeDrawer = useCartStore((state) => state.closeDrawer);

  return (
    <Dialog open={isDrawerOpen} onOpenChange={setDrawerOpen}>
      <DialogContent
        showCloseButton={false}
        className="left-auto right-0 top-0 h-dvh w-[min(100vw,26rem)] max-w-none -translate-x-0 -translate-y-0 rounded-none border-l border-border bg-background p-0 shadow-xl sm:max-w-none"
      >
        <DialogHeader className="space-y-1 border-b border-border/70 px-5 py-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <DialogTitle className="text-lg font-semibold">
                Your cart
              </DialogTitle>
              <DialogDescription className="mt-1 text-sm text-muted-foreground">
                {totalItems} item{totalItems === 1 ? "" : "s"} selected
              </DialogDescription>
            </div>

            <DialogClose
              render={<Button variant="ghost" size="icon-sm" aria-label="Close cart" />}
            >
              <X className="size-4" />
            </DialogClose>
          </div>
        </DialogHeader>

        {items.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-4 px-6 text-center">
            <div className="rounded-full border border-border bg-muted/40 p-3 text-muted-foreground">
              <ShoppingBag className="size-5" />
            </div>
            <div>
              <p className="text-base font-semibold text-foreground">
                Your cart is empty
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Add products to continue checkout.
              </p>
            </div>
            <DialogClose render={<Button variant="outline">Continue shopping</Button>} />
          </div>
        ) : (
          <>
            <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
              {items.map((item) => (
                <CartItem key={item.productId} item={item} />
              ))}
            </div>

            <div className="space-y-4 border-t border-border/70 bg-background px-5 py-4">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Total</span>
                <span className="text-lg font-semibold text-foreground">
                  {formatCurrency(totalPrice)}
                </span>
              </div>

              <div className="grid gap-2">
                <Button
                  render={<Link href="/checkout" />}
                  className="w-full"
                  onClick={closeDrawer}
                >
                  Checkout
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={clearCart}
                >
                  Clear cart
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

