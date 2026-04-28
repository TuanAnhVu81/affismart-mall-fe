"use client";

import Link from "next/link";
import { AlertTriangle, RefreshCcw, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProductsErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ProductsError({ error, reset }: ProductsErrorProps) {
  return (
    <section className="mx-auto flex min-h-[32rem] max-w-3xl items-center px-4 py-12">
      <div className="w-full rounded-[32px] border border-border/80 bg-card/90 p-6 text-center shadow-soft sm:p-10">
        <span className="mx-auto flex size-16 items-center justify-center rounded-3xl bg-amber-50 text-amber-700">
          <AlertTriangle className="size-7" />
        </span>
        <h1 className="mt-5 text-3xl font-semibold tracking-tight text-foreground">
          Product catalog is temporarily unavailable
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
          We could not load the catalog data right now. Please retry, or return to the
          storefront while the catalog connection recovers.
        </p>
        {error.digest ? (
          <p className="mt-3 text-xs text-muted-foreground">Error digest: {error.digest}</p>
        ) : null}
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Button type="button" className="rounded-full" onClick={reset}>
            <RefreshCcw className="size-4" />
            Try again
          </Button>
          <Button
            render={<Link href="/" />}
            nativeButton={false}
            variant="outline"
            className="rounded-full"
          >
            <ShoppingBag className="size-4" />
            Back to storefront
          </Button>
        </div>
      </div>
    </section>
  );
}
