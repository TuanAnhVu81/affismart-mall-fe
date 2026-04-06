"use client";

import Link from "next/link";
import { useMemo } from "react";
import { usePathname } from "next/navigation";
import { LogOut, UserCircle2 } from "lucide-react";
import { useLogout } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth.store";

const getDisplayName = (fullName: string) => {
  const [firstName = "Account"] = fullName.trim().split(/\s+/);
  return firstName;
};

export function StorefrontNav() {
  const pathname = usePathname();
  const logoutMutation = useLogout();
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const displayName = useMemo(() => {
    if (!user?.fullName) {
      return "Account";
    }

    return getDisplayName(user.fullName);
  }, [user?.fullName]);

  const handleLogout = () => {
    if (logoutMutation.isPending) {
      return;
    }

    logoutMutation.mutate();
  };

  const isActivePath = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <nav className="flex items-center gap-2 sm:gap-3">
      <div className="flex items-center rounded-full border border-border/80 bg-muted/30 p-1">
        <Link
          href="/"
          className={cn(
            "rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
            isActivePath("/")
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          Home
        </Link>
        <Link
          href="/products"
          className={cn(
            "rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
            isActivePath("/products")
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          Products
        </Link>
      </div>

      {isAuthenticated && user ? (
        <div className="flex items-center gap-2">
          <span className="hidden items-center gap-1.5 rounded-full border border-border/80 bg-background px-3 py-1.5 text-sm text-foreground sm:inline-flex">
            <UserCircle2 className="size-4 text-primary" />
            Hi, {displayName}
          </span>
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-background px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground disabled:opacity-60"
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
            className="rounded-full border border-border/80 px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Sign in
          </Link>
          <Link
            href="/register"
            className="rounded-full bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-[var(--primary-hover)]"
          >
            Register
          </Link>
        </div>
      )}
    </nav>
  );
}
