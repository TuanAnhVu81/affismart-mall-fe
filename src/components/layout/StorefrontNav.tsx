"use client";

import Link from "next/link";
import { useMemo } from "react";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  LogOut,
  ShieldCheck,
  ShoppingBag,
  UserCircle2,
} from "lucide-react";
import { AffiliateRegisterDialog } from "@/components/affiliate/AffiliateRegisterDialog";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { useLogout } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth.store";
import { useCartStore } from "@/store/cart.store";

const getDisplayName = (fullName: string) => {
  const [firstName = "Account"] = fullName.trim().split(/\s+/);
  return firstName;
};

export function StorefrontNav() {
  const pathname = usePathname();
  const logoutMutation = useLogout();
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const totalItems = useCartStore((state) => state.totalItems);
  const openDrawer = useCartStore((state) => state.openDrawer);
  const userRoles = user?.roles ?? [];
  const isAdminRoute = pathname.startsWith("/admin");

  const displayName = useMemo(() => {
    if (!user?.fullName) {
      return "Account";
    }

    return getDisplayName(user.fullName);
  }, [user?.fullName]);
  const canAccessOrders = isAuthenticated && Boolean(user?.roles.includes("CUSTOMER"));
  const canApplyAffiliate =
    isAuthenticated &&
    Boolean(user) &&
    userRoles.includes("CUSTOMER") &&
    !userRoles.includes("AFFILIATE") &&
    !userRoles.includes("ADMIN") &&
    user?.affiliateStatus !== "PENDING";
  const canAccessAffiliatePortal =
    isAuthenticated && Boolean(user) && userRoles.includes("AFFILIATE");
  const canAccessAdminPanel =
    isAuthenticated && Boolean(user) && userRoles.includes("ADMIN");

  const handleLogout = () => {
    if (logoutMutation.isPending) {
      return;
    }

    logoutMutation.mutate();
  };

  const isActivePath = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);
  const isAffiliatePortalActive = pathname.startsWith("/affiliate");

  const navLinkClassName = (active: boolean) =>
    cn(
      "relative rounded-full px-3 py-1.5 text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      active
        ? "bg-background text-foreground shadow-sm"
        : "text-muted-foreground hover:text-foreground",
    );

  const utilityButtonClassName = (active = false) =>
    cn(
      "relative inline-flex h-10 items-center gap-1.5 rounded-full border px-3.5 text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      active
        ? "border-primary/30 bg-primary/8 text-primary shadow-sm"
        : "border-border/80 bg-background text-muted-foreground hover:text-foreground",
    );

  return (
    <nav className="flex flex-wrap items-center justify-end gap-2 sm:gap-3">
      <div className="flex items-center rounded-full border border-border/80 bg-muted/30 p-1">
        <Link
          href="/"
          className={navLinkClassName(isActivePath("/"))}
          aria-current={isActivePath("/") ? "page" : undefined}
        >
          Home
        </Link>
        <Link
          href="/products"
          className={navLinkClassName(isActivePath("/products"))}
          aria-current={isActivePath("/products") ? "page" : undefined}
        >
          Products
        </Link>
        {canAccessOrders ? (
          <Link
            href="/orders"
            className={navLinkClassName(isActivePath("/orders"))}
            aria-current={isActivePath("/orders") ? "page" : undefined}
          >
            Orders
          </Link>
        ) : null}
      </div>

      {canAccessAffiliatePortal ? (
        <Link
          href="/affiliate/dashboard"
          className={utilityButtonClassName(isAffiliatePortalActive)}
          aria-current={isAffiliatePortalActive ? "page" : undefined}
        >
          <LayoutDashboard
            className={cn(
              "size-4",
              isAffiliatePortalActive ? "text-primary" : "text-muted-foreground",
            )}
          />
          <span className="hidden sm:inline">
            {isAffiliatePortalActive ? "In affiliate portal" : "Affiliate portal"}
          </span>
          <span className="sm:hidden">Portal</span>
        </Link>
      ) : null}

      {canAccessAdminPanel ? (
        <Link
          href="/admin/dashboard"
          className={utilityButtonClassName(isAdminRoute)}
          aria-current={isAdminRoute ? "page" : undefined}
        >
          <ShieldCheck
            className={cn(
              "size-4",
              isAdminRoute ? "text-primary" : "text-muted-foreground",
            )}
          />
          <span className="hidden sm:inline">
            {isAdminRoute ? "In admin panel" : "Admin panel"}
          </span>
          <span className="sm:hidden">Admin</span>
        </Link>
      ) : null}

      {!isAdminRoute ? (
        <button
          type="button"
          onClick={openDrawer}
          className={utilityButtonClassName()}
          aria-label="Open cart"
        >
          <ShoppingBag className="size-4" />
          <span className="hidden sm:inline">Cart</span>
          {totalItems > 0 ? (
            <span className="absolute -right-1.5 -top-1.5 inline-flex min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[11px] font-semibold leading-5 text-primary-foreground">
              {totalItems > 99 ? "99+" : totalItems}
            </span>
          ) : null}
        </button>
      ) : null}

      {isAuthenticated && user ? (
        <div className="flex items-center gap-2">
          {canApplyAffiliate ? <AffiliateRegisterDialog /> : null}
          <span className="hidden h-10 items-center gap-1.5 rounded-full border border-border/80 bg-background px-3.5 py-1.5 text-sm text-foreground sm:inline-flex">
            <UserCircle2 className="size-4 text-primary" />
            Hi, {displayName}
          </span>
          <button
            type="button"
            aria-label="Sign out of AffiSmart Mall"
            onClick={handleLogout}
            className={cn(
              utilityButtonClassName(),
              "disabled:cursor-not-allowed disabled:opacity-60",
            )}
            disabled={logoutMutation.isPending}
          >
            <LogOut className="size-4" />
            {logoutMutation.isPending ? "Signing out..." : "Sign out"}
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className={cn(utilityButtonClassName(), "h-10")}
          >
            Sign in
          </Link>
          <Link
            href="/register"
            className="inline-flex h-10 items-center rounded-full bg-primary px-3.5 py-1.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-[var(--primary-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            Register
          </Link>
        </div>
      )}

      <CartDrawer />
    </nav>
  );
}
