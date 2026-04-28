import type { Metadata } from "next";
import type { PropsWithChildren } from "react";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Checkout",
  description:
    "Complete secure checkout for your AffiSmart Mall cart and confirm shipping details.",
  path: "/checkout",
  noIndex: true,
});

export default function CheckoutPageLayout({ children }: PropsWithChildren) {
  return children;
}
