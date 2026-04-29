"use client";

import Image from "next/image";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { ArrowLeft, CreditCard, Lock, MapPin, ShoppingBag } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { checkoutSchema, type CheckoutFormValues } from "@/lib/validators";
import { cn, formatCurrency } from "@/lib/utils";
import { useCreateOrder, useCreatePaymentSession } from "@/hooks/useOrders";
import { useCartStore } from "@/store/cart.store";

interface ApiErrorResponse {
  message?: string;
}

const REF_COOKIE_KEY = "ref_code";
const REF_STORAGE_KEY = "affismart_ref_code";

const getCheckoutErrorMessage = (error: unknown) => {
  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    return (
      error.response?.data?.message ??
      "Checkout failed. Please verify your information and try again."
    );
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Checkout failed. Please verify your information and try again.";
};

const readRefCodeCookie = () => {
  if (typeof document === "undefined") {
    return undefined;
  }

  const key = `${REF_COOKIE_KEY}=`;
  const cookie = document.cookie
    .split("; ")
    .find((entry) => entry.startsWith(key));

  if (!cookie) {
    return undefined;
  }

  const value = cookie.slice(key.length).trim();
  return value ? decodeURIComponent(value).toUpperCase() : undefined;
};

const readStoredRefCode = () => {
  if (typeof window === "undefined") {
    return undefined;
  }

  return (
    readRefCodeCookie() ??
    window.localStorage.getItem(REF_STORAGE_KEY)?.trim().toUpperCase() ??
    undefined
  );
};

export default function CheckoutPage() {
  const [refCode, setRefCode] = useState<string | undefined>(undefined);
  const items = useCartStore((state) => state.items);
  const totalItems = useCartStore((state) => state.totalItems);
  const totalPrice = useCartStore((state) => state.totalPrice);
  const closeDrawer = useCartStore((state) => state.closeDrawer);
  const createOrderMutation = useCreateOrder();
  const createPaymentSessionMutation = useCreatePaymentSession();

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      shippingAddress: "",
    },
    mode: "onTouched",
  });

  const isSubmitting =
    createOrderMutation.isPending || createPaymentSessionMutation.isPending;

  useEffect(() => {
    setRefCode(readStoredRefCode());
  }, []);

  const onSubmit = async (values: CheckoutFormValues) => {
    if (!items.length) {
      toast.error("Your cart is empty. Please add products before checkout.");
      return;
    }

    try {
      closeDrawer();
      const appliedRefCode = readStoredRefCode();
      setRefCode(appliedRefCode);

      const order = await createOrderMutation.mutateAsync({
        shippingAddress: values.shippingAddress,
        refCode: appliedRefCode,
        items: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
      });

      const paymentSession = await createPaymentSessionMutation.mutateAsync(
        order.orderId,
      );

      toast.success("Redirecting to secure payment...");

      if (typeof window !== "undefined") {
        window.location.href = paymentSession.paymentUrl;
      }
    } catch (error) {
      toast.error(getCheckoutErrorMessage(error));
    }
  };

  if (!items.length) {
    return (
      <div className="py-10">
        <Card className="mx-auto max-w-xl border border-border/80 bg-card/90 shadow-soft">
          <CardContent className="flex flex-col items-center gap-4 px-8 py-12 text-center">
            <span className="rounded-full border border-border bg-muted/50 p-3 text-muted-foreground">
              <ShoppingBag className="size-5" />
            </span>
            <div className="space-y-1">
              <p className="text-xl font-semibold text-foreground">
                Your cart is empty
              </p>
              <p className="text-sm text-muted-foreground">
                Add products to continue with secure checkout.
              </p>
            </div>
            <Button render={<Link href="/products" />}>Browse products</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 py-8 sm:py-10">
      <Button
        render={<Link href="/products" />}
        variant="ghost"
        className="w-fit px-0 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Continue shopping
      </Button>

      <section className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          Checkout
        </h1>
        <p className="text-sm text-muted-foreground sm:text-base">
          Confirm your shipping details and complete payment securely.
        </p>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
        <Card className="border border-border/80 bg-card/90 shadow-soft">
          <CardHeader className="border-b border-border/70 pb-4">
            <CardTitle className="inline-flex items-center gap-2 text-lg">
              <MapPin className="size-4 text-primary" />
              Shipping details
            </CardTitle>
            <CardDescription>
              Enter your delivery address exactly as your courier requires.
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-5">
            <form
              id="checkout-form"
              className="space-y-4"
              onSubmit={form.handleSubmit(onSubmit)}
            >
              <div className="space-y-2">
                <label
                  htmlFor="shippingAddress"
                  className="text-sm font-medium text-foreground"
                >
                  Full shipping address
                </label>
                <textarea
                  id="shippingAddress"
                  rows={5}
                  placeholder="House number, street, ward, district, city, province..."
                  className={cn(
                    "w-full rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
                    form.formState.errors.shippingAddress
                      ? "border-destructive focus-visible:border-destructive focus-visible:ring-destructive/20"
                      : "",
                  )}
                  {...form.register("shippingAddress")}
                />
                {form.formState.errors.shippingAddress ? (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.shippingAddress.message}
                  </p>
                ) : null}
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className="border border-border/80 bg-card/95 shadow-soft lg:sticky lg:top-24">
          <CardHeader className="border-b border-border/70 pb-4">
            <CardTitle className="inline-flex items-center gap-2 text-lg">
              <CreditCard className="size-4 text-primary" />
              Order summary
            </CardTitle>
            <CardDescription>
              {totalItems} item{totalItems === 1 ? "" : "s"} in your cart
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4 pt-5">
            <div className="max-h-72 space-y-3 overflow-y-auto pr-1">
              {items.map((item) => (
                <article
                  key={item.productId}
                  className="flex items-start gap-3 rounded-xl border border-border/70 bg-background/70 p-3"
                >
                  <div className="relative h-14 w-14 overflow-hidden rounded-lg border border-border/70 bg-muted/40">
                    {item.imageUrl ? (
                      <Image
                        src={item.imageUrl}
                        alt={item.name}
                        fill
                        unoptimized
                        className="object-cover"
                        sizes="56px"
                      />
                    ) : null}
                  </div>
                  <div className="min-w-0 flex-1 space-y-1">
                    <p className="line-clamp-2 text-sm font-medium text-foreground">
                      {item.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Qty {item.quantity}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-foreground">
                    {formatCurrency(item.price * item.quantity)}
                  </p>
                </article>
              ))}
            </div>

            <div className="rounded-xl border border-border/70 bg-background/70 p-3 text-sm">
              <div className="flex items-center justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span>{formatCurrency(totalPrice)}</span>
              </div>
              <div className="mt-1 flex items-center justify-between text-muted-foreground">
                <span>Shipping</span>
                <span>Calculated at payment</span>
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-border/70 pt-3 text-base font-semibold text-foreground">
                <span>Total</span>
                <span>{formatCurrency(totalPrice)}</span>
              </div>
            </div>

            {refCode ? (
              <p className="text-xs text-emerald-700">
                Affiliate code applied: <span className="font-semibold">{refCode}</span>
              </p>
            ) : null}
          </CardContent>

          <CardFooter className="flex-col gap-2">
            <Button
              type="submit"
              form="checkout-form"
              className="h-11 w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Processing..." : "Place order & continue payment"}
            </Button>
            <p className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
              <Lock className="size-3.5" />
              Payments are handled securely by our payment provider.
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
