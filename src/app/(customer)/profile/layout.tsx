import type { Metadata } from "next";
import type { PropsWithChildren } from "react";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "My Profile",
  description: "View your AffiSmart Mall account profile, role, and account status.",
  path: "/profile",
  noIndex: true,
});

export default function ProfileLayout({ children }: PropsWithChildren) {
  return children;
}
