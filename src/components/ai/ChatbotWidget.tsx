"use client";

import { FormEvent, KeyboardEvent, useEffect, useRef, useState } from "react";
import {
  Bot,
  Loader2,
  MessageCircle,
  Send,
  Sparkles,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useChat } from "@/hooks/useChat";
import { cn } from "@/lib/utils";

type ChatMessageRole = "assistant" | "user";

interface ChatMessage {
  id: string;
  role: ChatMessageRole;
  content: string;
}

const createMessageId = () =>
  typeof window !== "undefined" && window.crypto?.randomUUID
    ? window.crypto.randomUUID()
    : `${Date.now()}-${Math.random()}`;

const parseMarkdown = (text: string) => {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={index} className="font-semibold">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <span key={index}>{part}</span>;
  });
};

const starterMessage: ChatMessage = {
  id: "starter",
  role: "assistant",
  content:
    "Hi, I am AffiSmart Assistant. Ask me about products, shopping help, or affiliate basics.",
};

export function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([starterMessage]);
  const messageListRef = useRef<HTMLDivElement>(null);
  const chatMutation = useChat();

  const isSending = chatMutation.isPending;
  const canSubmit = messageText.trim().length > 0 && !isSending;

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    messageListRef.current?.scrollTo({
      top: messageListRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [isOpen, isSending, messages]);

  const handleSubmit = async (event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault();

    const trimmedMessage = messageText.trim();
    if (!trimmedMessage || isSending) {
      return;
    }

    const userMessage: ChatMessage = {
      id: createMessageId(),
      role: "user",
      content: trimmedMessage,
    };

    setMessages((currentMessages) => [...currentMessages, userMessage]);
    setMessageText("");

    try {
      const response = await chatMutation.mutateAsync({
        message: trimmedMessage,
      });

      setMessages((currentMessages) => [
        ...currentMessages,
        {
          id: createMessageId(),
          role: "assistant",
          content: response.answer,
        },
      ]);
    } catch {
      setMessages((currentMessages) => [
        ...currentMessages,
        {
          id: createMessageId(),
          role: "assistant",
          content:
            "I could not reach the assistant right now. Please try again in a moment.",
        },
      ]);
    }
  };

  const handleComposerKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key !== "Enter" || event.shiftKey) {
      return;
    }

    event.preventDefault();
    void handleSubmit();
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 sm:bottom-6 sm:right-6">
      {isOpen ? (
        <section
          aria-label="AffiSmart AI chat"
          className="fixed inset-x-3 bottom-3 flex max-h-[calc(100vh-1.5rem)] flex-col overflow-hidden rounded-[1.75rem] border border-indigo-200/80 bg-white shadow-[0_24px_80px_rgba(79,70,229,0.25)] ring-1 ring-indigo-100 sm:inset-x-auto sm:bottom-6 sm:right-6 sm:h-[38rem] sm:w-[25rem]"
        >
          <div className="relative overflow-hidden border-b border-indigo-100 bg-gradient-to-br from-indigo-600 via-violet-600 to-sky-500 px-5 py-4 text-white">
            <div className="absolute right-[-3rem] top-[-4rem] size-32 rounded-full bg-white/20 blur-2xl" />
            <div className="relative flex items-start justify-between gap-4">
              <div className="flex gap-3">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/25">
                  <Bot className="size-5" />
                </span>
                <div>
                  <p className="text-sm font-semibold">AffiSmart Assistant</p>
                  <p className="mt-1 text-xs leading-5 text-white/80">
                    Product guidance and shopping support
                  </p>
                </div>
              </div>

              <Button
                type="button"
                size="icon"
                variant="ghost"
                aria-label="Close AI chat"
                className="size-9 rounded-full text-white hover:bg-white/15 hover:text-white"
                onClick={() => setIsOpen(false)}
              >
                <X className="size-4" />
              </Button>
            </div>
          </div>

          <div
            ref={messageListRef}
            className="flex-1 space-y-3 overflow-y-auto bg-gradient-to-b from-white via-slate-50/70 to-indigo-50/40 px-4 py-4"
          >
            {messages.map((message) => {
              const isUser = message.role === "user";

              return (
                <div
                  key={message.id}
                  className={cn(
                    "flex items-end gap-2",
                    isUser ? "justify-end" : "justify-start",
                  )}
                >
                  {!isUser ? (
                    <span className="mb-1 flex size-7 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
                      <Sparkles className="size-3.5" />
                    </span>
                  ) : null}
                  <div
                    className={cn(
                      "max-w-[82%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-6 shadow-sm",
                      isUser
                        ? "rounded-br-md bg-indigo-600 text-white"
                        : "rounded-bl-md border border-border bg-white text-slate-700",
                    )}
                  >
                    {parseMarkdown(message.content)}
                  </div>
                </div>
              );
            })}

            {isSending ? (
              <div className="flex items-end gap-2">
                <span className="mb-1 flex size-7 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
                  <Sparkles className="size-3.5" />
                </span>
                <div className="flex items-center gap-1 rounded-2xl rounded-bl-md border border-border bg-white px-4 py-3 shadow-sm">
                  <span className="size-1.5 animate-pulse rounded-full bg-indigo-500" />
                  <span className="size-1.5 animate-pulse rounded-full bg-indigo-500 [animation-delay:150ms]" />
                  <span className="size-1.5 animate-pulse rounded-full bg-indigo-500 [animation-delay:300ms]" />
                </div>
              </div>
            ) : null}
          </div>

          <form
            className="border-t border-indigo-100 bg-white p-3"
            onSubmit={(event) => void handleSubmit(event)}
          >
            <div className="flex items-end gap-2 rounded-2xl border border-border bg-slate-50 p-2 transition-colors focus-within:border-indigo-300 focus-within:bg-white focus-within:ring-3 focus-within:ring-indigo-100">
              <Textarea
                value={messageText}
                aria-label="Message AffiSmart Assistant"
                placeholder="Ask about a product..."
                rows={1}
                className="max-h-28 min-h-11 resize-none border-0 bg-transparent px-2 py-2 text-sm shadow-none focus-visible:border-0 focus-visible:ring-0"
                onChange={(event) => setMessageText(event.target.value)}
                onKeyDown={handleComposerKeyDown}
              />
              <Button
                type="submit"
                size="icon-lg"
                aria-label="Send message"
                disabled={!canSubmit}
                className="size-11 rounded-2xl shadow-sm"
              >
                {isSending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Send className="size-4" />
                )}
              </Button>
            </div>
            <p className="mt-2 px-1 text-[0.72rem] leading-5 text-muted-foreground">
              AI answers may be limited to AffiSmart shopping and affiliate topics.
            </p>
          </form>
        </section>
      ) : null}

      {!isOpen ? (
        <Button
          type="button"
          aria-label="Open AI chat"
          className="h-14 gap-2 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 px-5 text-white shadow-[0_18px_45px_rgba(79,70,229,0.35)] transition-transform hover:scale-[1.02]"
          onClick={() => setIsOpen(true)}
        >
          <MessageCircle className="size-5" />
          <span className="hidden font-semibold sm:inline">Ask AI</span>
        </Button>
      ) : null}
    </div>
  );
}
