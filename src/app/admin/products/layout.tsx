import type { Metadata } from "next";
import type { PropsWithChildren } from "react";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Admin Products",
  description:
    "Manage AffiSmart Mall product catalog, pricing, images, stock levels, and product visibility.",
  path: "/admin/products",
  noIndex: true,
});

export default function AdminProductsLayout({ children }: PropsWithChildren) {
  return children;
}
