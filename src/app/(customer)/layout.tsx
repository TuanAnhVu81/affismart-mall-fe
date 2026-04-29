import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { Suspense, type PropsWithChildren } from "react";
import { AffiliateTracker } from "@/components/affiliate/AffiliateTracker";
import { StorefrontNav } from "@/components/layout/StorefrontNav";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Customer Account",
  description:
    "Review checkout details, order history, and customer activity in your AffiSmart Mall account.",
  path: "/orders",
  noIndex: true,
});

export default function CustomerLayout({ children }: PropsWithChildren) {
	return (
		<div className="min-h-screen bg-background">
			<Suspense fallback={null}>
				<AffiliateTracker />
			</Suspense>

			<header className="sticky top-0 z-20 border-b border-border/80 bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex h-[4.5rem] w-full max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="inline-flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl border border-border bg-white shadow-soft">
              <Image
                src="/logo.png"
                alt="AffiSmart Mall logo"
                width={40}
                height={40}
                className="h-auto w-auto object-contain"
              />
            </span>
            <span className="text-sm font-semibold tracking-tight text-foreground sm:text-lg">
              AffiSmart Mall
            </span>
          </Link>

          <StorefrontNav />
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6">{children}</main>

      <footer className="border-t border-border/70 bg-muted/20">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>AffiSmart Mall (c) {new Date().getFullYear()}</p>
          <p>Fast, secure checkout for modern ecommerce.</p>
        </div>
      </footer>
    </div>
  );
}
