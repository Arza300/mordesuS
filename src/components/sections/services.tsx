"use client";

import {
  Code2,
  Cpu,
  Gauge,
  Layers,
  Palette,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

import { Reveal } from "@/components/common/reveal";
import { SectionHeading } from "@/components/common/section-heading";
import { getContent } from "@/content";

const iconMap: Record<string, LucideIcon> = {
  palette: Palette,
  code: Code2,
  sparkles: Sparkles,
  layers: Layers,
  cpu: Cpu,
  gauge: Gauge,
};

export function ServicesSection() {
  const content = getContent().services;

  return (
    <section
      id="services"
      className="section-pad relative"
      aria-labelledby="services-title"
    >
      <div className="container-studio">
        <Reveal>
          <SectionHeading
            eyebrow={content.eyebrow}
            title={content.title}
            description={content.description}
          />
        </Reveal>
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {content.items.map((service, index) => {
            const Icon = iconMap[service.icon] ?? Sparkles;
            return (
              <Reveal key={service.id} delay={index * 0.06}>
                <article className="group relative h-full overflow-hidden rounded-3xl border border-white/10 bg-white/[0.02] p-7 transition-all duration-500 hover:border-[#A855F7]/40 hover:bg-white/[0.04]">
                  <div className="absolute -top-16 -right-16 size-40 rounded-full bg-[#7C3AED]/0 blur-3xl transition-all duration-500 group-hover:bg-[#7C3AED]/25" />
                  <div className="relative">
                    <div className="inline-flex size-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-[#A855F7]">
                      <Icon className="size-5" aria-hidden />
                    </div>
                    <h3 className="font-display mt-6 text-xl font-semibold text-white">
                      {service.title}
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-white/55">
                      {service.description}
                    </p>
                  </div>
                </article>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
