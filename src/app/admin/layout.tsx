import Link from "next/link";

import { requireAdmin } from "@/server/auth/session";
import { SignOutButton } from "@/components/auth/sign-out-button";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAdmin();

  return (
    <div className="min-h-dvh bg-[#0b0b0c] text-white">
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
          <div className="flex items-center gap-6">
            <Link
              href="/admin/projects"
              className="text-sm font-medium tracking-wide"
            >
              Mordesu Admin
            </Link>
            <nav className="flex items-center gap-4 text-sm text-white/60">
              <Link
                href="/admin/projects"
                className="transition-colors hover:text-white"
              >
                Projects
              </Link>
              <Link
                href="/admin/xp-files"
                className="transition-colors hover:text-white"
              >
                XP Files
              </Link>
              <Link href="/" className="transition-colors hover:text-white">
                View site
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-3 text-sm text-white/50">
            <span className="hidden sm:inline">{session.user.email}</span>
            <SignOutButton />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-5 py-8 sm:px-8">{children}</main>
    </div>
  );
}
