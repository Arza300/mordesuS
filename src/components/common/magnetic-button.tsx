"use client";

import { cn } from "@/lib/utils";
import { useMagnetic } from "@/hooks/use-magnetic";
import { useIsTouchDevice } from "@/hooks/use-media-query";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

type MagneticButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  href?: string;
};

export function MagneticButton({
  className,
  children,
  href,
  type = "button",
  ...props
}: MagneticButtonProps) {
  const isTouch = useIsTouchDevice();
  const reduced = useReducedMotion();
  const magRef = useMagnetic<HTMLButtonElement | HTMLAnchorElement>({
    strength: isTouch || reduced ? 0 : 0.4,
    radius: 140,
  });

  const classes = cn(
    "inline-flex items-center justify-center gap-2 rounded-full px-7 py-3.5 text-sm font-medium tracking-wide transition-colors",
    "bg-white text-[#050505] hover:bg-[#A855F7] hover:text-white",
    "glow-box focus-visible:outline-none disabled:pointer-events-none disabled:opacity-60",
    className,
  );

  if (href) {
    return (
      <a
        ref={magRef as React.RefObject<HTMLAnchorElement>}
        href={href}
        data-cursor="hover"
        className={classes}
      >
        {children}
      </a>
    );
  }

  return (
    <button
      ref={magRef as React.RefObject<HTMLButtonElement>}
      type={type}
      data-cursor="hover"
      className={classes}
      {...props}
    >
      {children}
    </button>
  );
}
