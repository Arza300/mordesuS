"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";

import { registerAction } from "@/actions/auth";
import {
  authFieldClassName,
  authLabelClassName,
  authSubmitClassName,
} from "@/components/auth/auth-card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { registerSchema, type RegisterInput } from "@/validators/auth";

export function RegisterForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    setError: setFieldError,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = handleSubmit((values) => {
    setError(null);

    startTransition(async () => {
      const result = await registerAction(values);

      if (result?.serverError) {
        setError(result.serverError);
        return;
      }

      if (result?.validationErrors) {
        const fieldErrors = result.validationErrors;
        if (fieldErrors.email?._errors?.[0]) {
          setFieldError("email", { message: fieldErrors.email._errors[0] });
        }
        if (fieldErrors.name?._errors?.[0]) {
          setFieldError("name", { message: fieldErrors.name._errors[0] });
        }
        if (fieldErrors.password?._errors?.[0]) {
          setFieldError("password", {
            message: fieldErrors.password._errors[0],
          });
        }
        if (fieldErrors.confirmPassword?._errors?.[0]) {
          setFieldError("confirmPassword", {
            message: fieldErrors.confirmPassword._errors[0],
          });
        }
        if (fieldErrors._errors?.[0]) {
          setError(fieldErrors._errors[0]);
        }
        return;
      }

      if (result?.data?.success) {
        router.push("/");
        router.refresh();
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
        <Label htmlFor="name" className={authLabelClassName}>
          Name
        </Label>
        <Input
          id="name"
          type="text"
          autoComplete="name"
          placeholder="Your name"
          disabled={isPending}
          aria-invalid={Boolean(errors.name)}
          className={authFieldClassName}
          {...register("name")}
        />
        {errors.name ? (
          <p className="text-[12px] font-light text-red-300/90">
            {errors.name.message}
          </p>
        ) : null}
      </div>

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
          autoComplete="new-password"
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
        <p className="text-[12px] font-light text-white/30">
          At least 8 characters with uppercase, lowercase, and a number.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword" className={authLabelClassName}>
          Confirm password
        </Label>
        <Input
          id="confirmPassword"
          type="password"
          autoComplete="new-password"
          placeholder="••••••••"
          disabled={isPending}
          aria-invalid={Boolean(errors.confirmPassword)}
          className={authFieldClassName}
          {...register("confirmPassword")}
        />
        {errors.confirmPassword ? (
          <p className="text-[12px] font-light text-red-300/90">
            {errors.confirmPassword.message}
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
            Creating account...
          </>
        ) : (
          "Create account"
        )}
      </Button>
    </form>
  );
}
