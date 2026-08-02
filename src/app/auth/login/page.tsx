import Link from "next/link";
import { Suspense } from "react";

import { AuthCard } from "@/components/auth/auth-card";
import { LoginForm } from "@/components/auth/login-form";

export const metadata = {
  title: "Sign in",
  description: "Sign in to your Mordesu Studio account",
};

export default function LoginPage() {
  return (
    <AuthCard
      title="Welcome back"
      description="Sign in with your email and password to continue."
      footer={
        <p className="text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link
            href="/auth/register"
            className="text-foreground font-medium underline-offset-4 hover:underline"
          >
            Create one
          </Link>
        </p>
      }
    >
      <Suspense
        fallback={<div className="bg-muted h-40 animate-pulse rounded-lg" />}
      >
        <LoginForm />
      </Suspense>
    </AuthCard>
  );
}
