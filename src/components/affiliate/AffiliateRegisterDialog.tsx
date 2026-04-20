"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { Handshake, Landmark, Loader2 } from "lucide-react";
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
          "h-9 rounded-full border-primary/20 bg-primary/5 px-3 text-xs font-medium text-primary hover:bg-primary/10",
          className,
        )}
      >
        <Handshake className="size-3.5" />
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
        <DialogContent className="max-w-lg p-0" showCloseButton={!isPending}>
          <DialogHeader className="border-b border-border/70 px-6 py-5">
            <DialogTitle className="inline-flex items-center gap-2 text-lg">
              <Handshake className="size-4 text-primary" />
              Become an affiliate partner
            </DialogTitle>
            <DialogDescription>
              Tell us how you promote products and where we can process payout
              details.
            </DialogDescription>
          </DialogHeader>

          <form
            id="affiliate-register-form"
            className="space-y-4 px-6 py-5"
            onSubmit={form.handleSubmit(onSubmit)}
            noValidate
          >
            <div className="space-y-2">
              <label
                htmlFor="promotion-channel"
                className="text-sm font-medium text-foreground"
              >
                Promotion channel
              </label>
              <Input
                id="promotion-channel"
                placeholder="Example: TikTok, Facebook Page, YouTube channel..."
                aria-invalid={Boolean(form.formState.errors.promotionChannel)}
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
              <div className="relative">
                <Landmark className="pointer-events-none absolute left-3 top-3.5 size-4 text-muted-foreground" />
                <textarea
                  id="bank-info"
                  rows={4}
                  placeholder="Bank name, account number, account holder..."
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
          </form>

          <DialogFooter className="rounded-b-xl border-t bg-muted/40 p-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              form="affiliate-register-form"
              disabled={isPending}
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
