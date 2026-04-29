"use client";

import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import {
  BadgeCheck,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Save,
  ShieldCheck,
  Sparkles,
  UserCircle2,
} from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useMe, useUpdateMe } from "@/hooks/useUser";
import {
  profileUpdateSchema,
  type ProfileUpdateFormValues,
} from "@/lib/validators";
import { formatDate } from "@/lib/utils";

const formatRole = (role: string) =>
  role
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

interface ApiErrorResponse {
  message?: string;
}

const getProfileErrorMessage = (error: unknown) => {
  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    return error.response?.data?.message ?? "Profile update failed. Please try again.";
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Profile update failed. Please try again.";
};

export default function ProfilePage() {
  const profileQuery = useMe();
  const updateProfileMutation = useUpdateMe();
  const user = profileQuery.data;
  const joinedAt = user?.createdAt ? formatDate(user.createdAt) : null;
  const form = useForm<ProfileUpdateFormValues>({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: {
      fullName: "",
      phone: "",
      defaultShippingAddress: "",
    },
    mode: "onTouched",
  });

  useEffect(() => {
    if (!user) {
      return;
    }

    form.reset({
      fullName: user.fullName,
      phone: user.phone ?? "",
      defaultShippingAddress: user.defaultShippingAddress ?? "",
    });
  }, [form, user]);

  const onSubmit = async (values: ProfileUpdateFormValues) => {
    try {
      const updatedProfile = await updateProfileMutation.mutateAsync({
        fullName: values.fullName,
        phone: values.phone,
        defaultShippingAddress: values.defaultShippingAddress,
      });

      form.reset({
        fullName: updatedProfile.fullName,
        phone: updatedProfile.phone ?? "",
        defaultShippingAddress: updatedProfile.defaultShippingAddress ?? "",
      });
      toast.success("Profile updated successfully.");
    } catch (error) {
      toast.error(getProfileErrorMessage(error));
    }
  };

  const isSaving = updateProfileMutation.isPending;

  return (
    <div className="py-8 sm:py-12">
      <section className="overflow-hidden rounded-[2rem] border border-border/80 bg-card shadow-soft">
        <div className="relative border-b border-border/70 bg-gradient-to-br from-primary/10 via-background to-emerald-50 px-6 py-8 sm:px-8">
          <div className="pointer-events-none absolute -right-16 -top-20 size-56 rounded-full bg-primary/10 blur-3xl" />
          <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <span className="flex size-16 items-center justify-center rounded-3xl border border-primary/15 bg-background text-primary shadow-sm">
                <UserCircle2 className="size-8" aria-hidden="true" />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
                  Personal profile
                </p>
                <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
                  My account
                </h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                  Keep your personal details and default delivery information
                  up to date for smoother checkout and account management.
                </p>
              </div>
            </div>

            <Button render={<Link href="/orders" />} variant="outline" className="rounded-full">
              View orders
            </Button>
          </div>
        </div>

        <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[1.5rem] border border-border/80 bg-background p-5 shadow-sm">
            <div className="mb-5 flex items-center gap-2">
              <BadgeCheck className="size-5 text-primary" aria-hidden="true" />
              <h2 className="text-lg font-semibold tracking-tight text-foreground">
                Account details
              </h2>
            </div>

            {profileQuery.isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-5 w-48 rounded-full" />
                <Skeleton className="h-12 w-full rounded-2xl" />
                <Skeleton className="h-12 w-full rounded-2xl" />
                <Skeleton className="h-12 w-full rounded-2xl" />
              </div>
            ) : profileQuery.isError ? (
              <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-4">
                <p className="font-semibold text-destructive">
                  Could not load your profile.
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Please refresh the page or sign in again.
                </p>
              </div>
            ) : user ? (
              <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)} noValidate>
                <div className="space-y-2">
                  <label
                    htmlFor="profile-full-name"
                    className="text-sm font-semibold text-foreground"
                  >
                    Full name
                  </label>
                  <Input
                    id="profile-full-name"
                    autoComplete="name"
                    placeholder="Your full name"
                    aria-invalid={Boolean(form.formState.errors.fullName)}
                    {...form.register("fullName")}
                    className="h-12 rounded-2xl"
                  />
                  {form.formState.errors.fullName ? (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.fullName.message}
                    </p>
                  ) : null}
                </div>

                <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    Email
                  </p>
                  <p className="mt-2 inline-flex items-center gap-2 text-foreground">
                    <Mail className="size-4 text-primary" aria-hidden="true" />
                    {user.email}
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Email changes are handled by account support for security.
                  </p>
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="profile-phone"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-foreground"
                  >
                    <Phone className="size-4 text-primary" aria-hidden="true" />
                    Phone
                  </label>
                  <Input
                    id="profile-phone"
                    autoComplete="tel"
                    placeholder="Example: +84 901 234 567"
                    aria-invalid={Boolean(form.formState.errors.phone)}
                    {...form.register("phone")}
                    className="h-12 rounded-2xl"
                  />
                  {form.formState.errors.phone ? (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.phone.message}
                    </p>
                  ) : null}
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="profile-shipping-address"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-foreground"
                  >
                    <MapPin className="size-4 text-primary" aria-hidden="true" />
                    Default shipping address
                  </label>
                  <Textarea
                    id="profile-shipping-address"
                    rows={4}
                    placeholder="Save your default delivery address for faster checkout."
                    aria-invalid={Boolean(form.formState.errors.defaultShippingAddress)}
                    {...form.register("defaultShippingAddress")}
                  />
                  {form.formState.errors.defaultShippingAddress ? (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.defaultShippingAddress.message}
                    </p>
                  ) : null}
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                      Account status
                    </p>
                    <p className="mt-2 font-semibold text-foreground">
                      {user.status ?? "Active"}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                      Joined
                    </p>
                    <p className="mt-2 font-semibold text-foreground">
                      {joinedAt ?? "Not available"}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-3 border-t border-border/70 pt-5 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-muted-foreground">
                    Changes apply to future checkouts and account views.
                  </p>
                  <Button
                    type="submit"
                    className="rounded-full"
                    disabled={isSaving || !form.formState.isDirty}
                  >
                    {isSaving ? (
                      <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                    ) : (
                      <Save className="size-4" aria-hidden="true" />
                    )}
                    {isSaving ? "Saving..." : "Save changes"}
                  </Button>
                </div>
              </form>
            ) : null}
          </div>

          <aside className="space-y-4 rounded-[1.5rem] border border-border/80 bg-background p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <ShieldCheck className="size-5 text-primary" aria-hidden="true" />
              <h2 className="text-lg font-semibold tracking-tight text-foreground">
                Access level
              </h2>
            </div>

            {profileQuery.isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-10 w-32 rounded-full" />
                <Skeleton className="h-24 w-full rounded-2xl" />
              </div>
            ) : user ? (
              <>
                <div className="flex flex-wrap gap-2">
                  {user.roles.map((role) => (
                    <span
                      key={role}
                      className="inline-flex items-center rounded-full border border-primary/15 bg-primary/8 px-3 py-1 text-sm font-semibold text-primary"
                    >
                      {formatRole(role)}
                    </span>
                  ))}
                </div>

                {user.affiliateStatus ? (
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
                    Affiliate status:{" "}
                    <span className="font-semibold">{user.affiliateStatus}</span>
                  </div>
                ) : null}

                <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="size-4 text-primary" aria-hidden="true" />
                    <p className="font-semibold text-foreground">What this unlocks</p>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    Your active role controls access to checkout, order history,
                    affiliate portal tools, or admin operations.
                  </p>
                </div>
              </>
            ) : null}
          </aside>
        </div>
      </section>
    </div>
  );
}
