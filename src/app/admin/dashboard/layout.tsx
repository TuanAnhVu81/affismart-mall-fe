import type { Metadata } from "next";
import type { PropsWithChildren } from "react";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Admin Dashboard",
  description:
    "Monitor AffiSmart Mall analytics, GMV, top products, affiliate performance, and low-stock inventory alerts.",
  path: "/admin/dashboard",
  noIndex: true,
});

export default function AdminDashboardLayout({ children }: PropsWithChildren) {
  return children;
}
