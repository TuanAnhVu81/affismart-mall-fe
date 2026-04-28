import type { Metadata } from "next";
import type { PropsWithChildren } from "react";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Affiliate Payouts",
  description:
    "Request and review AffiSmart Mall affiliate payout history, payout status, and available balance.",
  path: "/affiliate/payouts",
  noIndex: true,
});

export default function AffiliatePayoutsLayout({ children }: PropsWithChildren) {
  return children;
}
