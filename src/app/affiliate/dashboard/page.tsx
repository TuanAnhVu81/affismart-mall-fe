"use client";

import { AlertCircle, ArrowRight, Coins, Loader2, MousePointerClick, Sparkles, TrendingUp, Wallet } from "lucide-react";
import Link from "next/link";
import { useAffiliateCommissions, useAffiliateDashboard } from "@/hooks/useAffiliate";
import { formatCurrency } from "@/lib/utils";
import { useAuthStore } from "@/store/auth.store";
import { CommissionStatusBadge } from "@/components/affiliate/AffiliateStatusBadge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
  emphasis?: boolean;
}

function StatCard({ title, value, icon, trend, emphasis = false }: StatCardProps) {
  return (
    <Card
      className={
        emphasis
          ? "border-border/80 bg-gradient-to-br from-primary/8 via-card to-card shadow-soft"
          : "border-border/80 bg-card/90 shadow-soft"
      }
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between space-y-0 pb-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <div className="rounded-xl border border-primary/10 bg-primary/5 p-2 text-primary">
            {icon}
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-3xl font-bold tracking-tight text-foreground">
            {value}
          </span>
          {trend ? (
            <span className="text-xs leading-5 text-muted-foreground">
              {trend}
            </span>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}

export default function AffiliateDashboardPage() {
  const hasBootstrappedAuth = useAuthStore((state) => state.hasBootstrappedAuth);
  const { data: dashboard, isLoading: isDashboardLoading, error: dashboardError } = useAffiliateDashboard();
  const { data: commissionsData, isLoading: isCommissionsLoading } = useAffiliateCommissions({
    size: 5, // Just fetch the top 5 most recent
  });

  const commissions = commissionsData?.content ?? [];
  const conversionRate = Number(dashboard?.conversionRate ?? 0);
  const hasActivity = Boolean((dashboard?.totalClicks ?? 0) > 0 || (dashboard?.totalConversions ?? 0) > 0);

  if (!hasBootstrappedAuth || isDashboardLoading) {
    return (
      <div className="flex min-h-[400px] w-full items-center justify-center rounded-2xl border border-dashed border-border/80 bg-muted/20">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  if (dashboardError) {
    return (
      <div className="flex min-h-[400px] w-full flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-border/80 bg-muted/20 text-muted-foreground">
        <AlertCircle className="size-8 text-destructive" />
        <p>Could not load dashboard data. Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-3">
          <Badge variant="outline" className="rounded-full border-primary/15 bg-primary/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-primary">
            Performance snapshot
          </Badge>
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tight text-foreground">Overview</h1>
            <p className="max-w-2xl text-base leading-7 text-muted-foreground">
              Track how your affiliate traffic turns into conversions, commissions, and payout-ready balance.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            render={<Link href="/affiliate/links" />}
            nativeButton={false}
            className="rounded-full"
          >
            Create referral link
            <ArrowRight className="size-4" />
          </Button>
          <Button
            render={<Link href="/affiliate/commissions" />}
            nativeButton={false}
            variant="outline"
            className="rounded-full"
          >
            Review commissions
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Card className="border-border/80 bg-gradient-to-br from-primary/8 via-card to-card shadow-soft md:col-span-2 xl:col-span-2">
          <CardContent className="p-6">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div className="space-y-2">
                <Badge variant="outline" className="rounded-full border-primary/15 bg-background/80 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">
                  Conversion rate
                </Badge>
                <p className="text-sm leading-6 text-muted-foreground">
                  A quick read on how efficiently your clicks are turning into orders.
                </p>
              </div>
              <div className="rounded-2xl border border-primary/15 bg-primary/10 p-3 text-primary">
                <Sparkles className="size-5" />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-end gap-3">
                <span className="text-5xl font-bold tracking-tight text-foreground">
                  {conversionRate.toFixed(1)}%
                </span>
                <span className="pb-1 text-sm text-muted-foreground">
                  from {dashboard?.totalClicks?.toLocaleString() ?? "0"} clicks
                </span>
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-primary/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-primary to-[var(--primary-hover)] transition-all"
                  style={{ width: `${Math.min(conversionRate, 100)}%` }}
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-border/70 bg-background/80 px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    Status
                  </p>
                  <p className="mt-2 text-sm font-medium text-foreground">
                    {hasActivity ? "Campaign is active" : "Waiting for first referral activity"}
                  </p>
                </div>
                <div className="rounded-2xl border border-border/70 bg-background/80 px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    Next goal
                  </p>
                  <p className="mt-2 text-sm font-medium text-foreground">
                    {dashboard?.balance ? "Grow balance toward next payout" : "Share links to generate first commission"}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <StatCard
          title="Total Clicks"
          value={dashboard?.totalClicks?.toLocaleString() ?? "0"}
          icon={<MousePointerClick className="size-5" />}
          trend="Traffic generated from your referral URLs."
        />
        <StatCard
          title="Conversions"
          value={dashboard?.totalConversions?.toLocaleString() ?? "0"}
          icon={<TrendingUp className="size-5" />}
          trend="Orders attributed to your affiliate sessions."
          emphasis
        />
        <StatCard
          title="Available Balance"
          value={formatCurrency(dashboard?.balance ?? 0)}
          icon={<Wallet className="size-5" />}
          trend="Ready for payout once the minimum threshold is met."
        />
        <StatCard
          title="Total Earned"
          value={formatCurrency(dashboard?.totalCommissionEarned ?? 0)}
          icon={<Coins className="size-5" />}
          trend="Lifetime commission earnings across all referrals."
        />
      </div>

      <Card className="border border-border/80 bg-card/95 shadow-soft">
        <CardHeader className="flex flex-row items-center justify-between border-b border-border/70 pb-4">
          <div className="space-y-1">
            <CardTitle className="text-lg">Recent Commissions</CardTitle>
            <CardDescription>
              Your latest order referrals and their payment status.
            </CardDescription>
          </div>
          <Button render={<Link href="/affiliate/commissions" />} variant="outline" size="sm" nativeButton={false}>
            View all
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          {isCommissionsLoading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          ) : commissions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
              <div className="rounded-full bg-muted/50 p-4">
                <Coins className="size-6" />
              </div>
              <p className="mt-4 font-medium text-foreground">No commissions yet</p>
              <p className="mt-1 max-w-md text-sm">
                Start by generating a referral link and sharing it across your promotion channels to unlock your first commission.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Button
                  render={<Link href="/affiliate/links" />}
                  nativeButton={false}
                  className="rounded-full"
                >
                  Create referral link
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
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="font-medium">Order ID</TableHead>
                  <TableHead className="font-medium">Date</TableHead>
                  <TableHead className="font-medium">Amount</TableHead>
                  <TableHead className="font-medium text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {commissions.map((commission) => (
                  <TableRow key={commission.id} className="transition-colors hover:bg-muted/40">
                    <TableCell className="font-medium">
                      {commission.orderId ? `#${commission.orderId}` : "N/A"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {commission.createdAt
                        ? new Intl.DateTimeFormat("en-US", {
                            dateStyle: "medium",
                            timeStyle: "short",
                          }).format(new Date(commission.createdAt))
                        : "Unknown"}
                    </TableCell>
                    <TableCell className="font-bold text-emerald-600">
                      +{formatCurrency(commission.amount)}
                    </TableCell>
                    <TableCell className="text-right">
                      <CommissionStatusBadge status={commission.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
