import Link from "next/link";

import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

type AuthCardProps = {
  title: string;
  description: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
};

export function AuthCard({
  title,
  description,
  children,
  footer,
  className,
}: AuthCardProps) {
  return (
    <div
      className={cn(
        "border-border/80 bg-card/80 w-full max-w-md rounded-2xl border p-6 shadow-sm backdrop-blur sm:p-8",
        className,
      )}
    >
      <div className="mb-8 space-y-2 text-center">
        <Link
          href="/"
          className="text-muted-foreground hover:text-foreground text-sm font-medium tracking-tight transition-colors"
        >
          {siteConfig.name}
        </Link>
        <h1 className="text-foreground text-2xl font-semibold tracking-tight">
          {title}
        </h1>
        <p className="text-muted-foreground text-sm">{description}</p>
      </div>
      {children}
      {footer ? <div className="mt-6 text-center text-sm">{footer}</div> : null}
    </div>
  );
}
