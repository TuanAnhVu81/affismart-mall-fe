import type { Metadata } from "next";
import type { PropsWithChildren } from "react";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Admin Categories",
  description:
    "Manage AffiSmart Mall category taxonomy, slugs, and storefront category visibility.",
  path: "/admin/categories",
  noIndex: true,
});

export default function AdminCategoriesLayout({ children }: PropsWithChildren) {
  return children;
}
