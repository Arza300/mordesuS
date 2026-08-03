"use client";

import { useEffect, useRef } from "react";

import { cn } from "@/lib/utils";
import {
  registerGsapPlugins,
  gsap,
  ScrollTrigger,
} from "@/animations/gsap-setup";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

type RevealProps = {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  once?: boolean;
};

export function Reveal({
  children,
  className,
  delay = 0,
  y = 48,
  once = true,
}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (reduced) {
      el.style.opacity = "1";
      el.style.transform = "none";
      el.style.filter = "none";
      return;
    }

    registerGsapPlugins();

    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { y, opacity: 0, filter: "blur(6px)" },
        {
          y: 0,
          opacity: 1,
          filter: "blur(0px)",
          duration: 1,
          delay,
          ease: "power3.out",
          scrollTrigger: {
            trigger: el,
            start: "top 88%",
            toggleActions: once
              ? "play none none none"
              : "play none none reverse",
          },
        },
      );
    }, el);

    return () => {
      ctx.revert();
      ScrollTrigger.getAll().forEach((t) => {
        if (t.trigger === el) t.kill();
      });
    };
  }, [delay, once, reduced, y]);

  return (
    <div
      ref={ref}
      className={cn("will-change-transform", className)}
      style={{ opacity: 0 }}
    >
      {children}
    </div>
  );
}
