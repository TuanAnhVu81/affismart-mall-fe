import type { Metadata } from "next";
import type { PropsWithChildren } from "react";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Admin Order Review",
  description:
    "Inspect AffiSmart Mall order items, totals, shipping address, and allowed fulfillment transitions.",
  path: "/admin/orders",
  noIndex: true,
});

export default function AdminOrderDetailLayout({ children }: PropsWithChildren) {
  return children;
}
