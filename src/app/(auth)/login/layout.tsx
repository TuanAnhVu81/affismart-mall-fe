import type { Metadata } from "next";
import type { PropsWithChildren } from "react";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Sign In",
  description:
    "Sign in to AffiSmart Mall to continue shopping, manage orders, and access protected account features.",
  path: "/login",
  noIndex: true,
});

export default function LoginPageLayout({ children }: PropsWithChildren) {
  return children;
}
