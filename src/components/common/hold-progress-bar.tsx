"use client";

import { motion } from "motion/react";

import { cn } from "@/lib/utils";

type HoldProgressBarProps = {
  progress: number;
  holding?: boolean;
  className?: string;
};

export function HoldProgressBar({
  progress,
  holding = false,
  className,
}: HoldProgressBarProps) {
  const pct = Math.max(0, Math.min(1, progress));

  return (
    <div
      className={cn("flex w-28 flex-col items-center gap-2", className)}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(pct * 100)}
      aria-label="Hold progress"
    >
      <div className="relative h-[2px] w-full overflow-hidden rounded-full bg-white/15">
        <motion.div
          className={cn(
            "absolute inset-y-0 left-0 origin-left rounded-full",
            holding || pct > 0.01 ? "bg-white" : "bg-white/50",
          )}
          style={{
            width: "100%",
            scaleX: pct,
            boxShadow: pct > 0.02 ? "0 0 10px rgba(255,255,255,0.45)" : "none",
          }}
          // No CSS transition — progress is driven by GSAP via React state
        />
      </div>
    </div>
  );
}
