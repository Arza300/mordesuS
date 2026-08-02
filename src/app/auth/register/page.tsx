import Link from "next/link";

import { AuthCard } from "@/components/auth/auth-card";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata = {
  title: "Create account",
  description: "Create your Mordesu Studio account",
};

export default function RegisterPage() {
  return (
    <AuthCard
      title="Create your account"
      description="Start with email and a strong password. New accounts are USER by default."
      footer={
        <p className="text-muted-foreground">
          Already have an account?{" "}
          <Link
            href="/auth/login"
            className="text-foreground font-medium underline-offset-4 hover:underline"
          >
            Sign in
          </Link>
        </p>
      }
    >
      <RegisterForm />
    </AuthCard>
  );
}
