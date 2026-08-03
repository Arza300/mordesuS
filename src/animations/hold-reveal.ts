import { gsap } from "@/animations/gsap-setup";

export function pulseHoldComplete(target: gsap.TweenTarget) {
  return gsap.fromTo(
    target,
    { scale: 1 },
    {
      scale: 1.08,
      duration: 0.35,
      yoyo: true,
      repeat: 1,
      ease: "power2.out",
    },
  );
}
