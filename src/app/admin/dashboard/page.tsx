"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  Boxes,
  ChartNoAxesCombined,
  DollarSign,
  FolderKanban,
  PackageSearch,
  ShieldCheck,
  TrendingUp,
  Users,
  Warehouse,
} from "lucide-react";
import {
  AnalyticsChart,
  type AnalyticsChartDatum,
} from "@/components/admin/AnalyticsChart";
import { OrderStatusBadge } from "@/components/order/OrderStatusBadge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useAdminAnalyticsDashboard,
  useAdminCategories,
  useAdminLowStockProducts,
  useAdminOrders,
  useAdminProducts,
  useAdminTopAffiliates,
  useAdminTopProducts,
} from "@/hooks/useAdmin";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { OrderSummary } from "@/types/order.types";

const shortLabel = (value: string, maxLength = 18) =>
  value.length > maxLength ? `${value.slice(0, maxLength - 1)}...` : value;

const trendDateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "2-digit",
});

const buildRevenueTrend = (orders: OrderSummary[]): AnalyticsChartDatum[] => {
  const revenueByDate = new Map<string, number>();

  orders.forEach((order) => {
    if (!order.createdAt) {
      return;
    }

    const date = new Date(order.createdAt);
    if (Number.isNaN(date.getTime())) {
      return;
    }

    const key = date.toISOString().slice(0, 10);
    revenueByDate.set(key, (revenueByDate.get(key) ?? 0) + order.totalAmount);
  });

  return Array.from(revenueByDate.entries())
    .sort(([firstDate], [secondDate]) => firstDate.localeCompare(secondDate))
    .slice(-7)
    .map(([date, value]) => ({
      label: trendDateFormatter.format(new Date(date)),
      value,
    }));
};

