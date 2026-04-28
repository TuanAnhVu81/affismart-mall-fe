import type { Metadata } from "next";
import type { PropsWithChildren } from "react";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Affiliate Application Pending",
  description:
    "Your AffiSmart Mall affiliate application is pending review before affiliate portal access is unlocked.",
  path: "/affiliate/pending",
  noIndex: true,
});

export default function AffiliatePendingLayout({ children }: PropsWithChildren) {
  return children;
}
