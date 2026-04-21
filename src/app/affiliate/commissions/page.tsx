"use client";

import { AlertCircle, FileText, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { AffiliatePagination } from "@/components/affiliate/AffiliatePagination";
import { CommissionStatusBadge } from "@/components/affiliate/AffiliateStatusBadge";
import { OrderStatusBadge } from "@/components/order/OrderStatusBadge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAffiliateCommissions } from "@/hooks/useAffiliate";
import { formatCurrency } from "@/lib/utils";
import { useAuthStore } from "@/store/auth.store";
import { CommissionStatus } from "@/types/affiliate.types";
import type { OrderStatus } from "@/types/order.types";

const COMMISSION_PAGE_SIZE = 10;

export default function CommissionsPage() {
  const hasBootstrappedAuth = useAuthStore((state) => state.hasBootstrappedAuth);
  const [statusFilter, setStatusFilter] = useState<CommissionStatus | "ALL">("ALL");
  const [page, setPage] = useState(1);

  const {
    data: commissionsData,
    isLoading,
    isFetching,
    error,
  } = useAffiliateCommissions({
    status: statusFilter === "ALL" ? undefined : statusFilter,
    page: page - 1,
    size: COMMISSION_PAGE_SIZE,
    sortBy: "created_at",
    sortDir: "desc",
  });

  useEffect(() => {
    setPage(1);
  }, [statusFilter]);

  const commissions = commissionsData?.content ?? [];

  if (!hasBootstrappedAuth || isLoading) {
    return (
      <div className="flex min-h-[400px] w-full items-center justify-center rounded-2xl border border-dashed border-border/80 bg-muted/20">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[400px] w-full flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-border/80 bg-muted/20 text-muted-foreground">
        <AlertCircle className="size-8 text-destructive" />
        <p>Could not load commissions. Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col items-start justify-between gap-4 lg:flex-row lg:items-center">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Commissions</h1>
          <p className="text-muted-foreground">
            Review every earned commission with order context, approval status, and payout progress.
          </p>
        </div>

        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
          <Select
            value={statusFilter}
            onValueChange={(value) => setStatusFilter(value as CommissionStatus | "ALL")}
          >
            <SelectTrigger className="h-11 min-w-48 rounded-full bg-background">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All statuses</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="APPROVED">Approved</SelectItem>
              <SelectItem value="PAID">Paid</SelectItem>
              <SelectItem value="REJECTED">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card className="border border-border/80 bg-card/95 shadow-soft">
        <CardHeader className="gap-4 border-b border-border/70 pb-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg">Commission history</CardTitle>
            <CardDescription>
              Data is paged directly from the backend, so larger histories stay complete as your affiliate account grows.
            </CardDescription>
          </div>

          <div className="text-sm text-muted-foreground">
            {isFetching ? "Refreshing..." : `${commissionsData?.totalElements ?? 0} records`}
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {commissions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
              <div className="rounded-full bg-muted/50 p-4">
                <FileText className="size-6 text-primary/50" />
              </div>
              <p className="mt-4 font-medium text-foreground">No commissions found</p>
              <p className="mt-1 max-w-sm text-sm">
                Try a different filter or keep promoting your products to generate new commission records.
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-4 px-4 py-4 md:hidden">
                {commissions.map((commission) => (
                  <div
                    key={commission.id}
                    className="rounded-2xl border border-border/70 bg-background/90 p-4 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-foreground">
                          {commission.orderId ? `Order #${commission.orderId}` : "Order unavailable"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {commission.createdAt
                            ? new Intl.DateTimeFormat("en-US", {
                                dateStyle: "medium",
                                timeStyle: "short",
                              }).format(new Date(commission.createdAt))
                            : "Unknown date"}
                        </p>
                      </div>
                      <CommissionStatusBadge status={commission.status} />
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                      <div className="rounded-xl bg-muted/30 p-3">
                        <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                          Order total
                        </p>
                        <p className="mt-1 font-semibold text-foreground">
                          {commission.orderTotalAmount
                            ? formatCurrency(commission.orderTotalAmount)
                            : "-"}
                        </p>
                      </div>
                      <div className="rounded-xl bg-emerald-50 p-3">
                        <p className="text-xs uppercase tracking-[0.16em] text-emerald-700/80">
                          Commission
                        </p>
                        <p className="mt-1 font-semibold text-emerald-700">
                          +{formatCurrency(commission.amount)}
                        </p>
                      </div>
                    </div>

                    {commission.orderStatus ? (
                      <div className="mt-4 flex items-center justify-between gap-3">
                        <span className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                          Order status
                        </span>
                        <OrderStatusBadge status={commission.orderStatus as OrderStatus} />
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>

              <div className="hidden overflow-x-auto md:block">
                <Table>
                  <TableHeader className="bg-muted/30">
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="font-medium">Order</TableHead>
                      <TableHead className="font-medium">Created at</TableHead>
                      <TableHead className="text-right font-medium">Order total</TableHead>
                      <TableHead className="text-right font-medium">Commission</TableHead>
                      <TableHead className="text-center font-medium">Commission status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {commissions.map((commission) => (
                      <TableRow key={commission.id} className="transition-colors hover:bg-muted/40">
                        <TableCell className="font-medium">
                          {commission.orderId ? (
                            <div className="space-y-1">
                              <p className="text-foreground">#{commission.orderId}</p>
                              {commission.orderStatus ? (
                                <OrderStatusBadge status={commission.orderStatus as OrderStatus} />
                              ) : null}
                            </div>
                          ) : (
                            "N/A"
                          )}
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-muted-foreground">
                          {commission.createdAt
                            ? new Intl.DateTimeFormat("en-US", {
                                dateStyle: "medium",
                                timeStyle: "short",
                              }).format(new Date(commission.createdAt))
                            : "Unknown"}
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground">
                          {commission.orderTotalAmount
                            ? formatCurrency(commission.orderTotalAmount)
                            : "-"}
                        </TableCell>
                        <TableCell className="text-right font-bold text-emerald-600">
                          +{formatCurrency(commission.amount)}
                        </TableCell>
                        <TableCell className="text-center">
                          <CommissionStatusBadge status={commission.status} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <AffiliatePagination
                page={page}
                totalPages={commissionsData?.totalPages ?? 1}
                totalElements={commissionsData?.totalElements ?? 0}
                size={commissionsData?.size ?? COMMISSION_PAGE_SIZE}
                itemLabel="commission records"
                onPageChange={setPage}
                isDisabled={isFetching}
              />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
