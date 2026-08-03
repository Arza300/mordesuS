"use client";

import { useEffect, useRef } from "react";

import { Reveal } from "@/components/common/reveal";
import { SectionHeading } from "@/components/common/section-heading";
import {
  registerGsapPlugins,
  gsap,
  ScrollTrigger,
} from "@/animations/gsap-setup";
import { getContent } from "@/content";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

function StatItem({
  value,
  suffix,
  label,
}: {
  value: number;
  suffix: string;
  label: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (reduced) {
      el.textContent = `${value}${suffix}`;
      return;
    }

    registerGsapPlugins();
    const obj = { n: 0 };
    const tween = gsap.to(obj, {
      n: value,
      duration: 1.8,
      ease: "power2.out",
      scrollTrigger: {
        trigger: el,
        start: "top 90%",
        once: true,
      },
      onUpdate: () => {
        el.textContent = `${Math.round(obj.n)}${suffix}`;
      },
    });

    return () => {
      tween.kill();
      ScrollTrigger.getAll().forEach((t) => {
        if (t.trigger === el) t.kill();
      });
    };
  }, [reduced, suffix, value]);

  return (
    <div className="text-center">
      <p className="font-display text-4xl font-semibold tracking-tight text-white sm:text-5xl md:text-6xl">
        <span ref={ref}>0{suffix}</span>
      </p>
      <p className="mt-3 text-sm tracking-[0.18em] text-white/45 uppercase">
        {label}
      </p>
    </div>
  );
}

export function StatsSection() {
  const content = getContent().stats;

  return (
    <section
      id="stats"
      className="section-pad relative"
      aria-labelledby="stats-title"
    >
      <div className="container-studio">
        <Reveal>
          <SectionHeading
            eyebrow={content.eyebrow}
            title={content.title}
            align="center"
          />
        </Reveal>
        <div className="mt-16 grid grid-cols-2 gap-10 lg:grid-cols-4 lg:gap-6">
          {content.items.map((stat, index) => (
            <Reveal key={stat.id} delay={index * 0.08}>
              <StatItem
                value={stat.value}
                suffix={stat.suffix}
                label={stat.label}
              />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
