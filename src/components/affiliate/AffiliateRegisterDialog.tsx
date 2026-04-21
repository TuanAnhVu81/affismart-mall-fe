"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { BadgeCheck, Handshake, Landmark, Loader2, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useRegisterAffiliate } from "@/hooks/useAffiliate";
import {
  affiliateRegisterSchema,
  type AffiliateRegisterFormValues,
} from "@/lib/validators";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface ApiErrorResponse {
  message?: string;
}

interface AffiliateRegisterDialogProps {
  className?: string;
}

const getRegisterAffiliateErrorMessage = (error: unknown) => {
  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    return (
      error.response?.data?.message ??
      "Could not submit affiliate registration. Please try again."
    );
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Could not submit affiliate registration. Please try again.";
};

export function AffiliateRegisterDialog({
  className,
}: AffiliateRegisterDialogProps) {
  const [open, setOpen] = useState(false);
  const registerAffiliateMutation = useRegisterAffiliate();

  const form = useForm<AffiliateRegisterFormValues>({
    resolver: zodResolver(affiliateRegisterSchema),
    defaultValues: {
      promotionChannel: "",
      bankInfo: "",
    },
  });

  const onSubmit = async (values: AffiliateRegisterFormValues) => {
    try {
      await registerAffiliateMutation.mutateAsync({
        promotionChannel: values.promotionChannel.trim(),
        bankInfo: values.bankInfo.trim(),
      });
      toast.success("Registration submitted successfully. Please wait for admin approval.");
      form.reset();
      setOpen(false);
    } catch (error) {
      toast.error(getRegisterAffiliateErrorMessage(error));
    }
  };

  const isPending = registerAffiliateMutation.isPending;

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        className={cn(
          "h-10 rounded-full border-primary/20 bg-primary/5 px-4 text-sm font-semibold text-primary shadow-sm hover:bg-primary/10",
          className,
        )}
      >
        <Handshake className="size-4" />
        Become affiliate
      </Button>

      <Dialog
        open={open}
        onOpenChange={(nextOpen) => {
          if (isPending) {
            return;
          }

          setOpen(nextOpen);
          if (!nextOpen) {
            form.reset();
          }
        }}
      >
        <DialogContent
          className="top-3 left-1/2 flex max-h-[calc(100dvh-1.5rem)] w-[min(100%,42rem)] max-w-[calc(100vw-1.5rem)] -translate-x-1/2 translate-y-0 flex-col gap-0 overflow-hidden p-0 sm:top-1/2 sm:max-h-[calc(100dvh-2rem)] sm:-translate-y-1/2"
          showCloseButton={!isPending}
        >
          <DialogHeader className="border-b border-border/70 bg-gradient-to-br from-primary/6 via-background to-background px-5 py-5 sm:px-6">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full border border-primary/15 bg-primary/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
                <ShieldCheck className="size-3.5" />
                Partner application
              </span>
              <span className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                Manual review
              </span>
            </div>

            <DialogTitle className="inline-flex items-center gap-2 text-xl">
              <Handshake className="size-5 text-primary" />
              Become an affiliate partner
            </DialogTitle>
            <DialogDescription className="max-w-2xl text-sm leading-6">
              Share your main promotion channel and payout details so we can review your application and unlock the affiliate portal faster.
            </DialogDescription>
          </DialogHeader>

          <form
            id="affiliate-register-form"
            className="flex-1 overflow-y-auto px-5 py-5 sm:px-6"
            onSubmit={form.handleSubmit(onSubmit)}
            noValidate
          >
            <div className="space-y-5">
              <div className="rounded-2xl border border-primary/10 bg-primary/5 px-4 py-3 text-sm leading-6 text-muted-foreground">
                We review every application manually. Your banking details stay private and are only used for approved payout processing.
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="promotion-channel"
                  className="text-sm font-medium text-foreground"
                >
                  Promotion channel
                </label>
                <p className="text-xs leading-5 text-muted-foreground">
                  Share the main place where you recommend products so our team can understand your audience fit.
                </p>
                <Input
                  id="promotion-channel"
                  placeholder="Example: TikTok reviews, Facebook community, YouTube unboxing channel..."
                  aria-invalid={Boolean(form.formState.errors.promotionChannel)}
                  className="h-11 rounded-xl"
                  {...form.register("promotionChannel")}
                />
                {form.formState.errors.promotionChannel ? (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.promotionChannel.message}
                  </p>
                ) : null}
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="bank-info"
                  className="text-sm font-medium text-foreground"
                >
                  Bank info
                </label>
                <p className="text-xs leading-5 text-muted-foreground">
                  Include bank name, account number, and account holder name exactly as they should appear on payouts.
                </p>
                <div className="relative">
                  <Landmark className="pointer-events-none absolute left-3 top-3.5 size-4 text-muted-foreground" />
                  <textarea
                    id="bank-info"
                    rows={4}
                    placeholder="Example: Vietcombank - 0123456789 - NGUYEN VAN A"
                    aria-invalid={Boolean(form.formState.errors.bankInfo)}
                    className={cn(
                      "w-full rounded-xl border border-input bg-background px-3 py-2 pl-9 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
                      form.formState.errors.bankInfo
                        ? "border-destructive focus-visible:border-destructive focus-visible:ring-destructive/20"
                        : "",
                    )}
                    {...form.register("bankInfo")}
                  />
                </div>
                {form.formState.errors.bankInfo ? (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.bankInfo.message}
                  </p>
                ) : null}
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
                  <div className="flex items-start gap-3">
                    <div className="rounded-xl bg-emerald-50 p-2 text-emerald-700">
                      <BadgeCheck className="size-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">What gets reviewed</p>
                      <p className="mt-1 text-sm leading-6 text-muted-foreground">
                        Promotion quality, audience fit, and whether your payout details are complete.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
                  <p className="text-sm font-semibold text-foreground">After approval</p>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    You will unlock referral links, commission tracking, and payout requests in the affiliate portal.
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 text-sm leading-6 text-emerald-900">
                This information is private and never displayed publicly on the storefront.
              </div>
            </div>
          </form>

          <DialogFooter className="rounded-b-xl bg-background/95 backdrop-blur-sm">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isPending}
              className="h-10 min-w-28 rounded-full"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              form="affiliate-register-form"
              disabled={isPending}
              className="h-10 min-w-40 rounded-full shadow-sm"
            >
              {isPending ? (
                <>
                  <Loader2 className="animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit registration"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
