import type { Metadata } from "next";
import type { PropsWithChildren } from "react";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Edit Product",
  description:
    "Edit AffiSmart Mall product information, pricing, images, inventory, and storefront visibility.",
  path: "/admin/products",
  noIndex: true,
});

export default function AdminProductDetailLayout({ children }: PropsWithChildren) {
  return children;
}
