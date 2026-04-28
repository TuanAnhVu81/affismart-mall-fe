"use client";

import dynamic from "next/dynamic";

export const LazyChatbotWidget = dynamic(
  () =>
    import("@/components/ai/ChatbotWidget").then(
      (module) => module.ChatbotWidget,
    ),
  {
    loading: () => null,
    ssr: false,
  },
);
