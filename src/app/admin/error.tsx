"use client";

import Link from "next/link";
import { AlertTriangle, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AdminErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function AdminError({ error, reset }: AdminErrorProps) {
  return (
    <section className="rounded-[28px] border border-border/80 bg-background px-6 py-10 shadow-soft">
      <div className="flex max-w-2xl flex-col items-start gap-5">
        <span className="flex size-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
          <AlertTriangle className="size-6" />
        </span>
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Admin workspace could not load
          </h1>
          <p className="text-sm leading-6 text-muted-foreground">
            Something interrupted this admin screen. You can retry the request or return to
            the dashboard to continue from a stable place.
          </p>
          {error.digest ? (
            <p className="text-xs text-muted-foreground">Error digest: {error.digest}</p>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-3">
          <Button type="button" className="rounded-full" onClick={reset}>
            <RefreshCcw className="size-4" />
            Try again
          </Button>
          <Button
            render={<Link href="/admin/dashboard" />}
            nativeButton={false}
            variant="outline"
            className="rounded-full"
          >
            Back to dashboard
          </Button>
        </div>
      </div>
    </section>
  );
}
