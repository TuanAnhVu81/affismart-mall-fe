import type { Metadata } from "next";
import type { PropsWithChildren } from "react";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Create Account",
  description:
    "Create an AffiSmart Mall account to shop products, place orders, and unlock future affiliate features.",
  path: "/register",
  noIndex: true,
});

export default function RegisterPageLayout({ children }: PropsWithChildren) {
  return children;
}
