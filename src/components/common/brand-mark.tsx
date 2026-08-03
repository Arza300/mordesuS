"use client";

import Image from "next/image";

import { cn } from "@/lib/utils";
import { siteConfig } from "@/config/site";

type BrandMarkProps = {
  className?: string;
  size?: number;
  priority?: boolean;
};

export function BrandMark({ className, size = 40, priority }: BrandMarkProps) {
  return (
    <Image
      src="/brand/logo.png"
      alt={siteConfig.name}
      width={size}
      height={size}
      priority={priority}
      unoptimized
      className={cn("object-contain mix-blend-screen", className)}
    />
  );
}
