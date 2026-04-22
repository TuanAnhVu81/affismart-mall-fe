"use client";

import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  Boxes,
  FolderKanban,
  Layers3,
  ShieldCheck,
} from "lucide-react";
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
import { useAdminCategories, useAdminLowStockProducts, useAdminOrders, useAdminProducts } from "@/hooks/useAdmin";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function AdminDashboardPage() {
  const productsQuery = useAdminProducts({
    page: 0,
    size: 1,
    sortBy: "created_at",
    sortDir: "desc",
  });
  const categoriesQuery = useAdminCategories();
  const ordersQuery = useAdminOrders({
    page: 0,
    size: 5,
    sortBy: "createdAt",
    sortDir: "desc",
  });
  const lowStockQuery = useAdminLowStockProducts();

  const totalProducts = productsQuery.data?.totalElements ?? 0;
  const totalOrders = ordersQuery.data?.totalElements ?? 0;
  const lowStockCount = lowStockQuery.data?.items.length ?? 0;
  const activeCategories = (categoriesQuery.data?.items ?? []).filter((category) => category.isActive).length;
  const recentOrders = ordersQuery.data?.content ?? [];

  return (
    <div className="space-y-6">
      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)]">
        <div className="rounded-[28px] border border-border/80 bg-gradient-to-br from-primary/8 via-background to-emerald-50/50 px-5 py-6 shadow-soft sm:px-6">
          <Badge className="rounded-full bg-white/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">
            Admin home
          </Badge>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-foreground">
            Storefront control at a glance
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Jump back into products, categories, and fulfillment reviews without losing context. This page is your anchor point whenever you leave a detail screen.
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
              render={<Link href="/admin/categories" />}
              nativeButton={false}
              variant="outline"
              className="rounded-full"
            >
              Update categories
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
                Operator note
              </h2>
              <p className="text-sm leading-6 text-muted-foreground">
                Use the dashboard as the safe landing page after reviewing records. It keeps quick actions visible and reduces the feeling of getting stuck in deep admin routes.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-4">
        <Card className="rounded-[28px] border border-border/80 bg-background py-0 shadow-soft">
          <CardHeader className="px-5 pt-5">
            <CardTitle>Total products</CardTitle>
            <CardDescription>Catalog entries available to admin.</CardDescription>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            <div className="flex items-center gap-3">
              <span className="flex size-11 items-center justify-center rounded-2xl bg-primary/8 text-primary">
                <Boxes className="size-5" />
              </span>
              <p className="text-3xl font-semibold tracking-tight text-foreground">{totalProducts}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[28px] border border-border/80 bg-background py-0 shadow-soft">
          <CardHeader className="px-5 pt-5">
            <CardTitle>Total orders</CardTitle>
            <CardDescription>Orders currently in the system.</CardDescription>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            <div className="flex items-center gap-3">
              <span className="flex size-11 items-center justify-center rounded-2xl bg-sky-50 text-sky-700">
                <FolderKanban className="size-5" />
              </span>
              <p className="text-3xl font-semibold tracking-tight text-foreground">{totalOrders}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[28px] border border-border/80 bg-background py-0 shadow-soft">
          <CardHeader className="px-5 pt-5">
            <CardTitle>Active categories</CardTitle>
            <CardDescription>Taxonomy visible to the live storefront.</CardDescription>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            <div className="flex items-center gap-3">
              <span className="flex size-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                <Layers3 className="size-5" />
              </span>
              <p className="text-3xl font-semibold tracking-tight text-foreground">{activeCategories}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[28px] border border-border/80 bg-background py-0 shadow-soft">
          <CardHeader className="px-5 pt-5">
            <CardTitle>Low-stock watchlist</CardTitle>
            <CardDescription>Products needing attention soon.</CardDescription>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            <div className="flex items-center gap-3">
              <span className="flex size-11 items-center justify-center rounded-2xl bg-amber-50 text-amber-700">
                <AlertTriangle className="size-5" />
              </span>
              <p className="text-3xl font-semibold tracking-tight text-foreground">{lowStockCount}</p>
            </div>
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
                  Quick access to the newest fulfillment reviews from your admin home base.
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
            {recentOrders.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-border/80 bg-muted/10 px-6 py-10 text-center">
                <p className="text-base font-semibold text-foreground">No orders yet</p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Once the first orders come in, this panel will surface the latest ones for faster review.
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
                        <p className="font-semibold text-foreground">{formatCurrency(order.totalAmount)}</p>
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
            <CardTitle>Quick routes</CardTitle>
            <CardDescription>Fast navigation when switching between admin tasks.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 px-5 py-5">
            {[
              {
                href: "/admin/products",
                title: "Products",
                description: "Edit catalog items, pricing, and stock levels.",
              },
              {
                href: "/admin/categories",
                title: "Categories",
                description: "Adjust taxonomy and active storefront grouping.",
              },
              {
                href: "/admin/orders",
                title: "Orders",
                description: "Review lifecycle transitions and shipping flow.",
              },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block rounded-2xl border border-border/70 bg-muted/10 px-4 py-4 transition-colors hover:border-primary/15 hover:bg-primary/[0.04]"
              >
                <p className="font-semibold text-foreground">{item.title}</p>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">{item.description}</p>
              </Link>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
