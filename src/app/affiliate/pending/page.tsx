import Link from "next/link";
import { Clock3, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AffiliatePendingPage() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-3xl items-center">
      <Card className="w-full border border-border/80 bg-card/95 shadow-soft">
        <CardHeader className="space-y-4 border-b border-border/70 pb-6 text-center">
          <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
            <Clock3 className="size-7" />
          </div>
          <div className="space-y-2">
            <CardTitle className="text-3xl tracking-tight">Affiliate application under review</CardTitle>
            <CardDescription className="mx-auto max-w-xl text-base">
              Your registration was submitted successfully. Our team is reviewing your channel information before enabling the affiliate dashboard.
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 px-6 py-8">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-border/70 bg-muted/25 p-5">
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
                <ShieldCheck className="size-4 text-primary" />
                What happens next
              </div>
              <p className="text-sm leading-6 text-muted-foreground">
                Once your account is approved, you will unlock referral links, commission tracking, and payout requests inside the affiliate portal.
              </p>
            </div>

            <div className="rounded-2xl border border-border/70 bg-muted/25 p-5">
              <div className="mb-3 text-sm font-semibold text-foreground">
                While waiting
              </div>
              <p className="text-sm leading-6 text-muted-foreground">
                You can continue browsing the storefront, managing your cart, and placing customer orders as usual.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button render={<Link href="/" />} nativeButton={false} className="rounded-full">
              Back to storefront
            </Button>
            <Button
              render={<Link href="/products" />}
              nativeButton={false}
              variant="outline"
              className="rounded-full"
            >
              Browse products
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
