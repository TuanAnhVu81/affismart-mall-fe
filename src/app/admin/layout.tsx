import Link from "next/link";
import type { Metadata } from "next";
import { ShieldCheck } from "lucide-react";
import type { PropsWithChildren } from "react";
import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { StorefrontNav } from "@/components/layout/StorefrontNav";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Admin Control Room",
  description:
    "Manage AffiSmart Mall catalog, orders, analytics, affiliates, users, payouts, and inventory operations.",
  path: "/admin/dashboard",
  noIndex: true,
});

export default function AdminLayout({ children }: PropsWithChildren) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-20 border-b border-border/80 bg-[rgba(248,250,252,0.95)] backdrop-blur-md">
        <div className="mx-auto flex h-[4.75rem] w-full items-center justify-between px-4 sm:px-6">
          <Link href="/admin/dashboard" className="inline-flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl border border-border bg-primary/8 text-primary shadow-soft">
              <ShieldCheck className="size-5" />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                Admin Panel
              </p>
              <p className="text-sm font-bold tracking-tight text-foreground sm:text-lg">
                AffiSmart Control Room
              </p>
            </div>
          </Link>

          <StorefrontNav />
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-[1500px] flex-1 flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8 lg:flex-row lg:items-start lg:gap-8">
        <AdminSidebar />
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
