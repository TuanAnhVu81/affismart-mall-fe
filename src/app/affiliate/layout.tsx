import Link from "next/link";
import type { Metadata } from "next";
import { LayoutDashboard } from "lucide-react";
import type { PropsWithChildren } from "react";
import { AffiliateSidebarNav } from "@/components/affiliate/AffiliateSidebarNav";
import { StorefrontNav } from "@/components/layout/StorefrontNav";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Affiliate Portal",
  description:
    "Track affiliate performance, referral links, commissions, and payout requests in AffiSmart Mall.",
  path: "/affiliate/dashboard",
  noIndex: true,
});

export default function AffiliateLayout({ children }: PropsWithChildren) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-20 border-b border-border/80 bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex h-[4.5rem] w-full items-center justify-between px-4 sm:px-6">
          <Link href="/affiliate/dashboard" className="inline-flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl border border-border bg-emerald-50 text-emerald-600 shadow-soft">
              <LayoutDashboard className="size-5" />
            </span>
            <span className="text-sm font-bold tracking-tight text-foreground sm:text-lg">
              Affiliate Portal
            </span>
          </Link>
          <StorefrontNav />
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8 lg:flex-row lg:items-start lg:gap-8">
        <AffiliateSidebarNav />
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
