import Link from "next/link";

import { Container } from "@/components/layout/container";
import { navigationConfig } from "@/config/navigation";
import { siteConfig } from "@/config/site";

export function Footer() {
  return (
    <footer className="border-border mt-auto border-t">
      <Container className="text-muted-foreground flex flex-col gap-4 py-8 text-sm sm:flex-row sm:items-center sm:justify-between">
        <p>
          © {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
        </p>
        <nav aria-label="Footer" className="flex flex-wrap gap-4">
          {navigationConfig.footer.map((item) =>
            item.disabled ? (
              <span key={item.href} className="cursor-not-allowed">
                {item.title}
              </span>
            ) : (
              <Link
                key={item.href}
                href={item.href}
                className="hover:text-foreground transition-colors"
              >
                {item.title}
              </Link>
            ),
          )}
        </nav>
      </Container>
    </footer>
  );
}
