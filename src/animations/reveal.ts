import type { gsap as GsapType } from "gsap";

import { gsap, registerGsapPlugins } from "@/animations/gsap-setup";

registerGsapPlugins();

export function revealFromY(
  targets: gsap.TweenTarget,
  options: gsap.TweenVars = {},
) {
  return gsap.fromTo(
    targets,
    { y: 60, opacity: 0, filter: "blur(8px)" },
    {
      y: 0,
      opacity: 1,
      filter: "blur(0px)",
      duration: 1,
      ease: "power3.out",
      stagger: 0.08,
      ...options,
    },
  );
}

export function fadeIn(
  targets: gsap.TweenTarget,
  options: gsap.TweenVars = {},
) {
  return gsap.fromTo(
    targets,
    { opacity: 0 },
    { opacity: 1, duration: 0.8, ease: "power2.out", ...options },
  );
}

export type { GsapType };
