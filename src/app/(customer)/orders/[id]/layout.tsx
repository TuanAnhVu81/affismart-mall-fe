import type { Metadata } from "next";
import type { PropsWithChildren } from "react";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Order Details",
  description:
    "Review the item details, totals, and shipping information for an AffiSmart Mall order.",
  path: "/orders",
  noIndex: true,
});

export default function OrderDetailPageLayout({ children }: PropsWithChildren) {
  return children;
}
