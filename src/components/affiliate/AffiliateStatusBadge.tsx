import { Badge } from "@/components/ui/badge";
import type { CommissionStatus, PayoutStatus } from "@/types/affiliate.types";

const COMMISSION_STATUS_STYLES: Record<CommissionStatus, string> = {
  PENDING: "border-amber-200 bg-amber-50 text-amber-700",
  APPROVED: "border-sky-200 bg-sky-50 text-sky-700",
  PAID: "border-emerald-200 bg-emerald-50 text-emerald-700",
  REJECTED: "border-rose-200 bg-rose-50 text-rose-700",
};

const COMMISSION_STATUS_LABELS: Record<CommissionStatus, string> = {
  PENDING: "Pending",
  APPROVED: "Approved",
  PAID: "Paid",
  REJECTED: "Rejected",
};

const PAYOUT_STATUS_STYLES: Record<PayoutStatus, string> = {
  PENDING: "border-amber-200 bg-amber-50 text-amber-700",
  APPROVED: "border-sky-200 bg-sky-50 text-sky-700",
  TRANSFERRED: "border-emerald-200 bg-emerald-50 text-emerald-700",
  REJECTED: "border-rose-200 bg-rose-50 text-rose-700",
};

const PAYOUT_STATUS_LABELS: Record<PayoutStatus, string> = {
  PENDING: "Processing",
  APPROVED: "Approved",
  TRANSFERRED: "Transferred",
  REJECTED: "Rejected",
};

export function CommissionStatusBadge({ status }: { status: CommissionStatus }) {
  return (
    <Badge variant="outline" className={COMMISSION_STATUS_STYLES[status]}>
      {COMMISSION_STATUS_LABELS[status]}
    </Badge>
  );
}

export function PayoutStatusBadge({ status }: { status: PayoutStatus }) {
  return (
    <Badge variant="outline" className={PAYOUT_STATUS_STYLES[status]}>
      {PAYOUT_STATUS_LABELS[status]}
    </Badge>
  );
}

export function ReferralLinkStatusBadge({ isActive }: { isActive: boolean }) {
  return (
    <Badge
      variant="outline"
      className={
        isActive
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : "border-slate-200 bg-slate-50 text-slate-600"
      }
    >
      {isActive ? "Active" : "Inactive"}
    </Badge>
  );
}
