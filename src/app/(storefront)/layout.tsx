import Image from "next/image";
import Link from "next/link";
import type { PropsWithChildren } from "react";
import { AffiliateTracker } from "@/components/affiliate/AffiliateTracker";
import { StorefrontNav } from "@/components/layout/StorefrontNav";
import { Button } from "@/components/ui/button";

export default function StorefrontLayout({ children }: PropsWithChildren) {
  return (
    <div className="min-h-screen bg-background">
      <AffiliateTracker />

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

      <footer className="border-t border-border/70 bg-background pt-16 pb-8">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
          <div className="grid grid-cols-1 gap-10 md:grid-cols-4 lg:gap-16">
            <div className="space-y-4 md:col-span-1">
              <Button
                render={<Link href="/" />}
                variant="ghost"
                className="h-auto p-0 hover:bg-transparent"
                nativeButton={false}
              >
                <div className="inline-flex items-center gap-2.5">
                  <span className="flex size-9 items-center justify-center overflow-hidden rounded-xl border border-border bg-white shadow-soft">
                    <Image 
                      src="/logo.png" 
                      alt="AffiSmart Mall logo" 
                      width={28} 
                      height={28} 
                      className="h-auto w-auto object-contain" 
                    />
                  </span>
                  <span className="text-lg font-bold tracking-tight text-foreground">AffiSmart Mall</span>
                </div>
              </Button>
              <p className="text-sm leading-6 text-muted-foreground">
                Next-generation commerce platform bridging top-tier products with an elite affiliate network.
              </p>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground">Shop</h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li><Link href="/products" className="transition-colors hover:text-foreground">All Products</Link></li>
                <li><Link href="/products?sortBy=newest" className="transition-colors hover:text-foreground">New Arrivals</Link></li>
                <li><Link href="#" className="transition-colors hover:text-foreground">Featured Brands</Link></li>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground">Support</h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li><Link href="#" className="transition-colors hover:text-foreground">Help Center</Link></li>
                <li><Link href="#" className="transition-colors hover:text-foreground">Shipping Details</Link></li>
                <li><Link href="#" className="transition-colors hover:text-foreground">Return Policy</Link></li>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground">Stay up to date</h3>
              <p className="text-sm text-muted-foreground">Subscribe to our newsletter for the latest updates and offers.</p>
              <div className="flex gap-2">
                <input 
                  type="email" 
                  placeholder="Enter your email" 
                  className="flex h-10 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
                <button className="inline-flex h-10 items-center justify-center rounded-xl bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90">
                  Join
                </button>
              </div>
            </div>
          </div>
          
          <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-border/60 pt-8 sm:flex-row text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} AffiSmart Mall. All rights reserved.</p>
            <div className="flex gap-6">
              <Link href="#" className="hover:text-foreground">Terms</Link>
              <Link href="#" className="hover:text-foreground">Privacy</Link>
              <Link href="#" className="hover:text-foreground">Cookies</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

