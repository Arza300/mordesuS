"use client";

import { useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import Link from "next/link";

import { loginAction } from "@/actions/auth";
import {
  authFieldClassName,
  authLabelClassName,
  authSubmitClassName,
} from "@/components/auth/auth-card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSession } from "@/lib/auth/auth-client";
import { cn } from "@/lib/utils";
import { loginSchema, type LoginInput } from "@/validators/auth";

export function LoginForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const { data: session } = useSession();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  if (session?.user) {
    const isAdmin = session.user.role === "ADMIN";
    return (
      <div className="space-y-5">
        <p className="text-[14px] font-light text-white/50">
          You&apos;re already signed in as{" "}
          <span className="text-white/80">{session.user.email}</span>.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            type="button"
            className={cn(authSubmitClassName, "sm:flex-1")}
            onClick={() => {
              window.location.assign(isAdmin ? "/admin/projects" : "/");
            }}
          >
            {isAdmin ? "Go to admin" : "Back to site"}
          </Button>
          {isAdmin ? (
            <Button
              type="button"
              variant="outline"
              className="h-12 w-full rounded-none border-white/20 bg-transparent text-[12px] font-medium tracking-[0.18em] text-white uppercase hover:bg-white/5 sm:w-auto"
              nativeButton={false}
              render={<Link href="/" />}
            >
              View site
            </Button>
          ) : null}
        </div>
      </div>
    );
  }

  const onSubmit = handleSubmit((values) => {
    setError(null);

    startTransition(async () => {
      const result = await loginAction(values);

      if (result?.serverError) {
        setError(result.serverError);
        return;
      }

      if (result?.validationErrors) {
        setError("Please check your credentials and try again.");
        return;
      }

      if (result?.data?.success) {
        window.location.assign(callbackUrl);
      }
    });
  });

  return (
    <form onSubmit={onSubmit} className="space-y-6" noValidate>
      {error ? (
        <Alert
          variant="destructive"
          className="rounded-none border-red-500/30 bg-red-500/10 text-red-200"
        >
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <div className="space-y-2">
        <Label htmlFor="email" className={authLabelClassName}>
          Email
        </Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          disabled={isPending}
          aria-invalid={Boolean(errors.email)}
          className={authFieldClassName}
          {...register("email")}
        />
        {errors.email ? (
          <p className="text-[12px] font-light text-red-300/90">
            {errors.email.message}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password" className={authLabelClassName}>
          Password
        </Label>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          disabled={isPending}
          aria-invalid={Boolean(errors.password)}
          className={authFieldClassName}
          {...register("password")}
        />
        {errors.password ? (
          <p className="text-[12px] font-light text-red-300/90">
            {errors.password.message}
          </p>
        ) : null}
      </div>

      <Button
        type="submit"
        className={authSubmitClassName}
        disabled={isPending}
      >
        {isPending ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Signing in...
          </>
        ) : (
          "Sign in"
        )}
      </Button>
    </form>
  );
}
