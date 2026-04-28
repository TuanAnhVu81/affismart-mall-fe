import type { Metadata } from "next";
import type { PropsWithChildren } from "react";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Referral Links",
  description:
    "Create, copy, and manage AffiSmart Mall affiliate referral links for products and storefront campaigns.",
  path: "/affiliate/links",
  noIndex: true,
});

export default function AffiliateLinksLayout({ children }: PropsWithChildren) {
  return children;
}
