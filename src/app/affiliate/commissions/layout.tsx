import type { Metadata } from "next";
import type { PropsWithChildren } from "react";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Affiliate Commissions",
  description:
    "Review AffiSmart Mall affiliate commission records, payout status, and attributed orders.",
  path: "/affiliate/commissions",
  noIndex: true,
});

export default function AffiliateCommissionsLayout({ children }: PropsWithChildren) {
  return children;
}
