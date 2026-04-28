import type { Metadata } from "next";
import { PaymentSuccessContent } from "@/components/payment/PaymentSuccessContent";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Payment Success | AffiSmart Mall",
  description:
    "Your payment has been completed successfully. Track your order status on AffiSmart Mall.",
  path: "/payment/success",
  noIndex: true,
});

interface PaymentSuccessPageProps {
  searchParams?: Record<string, string | string[] | undefined>;
}

const readSingleValue = (value?: string | string[]) =>
  Array.isArray(value) ? value[0] : value;

export default function PaymentSuccessPage({
  searchParams,
}: PaymentSuccessPageProps) {
  const orderId =
    readSingleValue(searchParams?.order_id) ??
    readSingleValue(searchParams?.orderId) ??
    undefined;

  return (
    <main className="mx-auto min-h-screen w-full max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
      <PaymentSuccessContent orderId={orderId} />
    </main>
  );
}
