"use client";

import { AlertCircle, ArrowDownRight, Banknote, HelpCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { AffiliatePagination } from "@/components/affiliate/AffiliatePagination";
import { PayoutStatusBadge } from "@/components/affiliate/AffiliateStatusBadge";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  useAffiliateDashboard,
  useAffiliatePayouts,
  useCreatePayoutRequest,
} from "@/hooks/useAffiliate";
import { formatCurrency } from "@/lib/utils";
import { useAuthStore } from "@/store/auth.store";

const MINIMUM_PAYOUT = 200000;
const PAYOUT_PAGE_SIZE = 10;

export default function PayoutsPage() {
  const hasBootstrappedAuth = useAuthStore((state) => state.hasBootstrappedAuth);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [page, setPage] = useState(1);

  const {
    data: dashboard,
    isLoading: isLoadingDashboard,
    error: dashboardError,
  } = useAffiliateDashboard();
  const {
    data: payoutsData,
    isLoading: isLoadingPayouts,
    isFetching: isFetchingPayouts,
    error: payoutsError,
  } = useAffiliatePayouts({
    page: page - 1,
    size: PAYOUT_PAGE_SIZE,
    sortBy: "created_at",
    sortDir: "desc",
  });
  const createPayoutMutation = useCreatePayoutRequest();

  const payouts = payoutsData?.content ?? [];
  const currentBalance = dashboard?.balance ?? 0;
  const hasPendingPayout = payouts.some((payout) => payout.status === "PENDING");
  const amountNeeded = Math.max(MINIMUM_PAYOUT - currentBalance, 0);
  const canWithdraw =
    !dashboardError &&
    currentBalance >= MINIMUM_PAYOUT &&
    !hasPendingPayout;

  const disabledMessage = dashboardError
    ? "Balance is temporarily unavailable. Please refresh and try again."
    : hasPendingPayout
      ? "You already have a payout request being processed."
      : `You need at least ${formatCurrency(MINIMUM_PAYOUT)} to request a payout.`;

  const handleWithdrawRequest = async () => {
    try {
      await createPayoutMutation.mutateAsync();
      toast.success("Withdrawal request submitted successfully.");
      setIsConfirmOpen(false);
    } catch {
      toast.error("Failed to submit withdrawal request.");
    }
  };

  if (!hasBootstrappedAuth || isLoadingDashboard || isLoadingPayouts) {
    return (
      <div className="flex min-h-[400px] w-full items-center justify-center rounded-2xl border border-dashed border-border/80 bg-muted/20">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  if (payoutsError) {
    return (
      <div className="flex min-h-[400px] w-full flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-border/80 bg-muted/20 text-muted-foreground">
        <AlertCircle className="size-8 text-destructive" />
        <p>Could not load payout history. Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <span className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-emerald-700">
          Secure payouts
        </span>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Payouts</h1>
        <p className="max-w-2xl text-base leading-7 text-muted-foreground">
          Manage your affiliate balance and request transfers to your registered bank account.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-border/80 bg-gradient-to-br from-emerald-500/10 via-background to-background shadow-soft">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Available balance</CardTitle>
            <CardDescription>
              Funds currently eligible for withdrawal from your affiliate account.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            {dashboardError ? (
              <div className="rounded-2xl border border-dashed border-amber-200 bg-amber-50/80 px-4 py-3 text-sm text-amber-800">
                We could not load your latest balance right now. Your payout history is still available below.
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-emerald-100 p-3 text-emerald-600">
                    <Banknote className="size-6" />
                  </div>
                  <span className="text-4xl font-bold tracking-tight text-foreground">
                    {formatCurrency(currentBalance)}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {canWithdraw ? (
                    <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                      Ready to request payout
                    </span>
                  ) : (
                    <span className="rounded-full border border-border/70 bg-background/80 px-3 py-1 text-xs font-medium text-muted-foreground">
                      Need {formatCurrency(amountNeeded)} more to unlock payout
                    </span>
                  )}
                </div>
              </div>
            )}

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <span tabIndex={0} className="inline-block">
                    <Button
                      onClick={() => setIsConfirmOpen(true)}
                      disabled={!canWithdraw || createPayoutMutation.isPending}
                      variant={canWithdraw ? "default" : "outline"}
                      className="w-full rounded-full shadow-sm sm:w-auto"
                    >
                      {createPayoutMutation.isPending ? "Processing..." : "Request payout"}
                    </Button>
                  </span>
                </TooltipTrigger>
                {!canWithdraw ? (
                  <TooltipContent className="max-w-[220px] text-center">
                    <p>{disabledMessage}</p>
                  </TooltipContent>
                ) : null}
              </Tooltip>
            </TooltipProvider>
          </CardContent>
        </Card>

        <Card className="border-border/80 bg-card/50 shadow-none">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              Payout guidelines <HelpCircle className="size-4 text-muted-foreground" />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <ul className="list-inside list-disc space-y-1">
              <li>
                Minimum withdrawal amount is{" "}
                <strong className="text-foreground">{formatCurrency(MINIMUM_PAYOUT)}</strong>.
              </li>
              <li>Payouts are usually processed within 3-5 business days.</li>
              <li>Funds are transferred to the bank account submitted in your affiliate profile.</li>
              <li>Only one pending payout request is allowed at a time.</li>
            </ul>
            <div className="rounded-2xl border border-border/70 bg-background/80 px-4 py-3 text-sm leading-6">
              Keep sharing high-converting links to increase your available balance and reach the minimum threshold faster.
            </div>
          </CardContent>
        </Card>
      </div>

      <ConfirmDialog
        open={isConfirmOpen}
        onOpenChange={setIsConfirmOpen}
        title="Confirm payout request"
        description={`Are you sure you want to withdraw your current balance of ${formatCurrency(currentBalance)}?`}
        confirmText="Submit request"
        isLoading={createPayoutMutation.isPending}
        onConfirm={handleWithdrawRequest}
      />

      <Card className="border border-border/80 bg-card/95 shadow-soft">
        <CardHeader className="gap-4 border-b border-border/70 pb-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg">Payout history</CardTitle>
            <CardDescription>
              Every payout request is paged from the backend so your transaction history stays complete.
            </CardDescription>
          </div>

          <div className="text-sm text-muted-foreground">
            {isFetchingPayouts ? "Refreshing..." : `${payoutsData?.totalElements ?? 0} records`}
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {payouts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
              <div className="rounded-full bg-muted/50 p-4">
                <ArrowDownRight className="size-6 text-primary/50" />
              </div>
              <p className="mt-4 font-medium text-foreground">No payouts yet</p>
              <p className="mt-1 max-w-sm text-sm">
                Once you start requesting withdrawals, your payout history will appear here.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Button
                  render={<Link href="/affiliate/commissions" />}
                  nativeButton={false}
                  className="rounded-full"
                >
                  View commissions
                </Button>
                <Button
                  render={<Link href="/affiliate/links" />}
                  nativeButton={false}
                  variant="outline"
                  className="rounded-full"
                >
                  Manage referral links
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="space-y-4 px-4 py-4 md:hidden">
                {payouts.map((payout) => (
                  <div
                    key={payout.id}
                    className="rounded-2xl border border-border/70 bg-background/90 p-4 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-foreground">
                          {formatCurrency(payout.amount)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {payout.createdAt
                            ? new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(
                                new Date(payout.createdAt),
                              )
                            : "Unknown date"}
                        </p>
                      </div>
                      <PayoutStatusBadge status={payout.status} />
                    </div>

                    <div className="mt-4 rounded-xl bg-muted/30 p-3 text-sm text-muted-foreground">
                      {payout.status === "REJECTED" && payout.adminNote ? (
                        <span className="font-medium text-destructive">
                          Rejected: {payout.adminNote}
                        </span>
                      ) : payout.status === "TRANSFERRED" && payout.resolvedAt ? (
                        <span className="text-emerald-700">
                          Completed on{" "}
                          {new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(
                            new Date(payout.resolvedAt),
                          )}
                        </span>
                      ) : payout.status === "APPROVED" ? (
                        "Approved and waiting for transfer."
                      ) : (
                        "Pending processing..."
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="hidden overflow-x-auto md:block">
                <Table>
                  <TableHeader className="bg-muted/30">
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="font-medium">Requested on</TableHead>
                      <TableHead className="text-right font-medium">Amount</TableHead>
                      <TableHead className="text-center font-medium">Status</TableHead>
                      <TableHead className="font-medium">Resolution</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payouts.map((payout) => (
                      <TableRow key={payout.id} className="transition-colors hover:bg-muted/40">
                        <TableCell className="whitespace-nowrap text-muted-foreground">
                          {payout.createdAt
                            ? new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(
                                new Date(payout.createdAt),
                              )
                            : "Unknown"}
                        </TableCell>
                        <TableCell className="text-right font-bold text-foreground">
                          {formatCurrency(payout.amount)}
                        </TableCell>
                        <TableCell className="text-center">
                          <PayoutStatusBadge status={payout.status} />
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {payout.status === "REJECTED" && payout.adminNote ? (
                            <span className="font-medium text-destructive">
                              Rejected: {payout.adminNote}
                            </span>
                          ) : payout.status === "TRANSFERRED" && payout.resolvedAt ? (
                            <span className="text-emerald-700">
                              Completed on{" "}
                              {new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(
                                new Date(payout.resolvedAt),
                              )}
                            </span>
                          ) : payout.status === "APPROVED" ? (
                            "Approved and waiting for transfer."
                          ) : (
                            "Pending processing..."
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <AffiliatePagination
                page={page}
                totalPages={payoutsData?.totalPages ?? 1}
                totalElements={payoutsData?.totalElements ?? 0}
                size={payoutsData?.size ?? PAYOUT_PAGE_SIZE}
                itemLabel="payout records"
                onPageChange={setPage}
                isDisabled={isFetchingPayouts}
              />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
