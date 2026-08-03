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
    <div className={cn("font-projects w-full max-w-[400px]", className)}>
      <header className="mb-10 space-y-3">
        <Link
          href="/"
          className="inline-block text-[11px] font-light tracking-[0.32em] text-white/40 uppercase transition-colors hover:text-white/70"
        >
          {siteConfig.name}
        </Link>
        <h1 className="text-[2rem] leading-none font-light tracking-[-0.03em] text-white sm:text-[2.4rem]">
          {title}
        </h1>
        <p className="max-w-[34ch] text-[14px] leading-relaxed font-light text-white/40">
          {description}
        </p>
      </header>
      {children}
      {footer ? (
        <div className="mt-8 border-t border-white/10 pt-6 text-[13px] font-light text-white/40">
          {footer}
        </div>
      ) : null}
    </div>
  );
}

/** Shared field chrome for auth forms */
export const authFieldClassName =
  "h-12 rounded-none border-0 border-b border-white/15 bg-transparent px-0 text-[15px] font-light text-white shadow-none placeholder:text-white/25 focus-visible:border-white/55 focus-visible:ring-0 dark:bg-transparent";

export const authLabelClassName =
  "text-[11px] font-light tracking-[0.18em] text-white/50 uppercase";

export const authSubmitClassName =
  "mt-2 h-12 w-full rounded-none border-0 bg-white text-[12px] font-medium tracking-[0.22em] text-black uppercase transition-colors hover:bg-white/90 disabled:opacity-50";

export const authLinkClassName =
  "text-white/80 underline-offset-4 transition-colors hover:text-white hover:underline";
