"use client";

import { Reveal } from "@/components/common/reveal";
import { SectionHeading } from "@/components/common/section-heading";
import { getContent } from "@/content";

export function WhyUsSection() {
  const content = getContent().whyUs;

  return (
    <section
      id="why-us"
      className="section-pad relative"
      aria-labelledby="why-us-title"
    >
      <div className="container-studio">
        <Reveal>
          <SectionHeading
            eyebrow={content.eyebrow}
            title={content.title}
            description={content.description}
          />
        </Reveal>
        <div className="mt-14 grid gap-8 md:grid-cols-2">
          {content.items.map((item, index) => (
            <Reveal key={item.id} delay={index * 0.08}>
              <div className="border-t border-white/10 pt-8">
                <p className="font-mono text-xs tracking-[0.25em] text-[#A855F7]">
                  {String(index + 1).padStart(2, "0")}
                </p>
                <h3 className="font-display mt-4 text-2xl font-semibold text-white">
                  {item.title}
                </h3>
                <p className="mt-3 max-w-md text-sm leading-relaxed text-white/55 md:text-base">
                  {item.description}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
