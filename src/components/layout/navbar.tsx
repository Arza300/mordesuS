import Link from "next/link";

import { Container } from "@/components/layout/container";
import { navigationConfig } from "@/config/navigation";
import { siteConfig } from "@/config/site";

export function Navbar() {
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
                className="text-muted-foreground cursor-not-allowed"
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
        </nav>
      </Container>
    </header>
  );
}
