"use client";

import { Reveal } from "@/components/common/reveal";
import { SectionHeading } from "@/components/common/section-heading";
import { getContent } from "@/content";

export function TechnologiesSection() {
  const content = getContent().technologies;
  const row = [...content.items, ...content.items];

  return (
    <section
      id="technologies"
      className="section-pad relative overflow-hidden"
      aria-labelledby="technologies-title"
    >
      <div className="container-studio">
        <Reveal>
          <SectionHeading
            eyebrow={content.eyebrow}
            title={content.title}
            description={content.description}
          />
        </Reveal>
      </div>

      <div className="relative mt-14">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-[#050505] to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-[#050505] to-transparent" />
        <div className="animate-marquee flex w-max gap-4">
          {row.map((tech, i) => (
            <div
              key={`${tech.id}-${i}`}
              className="glass flex min-w-[180px] flex-col gap-1 rounded-2xl px-6 py-5"
            >
              <span className="text-sm font-medium text-white">
                {tech.name}
              </span>
              <span className="text-[11px] tracking-[0.18em] text-white/40 uppercase">
                {tech.category}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
