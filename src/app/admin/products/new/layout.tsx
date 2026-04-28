import type { Metadata } from "next";
import type { PropsWithChildren } from "react";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Create Product",
  description:
    "Create a new AffiSmart Mall product with category, SKU, price, inventory, and product image details.",
  path: "/admin/products/new",
  noIndex: true,
});

export default function AdminNewProductLayout({ children }: PropsWithChildren) {
  return children;
}
