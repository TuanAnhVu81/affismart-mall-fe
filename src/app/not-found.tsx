import Link from "next/link";
import { Home, SearchX, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFoundPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <section className="relative w-full max-w-3xl overflow-hidden rounded-[36px] border border-border/80 bg-card/90 p-6 text-center shadow-soft sm:p-12">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(79,70,229,0.15),_transparent_58%)]" />
        <div className="relative">
          <span className="mx-auto flex size-16 items-center justify-center rounded-3xl bg-primary/8 text-primary">
            <SearchX className="size-7" />
          </span>
          <p className="mt-5 text-sm font-semibold uppercase tracking-[0.24em] text-primary">
            404
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            This page could not be found
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
            The page may have moved, the link may be outdated, or the product is no longer
            available in the storefront.
          </p>
          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <Button
              render={<Link href="/" />}
              nativeButton={false}
              className="rounded-full"
            >
              <Home className="size-4" />
              Go home
            </Button>
            <Button
              render={<Link href="/products" />}
              nativeButton={false}
              variant="outline"
              className="rounded-full"
            >
              <ShoppingBag className="size-4" />
              Browse products
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
