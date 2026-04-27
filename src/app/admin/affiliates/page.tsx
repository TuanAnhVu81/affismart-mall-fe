"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  BadgeDollarSign,
  CheckCircle2,
  Clock3,
} from "lucide-react";
import { toast } from "sonner";
import { DataTable, type DataTableColumn } from "@/components/admin/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  useAdminAffiliateAccounts,
  useAdminPayoutRequests,
  useUpdateAdminAffiliateAccountStatus,
  useUpdateAdminAffiliateCommissionRate,
  useUpdateAdminPayoutRequestStatus,
} from "@/hooks/useAdmin";
import {
  adminAffiliateCommissionRateSchema,
  adminPayoutDecisionSchema,
  type AdminAffiliateCommissionRateFormInputValues,
  type AdminAffiliateCommissionRateFormValues,
  type AdminPayoutDecisionFormValues,
} from "@/lib/validators";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import type {
  AdminAffiliateAccount,
  AdminPayoutRequest,
} from "@/types/admin.types";
import type { AffiliateAccountStatus, PayoutStatus } from "@/types/affiliate.types";

interface ApiErrorResponse {
  message?: string;
}

const ACCOUNTS_PAGE_SIZE = 8;
const PAYOUTS_PAGE_SIZE = 8;
type PayoutDecisionStatus = AdminPayoutDecisionFormValues["status"];

const AFFILIATE_STATUS_STYLES: Record<AffiliateAccountStatus, string> = {
  PENDING: "border-amber-200 bg-amber-50 text-amber-700",
  APPROVED: "border-emerald-200 bg-emerald-50 text-emerald-700",
  REJECTED: "border-rose-200 bg-rose-50 text-rose-700",
  SUSPENDED: "border-slate-200 bg-slate-50 text-slate-700",
};

const PAYOUT_STATUS_STYLES: Record<PayoutStatus, string> = {
  PENDING: "border-amber-200 bg-amber-50 text-amber-700",
  APPROVED: "border-sky-200 bg-sky-50 text-sky-700",
  TRANSFERRED: "border-emerald-200 bg-emerald-50 text-emerald-700",
  REJECTED: "border-rose-200 bg-rose-50 text-rose-700",
};

const getErrorMessage = (error: unknown, fallback: string) => {
  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    return error.response?.data?.message ?? fallback;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
};

const getAffiliateStatusActions = (status: AffiliateAccountStatus): AffiliateAccountStatus[] => {
  switch (status) {
    case "PENDING":
      return ["APPROVED", "REJECTED"];
    case "APPROVED":
      return ["SUSPENDED"];
    case "REJECTED":
    case "SUSPENDED":
      return ["APPROVED"];
    default:
      return [];
  }
};

const getPayoutStatusActions = (status: PayoutStatus): PayoutDecisionStatus[] => {
  switch (status) {
    case "PENDING":
      return ["APPROVED", "TRANSFERRED", "REJECTED"];
    case "APPROVED":
      return ["TRANSFERRED", "REJECTED"];
    default:
      return [];
  }
};

