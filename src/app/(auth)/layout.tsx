import Link from "next/link";
import type { PropsWithChildren } from "react";

export default function AuthLayout({ children }: PropsWithChildren) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div className="absolute inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_top,_rgba(79,70,229,0.18),_transparent_60%)]" />
      <div className="relative flex min-h-screen flex-col px-6 py-8 sm:px-10">
        <header className="mx-auto flex w-full max-w-6xl items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-3 text-sm font-medium text-foreground transition-opacity hover:opacity-80"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-base font-semibold text-primary-foreground shadow-soft">
              A
            </span>
            <span className="text-base font-semibold tracking-tight">
              AffiSmart Mall
            </span>
          </Link>
        </header>
        <main className="mx-auto flex w-full max-w-6xl flex-1 items-center justify-center py-10">
          {children}
        </main>
      </div>
    </div>
  );
}
