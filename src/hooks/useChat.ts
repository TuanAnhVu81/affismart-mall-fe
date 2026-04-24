"use client";

import { useMutation } from "@tanstack/react-query";
import { sendChatMessage } from "@/services/ai.service";

export const useChat = () =>
  useMutation({
    mutationFn: ({
      message,
      sessionId,
    }: {
      message: string;
      sessionId?: string;
    }) => sendChatMessage(message, sessionId),
  });