function MetricCard({
  title,
  description,
  value,
  icon: Icon,
  tone,
  isLoading,
}: {
  title: string;
  description: string;
  value: string | number;
  icon: typeof DollarSign;
  tone: string;
  isLoading?: boolean;
}) {
  return (
    <Card className="rounded-[28px] border border-border/80 bg-background py-0 shadow-soft">
      <CardHeader className="px-5 pt-5">
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="px-5 pb-5">
        <div className="flex items-center gap-3">
          <span className={`flex size-11 items-center justify-center rounded-2xl ${tone}`}>
            <Icon className="size-5" />
          </span>
          {isLoading ? (
            <Skeleton className="h-9 w-28 rounded-full" />
          ) : (
            <p className="text-3xl font-semibold tracking-tight text-foreground">
              {value}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function AdminDashboardPage() {
  const analyticsQuery = useAdminAnalyticsDashboard();
  const topProductsQuery = useAdminTopProducts(8);
  const topAffiliatesQuery = useAdminTopAffiliates(5);
  const productsQuery = useAdminProducts({
    page: 0,
    size: 1,
    sortBy: "created_at",
    sortDir: "desc",
  });
  const categoriesQuery = useAdminCategories();
  const recentOrdersQuery = useAdminOrders({
    page: 0,
    size: 5,
    sortBy: "createdAt",
    sortDir: "desc",
  });
  const revenueOrdersQuery = useAdminOrders({
    page: 0,
    size: 50,
    sortBy: "createdAt",
    sortDir: "desc",
    status: "DONE",
  });
  const lowStockQuery = useAdminLowStockProducts();

  const analytics = analyticsQuery.data;
  const totalProducts = productsQuery.data?.totalElements ?? 0;
  const activeCategories = (categoriesQuery.data?.items ?? []).filter(
    (category) => category.isActive,
  ).length;
  const recentOrders = recentOrdersQuery.data?.content ?? [];
  const lowStockProducts = lowStockQuery.data?.items ?? [];

  const topProductChartData = useMemo(
    () =>
      (topProductsQuery.data ?? []).map((product) => ({
        label: shortLabel(product.productName),
        value: product.revenue,
        secondaryValue: product.quantitySold,
      })),
    [topProductsQuery.data],
  );

  const revenueTrendData = useMemo(
    () => buildRevenueTrend(revenueOrdersQuery.data?.content ?? []),
    [revenueOrdersQuery.data?.content],
  );

  const topAffiliates = topAffiliatesQuery.data ?? [];

  return (
    <div className="space-y-6">
      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)]">
        <div className="rounded-[28px] border border-border/80 bg-gradient-to-br from-primary/8 via-background to-emerald-50/50 px-5 py-6 shadow-soft sm:px-6">
          <Badge className="rounded-full bg-white/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">
            Analytics cockpit
          </Badge>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-foreground">
            Store performance, inventory, and affiliate signals in one view.
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Monitor GMV, order flow, top sellers, affiliate contribution, and low-stock
            risks before they turn into missed revenue.
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <Button
              render={<Link href="/admin/orders" />}
              nativeButton={false}
              className="rounded-full shadow-sm"
            >
              Review orders
              <ArrowRight className="size-4" />
            </Button>
            <Button
              render={<Link href="/admin/products" />}
              nativeButton={false}
              variant="outline"
              className="rounded-full"
            >
              Manage products
            </Button>
            <Button
              render={<Link href="/admin/affiliates" />}
              nativeButton={false}
              variant="outline"
              className="rounded-full"
            >
              Affiliate reviews
            </Button>
          </div>
        </div>

        <div className="rounded-[28px] border border-border/80 bg-background px-5 py-6 shadow-soft sm:px-6">
          <div className="flex items-start gap-3">
            <span className="flex size-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
              <ShieldCheck className="size-5" />
            </span>
            <div className="space-y-2">
              <h2 className="text-xl font-semibold tracking-tight text-foreground">
                Production note
              </h2>
              <p className="text-sm leading-6 text-muted-foreground">
                The backend currently exposes aggregate analytics, top products, and
                top affiliates. Revenue trend uses completed orders fetched from the
                order API so every point still comes from real data.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-4">
        <MetricCard
          title="GMV"
          description="Completed order revenue."
          value={formatCurrency(analytics?.grossMerchandiseValue ?? 0)}
          icon={DollarSign}
          tone="bg-emerald-50 text-emerald-700"
          isLoading={analyticsQuery.isLoading}
        />
        <MetricCard
          title="Total orders"
          description="All orders currently tracked."
          value={analytics?.totalOrders ?? 0}
          icon={FolderKanban}
          tone="bg-sky-50 text-sky-700"
          isLoading={analyticsQuery.isLoading}
        />
        <MetricCard
          title="Users"
          description="Registered customer accounts."
          value={analytics?.totalUsers ?? 0}
          icon={Users}
          tone="bg-violet-50 text-violet-700"
          isLoading={analyticsQuery.isLoading}
        />
        <MetricCard
          title="Active affiliates"
          description="Approved affiliate partners."
          value={analytics?.activeAffiliates ?? 0}
          icon={TrendingUp}
          tone="bg-amber-50 text-amber-700"
          isLoading={analyticsQuery.isLoading}
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
        <Card className="rounded-[28px] border border-border/80 bg-background py-0 shadow-soft">
          <CardHeader className="border-b border-border/70 px-5 py-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <CardTitle>Revenue trend</CardTitle>
                <CardDescription>
                  Last completed-order revenue points from operational data.
                </CardDescription>
              </div>
              <Badge variant="outline" className="rounded-full px-3 py-1">
                DONE orders
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="px-3 py-5 sm:px-5">
            {revenueOrdersQuery.isLoading ? (
              <Skeleton className="h-72 rounded-[24px]" />
            ) : (
              <AnalyticsChart
                data={revenueTrendData}
                type="line"
                valueLabel="Revenue"
                emptyTitle="No completed revenue yet"
              />
            )}
          </CardContent>
        </Card>

        <Card className="rounded-[28px] border border-border/80 bg-background py-0 shadow-soft">
          <CardHeader className="border-b border-border/70 px-5 py-5">
            <CardTitle>Top products</CardTitle>
            <CardDescription>
              Revenue leaders from completed orders.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-3 py-5 sm:px-5">
            {topProductsQuery.isLoading ? (
              <Skeleton className="h-72 rounded-[24px]" />
            ) : (
              <AnalyticsChart
                data={topProductChartData}
                type="bar"
                valueLabel="Revenue"
                secondaryValueLabel="Sold"
                emptyTitle="No top products yet"
              />
            )}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(22rem,0.65fr)]">
        <Card className="rounded-[28px] border border-border/80 bg-background py-0 shadow-soft">
          <CardHeader className="border-b border-border/70 px-5 py-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <CardTitle>Top affiliate partners</CardTitle>
                <CardDescription>
                  Attributed revenue and commission performance.
                </CardDescription>
              </div>
              <Button
                render={<Link href="/admin/affiliates" />}
                nativeButton={false}
                variant="outline"
                className="rounded-full"
              >
                Open affiliates
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-5">
            {topAffiliatesQuery.isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, index) => (
                  <Skeleton key={`affiliate-skeleton-${index}`} className="h-20 rounded-3xl" />
                ))}
              </div>
            ) : topAffiliates.length ? (
              <div className="space-y-3">
                {topAffiliates.map((affiliate, index) => (
                  <div
                    key={affiliate.affiliateAccountId}
                    className="flex flex-col gap-4 rounded-[24px] border border-border/80 bg-muted/10 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-primary/8 text-sm font-semibold text-primary">
                        #{index + 1}
                      </span>
                      <div>
                        <p className="font-semibold text-foreground">{affiliate.fullName}</p>
                        <p className="text-sm text-muted-foreground">
                          Ref {affiliate.refCode} · {affiliate.conversionCount} conversions
                        </p>
                      </div>
                    </div>
                    <div className="text-left sm:text-right">
                      <p className="font-semibold text-foreground">
                        {formatCurrency(affiliate.attributedRevenue)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatCurrency(affiliate.totalCommission)} commission
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-3xl border border-dashed border-border/80 bg-muted/10 px-6 py-10 text-center">
                <ChartNoAxesCombined className="mx-auto size-8 text-muted-foreground" />
                <p className="mt-3 text-base font-semibold text-foreground">
                  No affiliate revenue yet
                </p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Approved or paid commissions will surface partner performance here.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-[28px] border border-border/80 bg-background py-0 shadow-soft">
          <CardHeader className="border-b border-border/70 px-5 py-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <CardTitle>Low-stock alerts</CardTitle>
                <CardDescription>
                  Products below the inventory threshold.
                </CardDescription>
              </div>
              <span className="flex size-10 items-center justify-center rounded-2xl bg-amber-50 text-amber-700">
                <AlertTriangle className="size-5" />
              </span>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 p-4 sm:p-5">
            {lowStockQuery.isLoading ? (
              Array.from({ length: 3 }).map((_, index) => (
                <Skeleton key={`low-stock-skeleton-${index}`} className="h-20 rounded-3xl" />
              ))
            ) : lowStockProducts.length ? (
              lowStockProducts.slice(0, 5).map((product) => (
                <Link
                  key={product.id}
                  href={`/admin/products/${product.id}`}
                  className="flex items-center justify-between gap-3 rounded-[22px] border border-border/80 bg-muted/10 px-4 py-3 transition-colors hover:border-primary/20 hover:bg-primary/[0.035]"
                >
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-foreground">{product.name}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      SKU {product.sku ?? "N/A"} · {product.categoryName}
                    </p>
                  </div>
                  <Badge
                    variant={product.stockQuantity <= 0 ? "destructive" : "outline"}
                    className="shrink-0 rounded-full px-2.5 py-1"
                  >
                    {product.stockQuantity} left
                  </Badge>
                </Link>
              ))
            ) : (
              <div className="rounded-3xl border border-dashed border-border/80 bg-muted/10 px-6 py-10 text-center">
                <Warehouse className="mx-auto size-8 text-muted-foreground" />
                <p className="mt-3 text-base font-semibold text-foreground">
                  Inventory looks healthy
                </p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  No products are currently below the low-stock threshold.
                </p>
              </div>
            )}

            {lowStockProducts.length > 5 ? (
              <Button
                render={<Link href="/admin/products" />}
                nativeButton={false}
                variant="outline"
                className="w-full rounded-full"
              >
                View all products
              </Button>
            ) : null}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_22rem]">
        <Card className="rounded-[28px] border border-border/80 bg-background py-0 shadow-soft">
          <CardHeader className="border-b border-border/70 px-5 py-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <CardTitle>Recent orders</CardTitle>
                <CardDescription>
                  Quick access to the newest fulfillment reviews.
                </CardDescription>
              </div>
              <Button
                render={<Link href="/admin/orders" />}
                nativeButton={false}
                variant="outline"
                className="rounded-full"
              >
                Open orders
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-5">
            {recentOrdersQuery.isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, index) => (
                  <Skeleton key={`recent-order-skeleton-${index}`} className="h-20 rounded-3xl" />
                ))}
              </div>
            ) : recentOrders.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-border/80 bg-muted/10 px-6 py-10 text-center">
                <PackageSearch className="mx-auto size-8 text-muted-foreground" />
                <p className="mt-3 text-base font-semibold text-foreground">No orders yet</p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Once orders come in, this panel will surface the latest ones for faster review.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentOrders.map((order) => (
                  <Link
                    key={order.id}
                    href={`/admin/orders/${order.id}`}
                    className="block rounded-[24px] border border-border/80 bg-background px-5 py-4 transition-colors hover:border-primary/15 hover:bg-primary/[0.025]"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-semibold text-foreground">Order #{order.id}</p>
                          <OrderStatusBadge status={order.status} />
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {order.shippingAddress}
                        </p>
                      </div>

                      <div className="space-y-1 text-left sm:text-right">
                        <p className="font-semibold text-foreground">
                          {formatCurrency(order.totalAmount)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Created {formatDate(order.createdAt)}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-[28px] border border-border/80 bg-background py-0 shadow-soft">
          <CardHeader className="border-b border-border/70 px-5 py-5">
            <CardTitle>Operations snapshot</CardTitle>
            <CardDescription>Catalog and taxonomy context beside analytics.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 px-5 py-5">
            {[
              {
                icon: Boxes,
                label: "Total products",
                value: totalProducts,
                href: "/admin/products",
              },
              {
                icon: Warehouse,
                label: "Low-stock items",
                value: lowStockProducts.length,
                href: "/admin/products",
              },
              {
                icon: ShieldCheck,
                label: "Active categories",
                value: activeCategories,
                href: "/admin/categories",
              },
            ].map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="flex items-center justify-between rounded-2xl border border-border/70 bg-muted/10 px-4 py-4 transition-colors hover:border-primary/15 hover:bg-primary/[0.04]"
              >
                <span className="flex items-center gap-3">
                  <span className="flex size-9 items-center justify-center rounded-xl bg-primary/8 text-primary">
                    <item.icon className="size-4" />
                  </span>
                  <span className="font-medium text-foreground">{item.label}</span>
                </span>
                <span className="text-lg font-semibold text-foreground">{item.value}</span>
              </Link>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
