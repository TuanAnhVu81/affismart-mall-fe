"use client";

import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { useLogin } from "@/hooks/useAuth";
import { loginSchema, type LoginFormValues } from "@/lib/validators";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/shared/PasswordInput";

export default function LoginPage() {
  const loginMutation = useLogin();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (values: LoginFormValues) => {
    loginMutation.mutate(values);
  };

  return (
    <div className="grid w-full max-w-5xl gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
      <section className="hidden space-y-6 lg:block">
        <div className="inline-flex rounded-full border border-border bg-background/80 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.22em] text-muted-foreground shadow-soft backdrop-blur">
          Commerce Access
        </div>
        <div className="space-y-4">
          <h1 className="max-w-xl text-4xl font-semibold tracking-tight text-foreground">
            Sign in to your AffiSmart Mall workspace.
          </h1>
          <p className="max-w-xl text-base leading-7 text-muted-foreground">
            Access your customer storefront, affiliate dashboard, or admin tools
            with one secure account built for a modern commerce platform.
          </p>
        </div>
        <div className="grid max-w-xl gap-4 sm:grid-cols-2">
          <div className="rounded-3xl border border-border bg-card/90 p-5 shadow-soft">
            <p className="text-sm font-medium text-foreground">
              Secure session recovery
            </p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Access tokens stay in memory while refresh is handled through
              secure cookies behind the scenes.
            </p>
          </div>
          <div className="rounded-3xl border border-border bg-card/90 p-5 shadow-soft">
            <p className="text-sm font-medium text-foreground">
              Role-aware routing
            </p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Customers, affiliates, and admins are sent straight to the
              experience built for them.
            </p>
          </div>
        </div>
      </section>

      <Card className="mx-auto w-full max-w-md border border-border/80 bg-background/95 shadow-soft backdrop-blur">
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl font-semibold tracking-tight">
            Welcome back
          </CardTitle>
          <CardDescription className="text-sm leading-6">
            Sign in with your email and password to continue to AffiSmart Mall.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
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
                placeholder="name@company.com"
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
              <PasswordInput
                id="password"
                placeholder="Enter your account password"
                autoComplete="current-password"
                aria-invalid={Boolean(errors.password)}
                {...register("password")}
              />
              {errors.password ? (
                <p className="text-sm text-destructive">
                  {errors.password.message}
                </p>
              ) : null}
            </div>

            <Button
              type="submit"
              className="h-11 w-full text-sm font-semibold"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? (
                <>
                  <Loader2 className="animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign in"
              )}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            New to AffiSmart Mall?{" "}
            <Link
              href="/register"
              className="font-medium text-primary transition-colors hover:text-[var(--primary-hover)]"
            >
              Create an account
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
