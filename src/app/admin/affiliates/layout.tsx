import type { Metadata } from "next";
import type { PropsWithChildren } from "react";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Admin Affiliates",
  description:
    "Review affiliate applications, commission rates, payout requests, and partner account status.",
  path: "/admin/affiliates",
  noIndex: true,
});

export default function AdminAffiliatesLayout({ children }: PropsWithChildren) {
  return children;
}
