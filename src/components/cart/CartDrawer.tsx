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

const FREE_SHIPPING_THRESHOLD = 500000; // 500k VNĐ

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
            <div className="flex size-16 items-center justify-center rounded-3xl border border-border/80 bg-muted/30 text-muted-foreground ring-1 ring-border/20 shadow-soft">
              <ShoppingBag className="size-6" />
            </div>
            <div>
              <p className="text-xl font-semibold tracking-tight text-foreground">
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
            <div className="space-y-3 bg-muted/10 px-5 py-4">
              {totalPrice >= FREE_SHIPPING_THRESHOLD ? (
                <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-center text-sm font-medium text-emerald-600">
                  {/* eslint-disable-next-line react/no-unescaped-entities */}
                  🎉 You've got free shipping!
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-center text-sm text-muted-foreground">
                    Buy <span className="font-semibold text-foreground">{formatCurrency(FREE_SHIPPING_THRESHOLD - totalPrice)}</span> more for <span className="font-semibold">Free Shipping</span>
                  </p>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div 
                      className="h-full bg-primary transition-all duration-500 ease-out" 
                      style={{ width: `${Math.min((totalPrice / FREE_SHIPPING_THRESHOLD) * 100, 100)}%` }} 
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
              {items.map((item) => (
                <CartItem key={item.productId} item={item} />
              ))}
            </div>

            <div className="space-y-4 border-t border-border/80 bg-background px-5 py-5 shadow-[0_-10px_20px_rgba(0,0,0,0.02)]">
              <div className="flex items-center justify-between text-base px-1">
                <span className="font-medium text-muted-foreground">Total</span>
                <span className="text-xl font-semibold text-foreground">
                  {formatCurrency(totalPrice)}
                </span>
              </div>

              <div className="grid gap-2 outline-none">
                <Button
                  render={<Link href="/checkout" />}
                  className="w-full shadow-sm"
                  size="lg"
                  onClick={closeDrawer}
                  nativeButton={false}
                >
                  Proceed to Checkout
                </Button>
                <Button
                  variant="ghost"
                  className="w-full text-muted-foreground hover:bg-muted/50"
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
