"use client";

import axios from "axios";
import { useMemo, useState } from "react";
import { AlertTriangle, Ban } from "lucide-react";
import { toast } from "sonner";
import { DataTable, type DataTableColumn } from "@/components/admin/DataTable";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAdminBlockedIps, useUnblockAdminBlockedIp } from "@/hooks/useAdmin";
import { formatDate } from "@/lib/utils";
import type { BlockedIpEntry } from "@/types/admin.types";

interface ApiErrorResponse {
  message?: string;
}

const getErrorMessage = (error: unknown, fallback: string) => {
  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    return error.response?.data?.message ?? fallback;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
};

export default function AdminBlockedIpsPage() {
  const [ipToUnblock, setIpToUnblock] = useState<BlockedIpEntry | null>(null);
  const blockedIpsQuery = useAdminBlockedIps();
  const unblockMutation = useUnblockAdminBlockedIp();

  const blockedIps = useMemo(() => blockedIpsQuery.data?.items ?? [], [blockedIpsQuery.data?.items]);

  const stats = useMemo(
    () => ({
      expiringSoon: blockedIps.filter((item) => {
        if (!item.expiresAt) {
          return false;
        }

        const expiresAt = new Date(item.expiresAt);
        const now = new Date();
        const diffInMinutes = (expiresAt.getTime() - now.getTime()) / 60000;
        return diffInMinutes > 0 && diffInMinutes <= 60;
      }).length,
    }),
    [blockedIps],
  );

  const handleUnblock = async () => {
    if (!ipToUnblock) {
      return;
    }

    try {
      await unblockMutation.mutateAsync(ipToUnblock.ipAddress);
      toast.success("Blocked IP removed successfully.");
      setIpToUnblock(null);
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to unblock IP."));
    }
  };

  const columns: DataTableColumn<BlockedIpEntry>[] = [
    {
      key: "ipAddress",
      header: "IP address",
      cell: (entry) => <span className="font-semibold text-foreground">{entry.ipAddress}</span>,
      cellClassName: "w-[11rem]",
      skeletonClassName: "max-w-[7rem]",
    },
    {
      key: "reason",
      header: "Reason",
      cell: (entry) => <p className="max-w-[26rem] text-sm leading-6 text-muted-foreground">{entry.reason}</p>,
      skeletonClassName: "max-w-[16rem]",
    },
    {
      key: "blockedAt",
      header: "Blocked at",
      cell: (entry) => (
        <span className="text-sm text-muted-foreground">
          {entry.blockedAt ? formatDate(entry.blockedAt) : "Recently"}
        </span>
      ),
      cellClassName: "w-[8rem]",
      skeletonClassName: "max-w-[5rem]",
    },
    {
      key: "expiresAt",
      header: "Expires",
      cell: (entry) =>
        entry.expiresAt ? (
          <Badge variant="outline" className="rounded-full px-3 py-1 text-xs">
            {formatDate(entry.expiresAt)}
          </Badge>
        ) : (
          <Badge variant="outline" className="rounded-full border-amber-200 bg-amber-50 px-3 py-1 text-xs text-amber-700">
            No expiry
          </Badge>
        ),
      cellClassName: "w-[8rem]",
      skeletonClassName: "max-w-[6rem]",
    },
    {
      key: "actions",
      header: "Actions",
      headerClassName: "text-right",
      cellClassName: "w-[9rem] text-right",
      cell: (entry) => (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="rounded-full"
          onClick={() => setIpToUnblock(entry)}
        >
          Unblock
        </Button>
      ),
      skeletonClassName: "ml-auto max-w-[7rem]",
    },
  ];

  return (
    <div className="space-y-6">
      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.55fr)_repeat(2,minmax(0,1fr))]">
        <div className="rounded-[28px] border border-border/80 bg-gradient-to-br from-primary/8 via-background to-rose-50/40 px-5 py-6 shadow-soft sm:px-6">
          <Badge className="rounded-full bg-white/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">
            Fraud control
          </Badge>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-foreground">
            Blocked affiliate click IPs
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Review temporary IP blocks created by affiliate click protection and remove them when you are confident the traffic is legitimate again.
          </p>
        </div>

        <div className="rounded-[28px] border border-border/80 bg-background px-5 py-6 shadow-soft sm:px-6">
          <div className="flex items-center gap-3">
            <span className="flex size-11 items-center justify-center rounded-2xl bg-rose-50 text-rose-700">
              <Ban className="size-5" />
            </span>
            <div>
              <p className="text-sm text-muted-foreground">Blocked IPs</p>
              <p className="text-3xl font-semibold tracking-tight text-foreground">{blockedIps.length}</p>
            </div>
          </div>
        </div>

        <div className="rounded-[28px] border border-border/80 bg-background px-5 py-6 shadow-soft sm:px-6">
          <div className="flex items-center gap-3">
            <span className="flex size-11 items-center justify-center rounded-2xl bg-amber-50 text-amber-700">
              <AlertTriangle className="size-5" />
            </span>
            <div>
              <p className="text-sm text-muted-foreground">Expiring within 1 hour</p>
              <p className="text-3xl font-semibold tracking-tight text-foreground">{stats.expiringSoon}</p>
            </div>
          </div>
        </div>
      </section>

      <DataTable
        title="Blocked IP list"
        description="These IPs are currently blocked from affiliate click tracking. Remove a block only after you verify the traffic is safe."
        columns={columns}
        data={blockedIps}
        isLoading={blockedIpsQuery.isLoading}
        emptyTitle={blockedIpsQuery.error ? "Could not load blocked IPs" : "No blocked IPs"}
        emptyDescription={
          blockedIpsQuery.error
            ? getErrorMessage(blockedIpsQuery.error, "Please try again in a moment.")
            : "The click-tracking protection layer has not blocked any IPs right now."
        }
      />

      <ConfirmDialog
        open={Boolean(ipToUnblock)}
        onOpenChange={(open) => {
          if (!open) {
            setIpToUnblock(null);
          }
        }}
        title="Remove this blocked IP?"
        description="This will let the IP participate in affiliate click tracking again immediately."
        confirmText="Unblock IP"
        isLoading={unblockMutation.isPending}
        onConfirm={handleUnblock}
      />
    </div>
  );
}
