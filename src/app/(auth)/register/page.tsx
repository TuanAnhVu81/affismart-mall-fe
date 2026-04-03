"use client";

import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { useRegister } from "@/hooks/useAuth";
import { registerSchema, type RegisterFormValues } from "@/lib/validators";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function RegisterPage() {
  const registerMutation = useRegister();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = (values: RegisterFormValues) => {
    registerMutation.mutate(values);
  };

  return (
    <div className="grid w-full max-w-5xl gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
      <Card className="order-2 mx-auto w-full max-w-md border border-border/80 bg-background/95 shadow-soft backdrop-blur lg:order-1">
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl font-semibold tracking-tight">
            Create your account
          </CardTitle>
          <CardDescription className="text-sm leading-6">
            Set up your account to explore the storefront and future protected
            features.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="space-y-2">
              <label
                className="text-sm font-medium text-foreground"
                htmlFor="fullName"
              >
                Full name
              </label>
              <Input
                id="fullName"
                type="text"
                placeholder="Alex Johnson"
                autoComplete="name"
                aria-invalid={Boolean(errors.fullName)}
                {...register("fullName")}
              />
              {errors.fullName ? (
                <p className="text-sm text-destructive">
                  {errors.fullName.message}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <label
                className="text-sm font-medium text-foreground"
                htmlFor="email"
              >
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                aria-invalid={Boolean(errors.email)}
                {...register("email")}
              />
              {errors.email ? (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <label
                className="text-sm font-medium text-foreground"
                htmlFor="password"
              >
                Password
              </label>
              <Input
                id="password"
                type="password"
                placeholder="Create a strong password"
                autoComplete="new-password"
                aria-invalid={Boolean(errors.password)}
                {...register("password")}
              />
              {errors.password ? (
                <p className="text-sm text-destructive">
                  {errors.password.message}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <label
                className="text-sm font-medium text-foreground"
                htmlFor="confirmPassword"
              >
                Confirm password
              </label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Re-enter your password"
                autoComplete="new-password"
                aria-invalid={Boolean(errors.confirmPassword)}
                {...register("confirmPassword")}
              />
              {errors.confirmPassword ? (
                <p className="text-sm text-destructive">
                  {errors.confirmPassword.message}
                </p>
              ) : null}
            </div>

            <Button
              type="submit"
              className="h-11 w-full text-sm font-semibold"
              disabled={registerMutation.isPending}
            >
              {registerMutation.isPending ? (
                <>
                  <Loader2 className="animate-spin" />
                  Creating account...
                </>
              ) : (
                "Create account"
              )}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-primary transition-colors hover:text-[var(--primary-hover)]"
            >
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>

      <section className="order-1 space-y-6 lg:order-2">
        <div className="inline-flex rounded-full border border-border bg-background/80 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.22em] text-muted-foreground shadow-soft backdrop-blur">
          Portfolio-ready authentication
        </div>
        <div className="space-y-4">
          <h1 className="max-w-xl text-4xl font-semibold tracking-tight text-foreground">
            Build an account flow that feels product-ready from the very first
            screen.
          </h1>
          <p className="max-w-xl text-base leading-7 text-muted-foreground">
            The auth module is intentionally structured to showcase clean state
            management, role-based UX, and secure token handling for a modern
            commerce application.
          </p>
        </div>
        <div className="grid max-w-xl gap-4 sm:grid-cols-2">
          <div className="rounded-3xl border border-border bg-card/90 p-5 shadow-soft">
            <p className="text-sm font-medium text-foreground">
              React Hook Form + Zod
            </p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Typed validation with clear inline errors for a polished user
              experience.
            </p>
          </div>
          <div className="rounded-3xl border border-border bg-card/90 p-5 shadow-soft">
            <p className="text-sm font-medium text-foreground">
              Ready for role-based growth
            </p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              The same flow will scale into customer, affiliate, and admin
              journeys as the platform expands.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
