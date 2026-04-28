import type { Metadata } from "next";
import type { PropsWithChildren } from "react";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Admin Orders",
  description:
    "Review AffiSmart Mall orders, fulfillment status, shipping details, and operational order flow.",
  path: "/admin/orders",
  noIndex: true,
});

export default function AdminOrdersLayout({ children }: PropsWithChildren) {
  return children;
}
