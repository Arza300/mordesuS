import Link from "next/link";

import { AuthCard, authLinkClassName } from "@/components/auth/auth-card";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata = {
  title: "Create account",
  description: "Create your Mordesu Studio account",
};

export default function RegisterPage() {
  return (
    <AuthCard
      title="Create account"
      description="Enter your details to get started. New accounts are USER by default."
      footer={
        <p>
          Already have an account?{" "}
          <Link href="/auth/login" className={authLinkClassName}>
            Sign in
          </Link>
        </p>
      }
    >
      <RegisterForm />
    </AuthCard>
  );
}
