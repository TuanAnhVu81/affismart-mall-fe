"use client";

import Link from "next/link";
import { AlertTriangle, Home, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <section className="w-full max-w-2xl rounded-[32px] border border-border/80 bg-card/90 p-6 text-center shadow-soft sm:p-10">
        <span className="mx-auto flex size-16 items-center justify-center rounded-3xl bg-destructive/10 text-destructive">
          <AlertTriangle className="size-7" />
        </span>
        <h1 className="mt-5 text-3xl font-semibold tracking-tight text-foreground">
          Something went wrong
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
          The app hit an unexpected error. Retry the current view, or return home
          and continue from a safe page.
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
            <Home className="size-4" />
            Go home
          </Button>
        </div>
      </section>
    </main>
  );
}
