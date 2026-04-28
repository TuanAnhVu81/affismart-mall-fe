import type { Metadata } from "next";
import type { PropsWithChildren } from "react";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Blocked IPs",
  description:
    "Review and manage IP addresses blocked by AffiSmart Mall affiliate click-tracking protection.",
  path: "/admin/blocked-ips",
  noIndex: true,
});

export default function AdminBlockedIpsLayout({ children }: PropsWithChildren) {
  return children;
}
