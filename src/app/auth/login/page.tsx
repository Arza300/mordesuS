import Link from "next/link";
import { Suspense } from "react";

import { AuthCard, authLinkClassName } from "@/components/auth/auth-card";
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
        <p>
          Don&apos;t have an account?{" "}
          <Link href="/auth/register" className={authLinkClassName}>
            Create one
          </Link>
        </p>
      }
    >
      <Suspense
        fallback={
          <div className="h-40 animate-pulse border-b border-white/10 bg-white/5" />
        }
      >
        <LoginForm />
      </Suspense>
    </AuthCard>
  );
}