export default function AdminAffiliatesPage() {
  const [activeTab, setActiveTab] = useState("accounts");
  const [accountsPage, setAccountsPage] = useState(1);
  const [payoutsPage, setPayoutsPage] = useState(1);
  const [accountStatusFilter, setAccountStatusFilter] = useState<AffiliateAccountStatus | "ALL">("ALL");
  const [payoutStatusFilter, setPayoutStatusFilter] = useState<PayoutStatus | "ALL">("ALL");
  const [accountToUpdate, setAccountToUpdate] = useState<AdminAffiliateAccount | null>(null);
  const [accountToEditRate, setAccountToEditRate] = useState<AdminAffiliateAccount | null>(null);
  const [payoutToReview, setPayoutToReview] = useState<AdminPayoutRequest | null>(null);

  const accountsQuery = useAdminAffiliateAccounts({
    page: accountsPage - 1,
    size: ACCOUNTS_PAGE_SIZE,
    sortBy: "created_at",
    sortDir: "desc",
    status: accountStatusFilter === "ALL" ? undefined : accountStatusFilter,
  });
  const payoutsQuery = useAdminPayoutRequests({
    page: payoutsPage - 1,
    size: PAYOUTS_PAGE_SIZE,
    sortBy: "created_at",
    sortDir: "desc",
    status: payoutStatusFilter === "ALL" ? undefined : payoutStatusFilter,
  });

  const updateAccountStatusMutation = useUpdateAdminAffiliateAccountStatus();
  const updateCommissionRateMutation = useUpdateAdminAffiliateCommissionRate();
  const updatePayoutMutation = useUpdateAdminPayoutRequestStatus();

  const commissionRateForm = useForm<
    AdminAffiliateCommissionRateFormInputValues,
    unknown,
    AdminAffiliateCommissionRateFormValues
  >({
    resolver: zodResolver(adminAffiliateCommissionRateSchema),
    defaultValues: { commissionRate: 10 },
  });

  const payoutDecisionForm = useForm<AdminPayoutDecisionFormValues>({
    resolver: zodResolver(adminPayoutDecisionSchema),
    defaultValues: {
      status: "APPROVED",
      adminNote: "",
    },
  });

  const accounts = useMemo(() => accountsQuery.data?.content ?? [], [accountsQuery.data?.content]);
  const payouts = useMemo(() => payoutsQuery.data?.content ?? [], [payoutsQuery.data?.content]);

  const summary = useMemo(
    () => ({
      pendingAccounts: accounts.filter((account) => account.status === "PENDING").length,
      approvedAccounts: accounts.filter((account) => account.status === "APPROVED").length,
      pendingPayouts: payouts.filter((request) => request.status === "PENDING").length,
      transferredPayouts: payouts.filter((request) => request.status === "TRANSFERRED").length,
    }),
    [accounts, payouts],
  );

  const handleAccountStatusUpdate = async (nextStatus: AffiliateAccountStatus) => {
    if (!accountToUpdate) {
      return;
    }

    try {
      await updateAccountStatusMutation.mutateAsync({
        accountId: accountToUpdate.id,
        payload: { status: nextStatus },
      });
      toast.success("Affiliate account status updated successfully.");
      setAccountToUpdate(null);
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to update affiliate account status."));
    }
  };

  const handleCommissionRateUpdate = async (
    values: AdminAffiliateCommissionRateFormValues,
  ) => {
    if (!accountToEditRate) {
      return;
    }

    try {
      await updateCommissionRateMutation.mutateAsync({
        accountId: accountToEditRate.id,
        payload: { commissionRate: values.commissionRate },
      });
      toast.success("Commission rate updated successfully.");
      setAccountToEditRate(null);
      commissionRateForm.reset();
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to update commission rate."));
    }
  };

  const handlePayoutReview = async (values: AdminPayoutDecisionFormValues) => {
    if (!payoutToReview) {
      return;
    }

    try {
      await updatePayoutMutation.mutateAsync({
        payoutRequestId: payoutToReview.id,
        payload: {
          status: values.status,
          adminNote: values.adminNote?.trim() || undefined,
        },
      });
      toast.success("Payout request updated successfully.");
      setPayoutToReview(null);
      payoutDecisionForm.reset();
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to update payout request."));
    }
  };

  const accountColumns: DataTableColumn<AdminAffiliateAccount>[] = [
    {
      key: "affiliate",
      header: "Affiliate",
      cell: (account) => (
        <div className="space-y-1">
          <p className="font-semibold text-foreground">{account.fullName || "Affiliate user"}</p>
          <p className="text-sm text-muted-foreground">{account.email || `User #${account.userId}`}</p>
        </div>
      ),
      skeletonClassName: "max-w-[14rem]",
    },
    {
      key: "channel",
      header: "Channel",
      cell: (account) => (
        <div className="space-y-1">
          <p className="text-sm font-medium text-foreground">{account.promotionChannel}</p>
          <p className="text-xs text-muted-foreground">Ref code: {account.refCode}</p>
        </div>
      ),
      skeletonClassName: "max-w-[12rem]",
    },
    {
      key: "commissionRate",
      header: "Rate",
      cell: (account) => <span className="font-semibold text-foreground">{account.commissionRate}%</span>,
      cellClassName: "w-[7rem]",
      skeletonClassName: "max-w-[4rem]",
    },
    {
      key: "status",
      header: "Status",
      cell: (account) => (
        <Badge
          variant="outline"
          className={`rounded-full px-3 py-1 text-xs ${AFFILIATE_STATUS_STYLES[account.status]}`}
        >
          {account.status}
        </Badge>
      ),
      cellClassName: "w-[8rem]",
      skeletonClassName: "max-w-[6rem]",
    },
    {
      key: "balance",
      header: "Balance",
      cell: (account) => (
        <span className="font-semibold text-foreground">{formatCurrency(account.balance)}</span>
      ),
      cellClassName: "w-[9rem]",
      skeletonClassName: "max-w-[6rem]",
    },
    {
      key: "actions",
      header: "Actions",
      headerClassName: "text-right",
      cellClassName: "w-[18rem] text-right",
      cell: (account) => (
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="rounded-full"
            onClick={() => {
              setAccountToEditRate(account);
              commissionRateForm.reset({ commissionRate: account.commissionRate });
            }}
          >
            Edit rate
          </Button>
          {getAffiliateStatusActions(account.status).length ? (
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="rounded-full"
              onClick={() => setAccountToUpdate(account)}
            >
              Review status
            </Button>
          ) : null}
        </div>
      ),
      skeletonClassName: "ml-auto max-w-[11rem]",
    },
  ];

  const payoutColumns: DataTableColumn<AdminPayoutRequest>[] = [
    {
      key: "affiliate",
      header: "Affiliate",
      cell: (request) => (
        <div className="space-y-1">
          <p className="font-semibold text-foreground">{request.affiliateFullName || "Affiliate user"}</p>
          <p className="text-sm text-muted-foreground">{request.affiliateEmail || request.affiliateRefCode}</p>
        </div>
      ),
      skeletonClassName: "max-w-[14rem]",
    },
    {
      key: "amount",
      header: "Amount",
      cell: (request) => <span className="font-semibold text-foreground">{formatCurrency(request.amount)}</span>,
      cellClassName: "w-[9rem]",
      skeletonClassName: "max-w-[6rem]",
    },
    {
      key: "bankInfo",
      header: "Bank info",
      cell: (request) => (
        <p className="max-w-[18rem] truncate text-sm text-muted-foreground" title={request.bankInfo ?? "Not provided"}>
          {request.bankInfo ?? "Not provided"}
        </p>
      ),
      skeletonClassName: "max-w-[12rem]",
    },
    {
      key: "status",
      header: "Status",
      cell: (request) => (
        <Badge
          variant="outline"
          className={`rounded-full px-3 py-1 text-xs ${PAYOUT_STATUS_STYLES[request.status]}`}
        >
          {request.status}
        </Badge>
      ),
      cellClassName: "w-[8rem]",
      skeletonClassName: "max-w-[6rem]",
    },
    {
      key: "createdAt",
      header: "Requested",
      cell: (request) => (
        <span className="text-sm text-muted-foreground">
          {request.createdAt ? formatDate(request.createdAt) : "Recently"}
        </span>
      ),
      cellClassName: "w-[8rem]",
      skeletonClassName: "max-w-[5rem]",
    },
    {
      key: "actions",
      header: "Actions",
      headerClassName: "text-right",
      cellClassName: "w-[10rem] text-right",
      cell: (request) => {
        const options = getPayoutStatusActions(request.status);

        if (!options.length) {
          return <span className="text-sm text-muted-foreground">No action</span>;
        }

        return (
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="rounded-full"
            onClick={() => {
              setPayoutToReview(request);
              payoutDecisionForm.reset({
                status: options[0],
                adminNote: request.adminNote ?? "",
              });
            }}
          >
            Review
          </Button>
        );
      },
      skeletonClassName: "ml-auto max-w-[7rem]",
    },
  ];

  return (
    <div className="space-y-6">
      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.55fr)_repeat(3,minmax(0,1fr))]">
        <div className="rounded-[28px] border border-border/80 bg-gradient-to-br from-primary/8 via-background to-emerald-50/40 px-5 py-6 shadow-soft sm:px-6">
          <Badge className="rounded-full bg-white/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">
            Affiliate operations
          </Badge>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-foreground">
            Approvals, commission rate, and payout review
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Keep affiliate onboarding and payout decisions in one place, with clear status badges and controlled admin actions.
          </p>
        </div>

        <div className="rounded-[28px] border border-border/80 bg-background px-5 py-6 shadow-soft sm:px-6">
          <div className="flex items-center gap-3">
            <span className="flex size-11 items-center justify-center rounded-2xl bg-amber-50 text-amber-700">
              <Clock3 className="size-5" />
            </span>
            <div>
              <p className="text-sm text-muted-foreground">Pending accounts</p>
              <p className="text-3xl font-semibold tracking-tight text-foreground">{summary.pendingAccounts}</p>
            </div>
          </div>
        </div>

        <div className="rounded-[28px] border border-border/80 bg-background px-5 py-6 shadow-soft sm:px-6">
          <div className="flex items-center gap-3">
            <span className="flex size-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
              <CheckCircle2 className="size-5" />
            </span>
            <div>
              <p className="text-sm text-muted-foreground">Approved accounts</p>
              <p className="text-3xl font-semibold tracking-tight text-foreground">{summary.approvedAccounts}</p>
            </div>
          </div>
        </div>

        <div className="rounded-[28px] border border-border/80 bg-background px-5 py-6 shadow-soft sm:px-6">
          <div className="flex items-center gap-3">
            <span className="flex size-11 items-center justify-center rounded-2xl bg-primary/8 text-primary">
              <BadgeDollarSign className="size-5" />
            </span>
            <div>
              <p className="text-sm text-muted-foreground">Pending payouts</p>
              <p className="text-3xl font-semibold tracking-tight text-foreground">{summary.pendingPayouts}</p>
            </div>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            {summary.transferredPayouts} transferred request(s) on the current page.
          </p>
        </div>
      </section>

      <section className="space-y-4">
        <div className="inline-flex rounded-full border border-border/80 bg-muted/20 p-1 shadow-sm">
          <button
            type="button"
            className={cn(
              "inline-flex h-11 items-center rounded-full px-5 text-sm font-semibold transition-all",
              activeTab === "accounts"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
            onClick={() => setActiveTab("accounts")}
          >
            Affiliate accounts
          </button>
          <button
            type="button"
            className={cn(
              "inline-flex h-11 items-center rounded-full px-5 text-sm font-semibold transition-all",
              activeTab === "payouts"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
            onClick={() => setActiveTab("payouts")}
          >
            Payout requests
          </button>
        </div>

        {activeTab === "accounts" ? (
          <DataTable
            title="Affiliate accounts"
            description="Approve or reject applications, reopen suspended partners when needed, and tune commission rate without leaving the table."
            columns={accountColumns}
            data={accounts}
            isLoading={accountsQuery.isLoading}
            emptyTitle={accountsQuery.error ? "Could not load affiliate accounts" : "No affiliate accounts found"}
            emptyDescription={
              accountsQuery.error
                ? getErrorMessage(accountsQuery.error, "Please try again in a moment.")
                : "Affiliate applications and approved partner accounts will appear here."
            }
            pagination={{
              page: accountsQuery.data?.page ?? 0,
              size: accountsQuery.data?.size ?? ACCOUNTS_PAGE_SIZE,
              totalElements: accountsQuery.data?.totalElements ?? 0,
              totalPages: accountsQuery.data?.totalPages ?? 0,
              onPageChange: (nextPage) => setAccountsPage(nextPage + 1),
              itemLabel: "accounts",
              isDisabled: accountsQuery.isFetching,
            }}
            toolbar={
              <Select
                value={accountStatusFilter}
                onValueChange={(value) => {
                  setAccountStatusFilter(value as AffiliateAccountStatus | "ALL");
                  setAccountsPage(1);
                }}
              >
                <SelectTrigger className="h-11 min-w-44 rounded-full bg-background">
                  <span className="truncate text-left">
                    {accountStatusFilter === "ALL" ? "All statuses" : accountStatusFilter}
                  </span>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All statuses</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="APPROVED">Approved</SelectItem>
                  <SelectItem value="REJECTED">Rejected</SelectItem>
                  <SelectItem value="SUSPENDED">Suspended</SelectItem>
                </SelectContent>
              </Select>
            }
          />
        ) : null}

        {activeTab === "payouts" ? (
          <DataTable
            title="Payout requests"
            description="Review withdrawal requests carefully. Use admin notes for audit context when you approve, transfer, or reject a payout."
            columns={payoutColumns}
            data={payouts}
            isLoading={payoutsQuery.isLoading}
            emptyTitle={payoutsQuery.error ? "Could not load payout requests" : "No payout requests found"}
            emptyDescription={
              payoutsQuery.error
                ? getErrorMessage(payoutsQuery.error, "Please try again in a moment.")
                : "Approved affiliates will create payout requests here once their balance is eligible."
            }
            pagination={{
              page: payoutsQuery.data?.page ?? 0,
              size: payoutsQuery.data?.size ?? PAYOUTS_PAGE_SIZE,
              totalElements: payoutsQuery.data?.totalElements ?? 0,
              totalPages: payoutsQuery.data?.totalPages ?? 0,
              onPageChange: (nextPage) => setPayoutsPage(nextPage + 1),
              itemLabel: "requests",
              isDisabled: payoutsQuery.isFetching,
            }}
            toolbar={
              <Select
                value={payoutStatusFilter}
                onValueChange={(value) => {
                  setPayoutStatusFilter(value as PayoutStatus | "ALL");
                  setPayoutsPage(1);
                }}
              >
                <SelectTrigger className="h-11 min-w-44 rounded-full bg-background">
                  <span className="truncate text-left">
                    {payoutStatusFilter === "ALL" ? "All statuses" : payoutStatusFilter}
                  </span>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All statuses</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="APPROVED">Approved</SelectItem>
                  <SelectItem value="TRANSFERRED">Transferred</SelectItem>
                  <SelectItem value="REJECTED">Rejected</SelectItem>
                </SelectContent>
              </Select>
            }
          />
        ) : null}
      </section>

      <Dialog
        open={Boolean(accountToUpdate)}
        onOpenChange={(open) => {
          if (!open) {
            setAccountToUpdate(null);
          }
        }}
      >
        <DialogContent className="max-w-lg rounded-[28px] border border-border/80 bg-background p-0">
          <DialogHeader className="border-b border-border/70 px-5 py-5 sm:px-6">
            <DialogTitle className="text-2xl font-semibold tracking-tight">
              Update affiliate account status
            </DialogTitle>
            <DialogDescription className="leading-6">
              Confirm the next action for this affiliate account. Approved accounts gain affiliate access, while rejection or suspension limits access.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 px-5 py-5 sm:px-6">
            {accountToUpdate ? (
              getAffiliateStatusActions(accountToUpdate.status).map((status) => (
                <button
                  key={status}
                  type="button"
                  className="flex w-full items-center justify-between rounded-2xl border border-border/70 bg-muted/10 px-4 py-4 text-left transition-colors hover:border-primary/15 hover:bg-primary/[0.04]"
                  onClick={() => void handleAccountStatusUpdate(status)}
                  disabled={updateAccountStatusMutation.isPending}
                >
                  <div>
                    <p className="font-semibold text-foreground">
                      {status === "APPROVED"
                        ? "Approve account"
                        : status === "REJECTED"
                          ? "Reject application"
                          : "Suspend account"}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {status === "APPROVED"
                        ? "Grant affiliate access and enable portal features."
                        : status === "REJECTED"
                          ? "Reject the application and keep access closed."
                          : "Temporarily disable affiliate access for this partner."}
                    </p>
                  </div>
                  <Badge variant="outline" className={`rounded-full px-3 py-1 text-xs ${AFFILIATE_STATUS_STYLES[status]}`}>
                    {status}
                  </Badge>
                </button>
              ))
            ) : null}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(accountToEditRate)}
        onOpenChange={(open) => {
          if (!open) {
            setAccountToEditRate(null);
            commissionRateForm.reset();
          }
        }}
      >
        <DialogContent className="max-w-xl rounded-[28px] border border-border/80 bg-background p-0">
          <form onSubmit={commissionRateForm.handleSubmit(handleCommissionRateUpdate)}>
            <DialogHeader className="border-b border-border/70 px-5 py-5 sm:px-6">
              <DialogTitle className="text-2xl font-semibold tracking-tight">
                Update commission rate
              </DialogTitle>
              <DialogDescription className="leading-6">
                Adjust the payout percentage for this affiliate account. The backend accepts values from 0 to 100 with up to two decimal places.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 px-5 py-5 sm:px-6">
              <div className="rounded-2xl border border-border/70 bg-muted/10 p-4">
                <p className="font-semibold text-foreground">{accountToEditRate?.fullName || "Affiliate user"}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Current rate: {accountToEditRate?.commissionRate ?? 0}%
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Commission rate (%)</label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  className="h-11 rounded-2xl"
                  {...commissionRateForm.register("commissionRate")}
                />
                {commissionRateForm.formState.errors.commissionRate ? (
                  <p className="text-sm text-destructive">
                    {commissionRateForm.formState.errors.commissionRate.message}
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Example: 8.5 means the affiliate receives 8.5% commission.
                  </p>
                )}
              </div>
            </div>

            <DialogFooter className="rounded-b-[28px]">
              <Button
                type="button"
                variant="outline"
                className="h-10 rounded-full"
                onClick={() => {
                  setAccountToEditRate(null);
                  commissionRateForm.reset();
                }}
                disabled={updateCommissionRateMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="h-10 rounded-full shadow-sm"
                disabled={updateCommissionRateMutation.isPending}
              >
                {updateCommissionRateMutation.isPending ? "Saving..." : "Save rate"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(payoutToReview)}
        onOpenChange={(open) => {
          if (!open) {
            setPayoutToReview(null);
            payoutDecisionForm.reset();
          }
        }}
      >
        <DialogContent className="max-w-2xl rounded-[28px] border border-border/80 bg-background p-0">
          <form onSubmit={payoutDecisionForm.handleSubmit(handlePayoutReview)}>
            <DialogHeader className="border-b border-border/70 px-5 py-5 sm:px-6">
              <DialogTitle className="text-2xl font-semibold tracking-tight">
                Review payout request
              </DialogTitle>
              <DialogDescription className="leading-6">
                Choose the next payout status carefully. Rejections refund the affiliate balance, while transferred marks linked commissions as paid.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 px-5 py-5 sm:px-6">
              <div className="grid gap-3 rounded-2xl border border-border/70 bg-muted/10 p-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Affiliate</p>
                  <p className="mt-1 font-semibold text-foreground">
                    {payoutToReview?.affiliateFullName || "Affiliate user"}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Amount</p>
                  <p className="mt-1 font-semibold text-foreground">
                    {formatCurrency(payoutToReview?.amount ?? 0)}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Next status</label>
                <Controller
                  control={payoutDecisionForm.control}
                  name="status"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="h-11 rounded-2xl bg-background">
                        <span className="truncate text-left">{field.value}</span>
                      </SelectTrigger>
                      <SelectContent>
                        {(payoutToReview ? getPayoutStatusActions(payoutToReview.status) : []).map((status) => (
                          <SelectItem key={status} value={status}>
                            {status}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {payoutDecisionForm.formState.errors.status ? (
                  <p className="text-sm text-destructive">
                    {payoutDecisionForm.formState.errors.status.message}
                  </p>
                ) : null}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Admin note</label>
                <Textarea
                  rows={4}
                  placeholder="Optional note for audit context or transfer reference"
                  {...payoutDecisionForm.register("adminNote")}
                />
                {payoutDecisionForm.formState.errors.adminNote ? (
                  <p className="text-sm text-destructive">
                    {payoutDecisionForm.formState.errors.adminNote.message}
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Admin note is optional and capped at 1000 characters by the backend.
                  </p>
                )}
              </div>
            </div>

            <DialogFooter className="rounded-b-[28px]">
              <Button
                type="button"
                variant="outline"
                className="h-10 rounded-full"
                onClick={() => {
                  setPayoutToReview(null);
                  payoutDecisionForm.reset();
                }}
                disabled={updatePayoutMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="h-10 rounded-full shadow-sm"
                disabled={updatePayoutMutation.isPending}
              >
                {updatePayoutMutation.isPending ? "Updating..." : "Save decision"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
