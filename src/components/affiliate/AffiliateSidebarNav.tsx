"use client";

import Link from "next/link";
import { BadgeDollarSign, CopyPlus, LayoutDashboard, Wallet } from "lucide-react";
import { usePathname } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  {
    href: "/affiliate/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    href: "/affiliate/links",
    label: "Referral links",
    icon: CopyPlus,
  },
  {
    href: "/affiliate/commissions",
    label: "Commissions",
    icon: BadgeDollarSign,
  },
  {
    href: "/affiliate/payouts",
    label: "Payouts",
    icon: Wallet,
  },
];

export function AffiliateSidebarNav() {
  const pathname = usePathname();

  if (pathname === "/affiliate/pending") {
    return null;
  }

  return (
    <>
      <div className="mb-6 overflow-x-auto lg:hidden">
        <nav className="flex min-w-max gap-2 rounded-2xl border border-border/70 bg-card/90 p-2 shadow-sm">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "inline-flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm transition-all duration-200",
                  isActive
                    ? "bg-primary text-primary-foreground font-semibold shadow-md"
                    : "text-muted-foreground font-medium hover:bg-muted/80 hover:text-foreground",
                )}
              >
                <Icon className={cn("size-4", isActive ? "text-primary-foreground" : "text-muted-foreground")} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <aside className="sticky top-28 hidden w-[260px] shrink-0 lg:block">
        <nav className="overflow-hidden rounded-[1.75rem] border border-border/60 bg-card/95 shadow-sm">
          <div className="border-b border-border/60 bg-gradient-to-br from-emerald-50 via-background to-background px-5 py-5">
            <Badge
              variant="outline"
              className="mb-3 rounded-full border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-700"
            >
              Personal portal
            </Badge>
            <p className="text-sm font-semibold text-foreground">
              All affiliate tools in one place
            </p>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              Manage links, monitor commissions, and request payouts from your partner workspace.
            </p>
          </div>

          <div className="flex flex-col gap-1.5 px-3 py-4">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "group flex items-center gap-3 rounded-2xl px-4 py-3.5 text-sm transition-all duration-300",
                    isActive
                      ? "bg-gradient-to-r from-primary to-[var(--primary-hover)] text-primary-foreground font-semibold shadow-md"
                      : "text-muted-foreground font-medium hover:bg-muted/80 hover:text-foreground",
                  )}
                >
                  <span
                    className={cn(
                      "inline-flex size-8 items-center justify-center rounded-xl border transition-colors",
                      isActive
                        ? "border-white/20 bg-white/10 text-primary-foreground"
                        : "border-border/70 bg-background text-muted-foreground group-hover:text-foreground",
                    )}
                  >
                    <Icon className="size-4 transition-colors" />
                  </span>
                  <span className="flex-1">{item.label}</span>
                </Link>
              );
            })}
          </div>

          <div className="border-t border-border/60 px-5 py-4">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground/70">
              Tip
            </p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Start with referral links if this is your first visit. That is the fastest way to generate clicks and unlock commission data.
            </p>
          </div>
        </nav>
      </aside>
    </>
  );
}
