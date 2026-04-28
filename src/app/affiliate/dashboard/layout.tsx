import type { Metadata } from "next";
import type { PropsWithChildren } from "react";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Affiliate Dashboard",
  description:
    "Track affiliate clicks, conversions, commissions, balance, and recent AffiSmart Mall partner activity.",
  path: "/affiliate/dashboard",
  noIndex: true,
});

export default function AffiliateDashboardLayout({ children }: PropsWithChildren) {
  return children;
}
