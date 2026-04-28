import type { Metadata } from "next";
import type { PropsWithChildren } from "react";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "My Orders",
  description:
    "View your AffiSmart Mall order history, payment state, and fulfillment progress.",
  path: "/orders",
  noIndex: true,
});

export default function OrdersPageLayout({ children }: PropsWithChildren) {
  return children;
}
