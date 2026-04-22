"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FolderKanban,
  LayoutDashboard,
  PackageSearch,
  ShieldCheck,
  Tags,
  Users,
  WalletCards,
  Ban,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type AdminNavItem = {
  href?: string;
  label: string;
  icon: typeof LayoutDashboard;
  description: string;
  soon?: boolean;
};

const adminNavItems: AdminNavItem[] = [
  {
    href: "/admin/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    description: "Analytics and low-stock watchlist",
  },
  {
    href: "/admin/products",
    label: "Products",
    icon: PackageSearch,
    description: "Manage catalog items and inventory",
  },
  {
    href: "/admin/categories",
    label: "Categories",
    icon: Tags,
    description: "Organize the storefront taxonomy",
  },
  {
    href: "/admin/orders",
    label: "Orders",
    icon: FolderKanban,
    description: "Review and update fulfillment flow",
  },
  {
    label: "Users",
    icon: Users,
    description: "Account status and password resets",
    soon: true,
  },
  {
    label: "Affiliates",
    icon: WalletCards,
    description: "Approvals, payouts, and commission rates",
    soon: true,
  },
  {
    label: "Blocked IPs",
    icon: Ban,
    description: "Fraud control and recovery actions",
    soon: true,
  },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-full lg:sticky lg:top-28 lg:w-[19rem] lg:self-start">
      <div className="overflow-hidden rounded-[28px] border border-border/80 bg-background shadow-soft">
        <div className="border-b border-border/70 bg-gradient-to-br from-primary/6 via-background to-emerald-50/50 px-5 py-5">
          <Badge className="rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-700">
            Admin Console
          </Badge>
          <h2 className="mt-4 text-2xl font-semibold tracking-tight text-foreground">
            Keep the storefront healthy
          </h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Products and categories are live-catalog controls, so every action should stay clear, safe, and reversible.
          </p>
        </div>

        <div className="space-y-2 p-4">
          {adminNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.href ? pathname.startsWith(item.href) : false;

            if (!item.href) {
              return (
                <div
                  key={item.label}
                  className="flex items-start gap-3 rounded-2xl border border-dashed border-border/70 bg-muted/15 px-4 py-3 opacity-75"
                >
                  <span className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-2xl border border-border/70 bg-background text-muted-foreground">
                    <Icon className="size-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-foreground">{item.label}</p>
                      {item.soon ? (
                        <Badge variant="outline" className="rounded-full px-2 py-0 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                          Soon
                        </Badge>
                      ) : null}
                    </div>
                    <p className="mt-1 text-xs leading-5 text-muted-foreground">{item.description}</p>
                  </div>
                </div>
              );
            }

            return (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  "group flex items-start gap-3 rounded-2xl border px-4 py-3 transition-all duration-200",
                  isActive
                    ? "border-primary/20 bg-primary text-primary-foreground shadow-soft"
                    : "border-border/70 bg-background hover:border-primary/15 hover:bg-primary/5",
                )}
              >
                <span
                  className={cn(
                    "mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-2xl border transition-colors",
                    isActive
                      ? "border-white/20 bg-white/12 text-white"
                      : "border-border/70 bg-muted/10 text-primary group-hover:border-primary/20 group-hover:bg-primary/8",
                  )}
                >
                  <Icon className="size-4" />
                </span>

                <div className="min-w-0 flex-1">
                  <p
                    className={cn(
                      "text-sm font-semibold",
                      isActive ? "text-primary-foreground" : "text-foreground",
                    )}
                  >
                    {item.label}
                  </p>
                  <p
                    className={cn(
                      "mt-1 text-xs leading-5",
                      isActive ? "text-primary-foreground/80" : "text-muted-foreground",
                    )}
                  >
                    {item.description}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="border-t border-border/70 bg-muted/15 px-5 py-4">
          <div className="flex items-start gap-3 rounded-2xl border border-emerald-200/80 bg-emerald-50/80 p-4">
            <span className="mt-0.5 flex size-9 items-center justify-center rounded-2xl bg-white text-emerald-600 shadow-sm">
              <ShieldCheck className="size-4" />
            </span>
            <div>
              <p className="text-sm font-semibold text-emerald-950">Production-safe defaults</p>
              <p className="mt-1 text-xs leading-5 text-emerald-900/75">
                Status changes stay explicit, while create and edit flows surface validations before they hit the backend.
              </p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
