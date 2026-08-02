import Link from "next/link";

import { SignOutButton } from "@/components/auth/sign-out-button";
import { Container } from "@/components/layout/container";
import { buttonVariants } from "@/components/ui/button";
import { navigationConfig } from "@/config/navigation";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";
import { getSession } from "@/server/auth/session";

export async function Navbar() {
  const session = await getSession();

  return (
    <header className="border-border border-b">
      <Container className="flex h-14 items-center justify-between gap-4">
        <Link href="/" className="font-medium tracking-tight">
          {siteConfig.name}
        </Link>
        <nav aria-label="Main" className="flex items-center gap-4 text-sm">
          {navigationConfig.main.map((item) =>
            item.disabled ? (
              <span
                key={item.href}
                className="text-muted-foreground hidden cursor-not-allowed sm:inline"
              >
                {item.title}
              </span>
            ) : (
              <Link
                key={item.href}
                href={item.href}
                className="text-foreground/80 hover:text-foreground transition-colors"
              >
                {item.title}
              </Link>
            ),
          )}
          {session ? (
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground hidden max-w-40 truncate md:inline">
                {session.user.name}
              </span>
              <SignOutButton />
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/auth/login"
                className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
              >
                Sign in
              </Link>
              <Link
                href="/auth/register"
                className={cn(buttonVariants({ size: "sm" }))}
              >
                Register
              </Link>
            </div>
          )}
        </nav>
      </Container>
    </header>
  );
}
