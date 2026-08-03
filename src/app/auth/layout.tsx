import { AuthScrollUnlock } from "@/components/auth/auth-scroll-unlock";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-[calc(100dvh-5rem)] items-center justify-center bg-[#0a0a0a] px-6 py-16 sm:py-20">
      <AuthScrollUnlock />
      {children}
    </div>
  );
}
