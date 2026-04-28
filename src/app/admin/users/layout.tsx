import type { Metadata } from "next";
import type { PropsWithChildren } from "react";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Admin Users",
  description:
    "Manage AffiSmart Mall users, account status, roles, and administrative user operations.",
  path: "/admin/users",
  noIndex: true,
});

export default function AdminUsersLayout({ children }: PropsWithChildren) {
  return children;
}
