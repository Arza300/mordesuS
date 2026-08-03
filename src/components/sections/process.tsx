"use client";

import { Reveal } from "@/components/common/reveal";
import { SectionHeading } from "@/components/common/section-heading";
import { getContent } from "@/content";

export function ProcessSection() {
  const content = getContent().process;

  return (
    <section
      id="process"
      className="section-pad relative"
      aria-labelledby="process-title"
    >
      <div className="container-studio">
        <Reveal>
          <SectionHeading
            eyebrow={content.eyebrow}
            title={content.title}
            description={content.description}
          />
        </Reveal>
        <ol className="mt-16 space-y-0">
          {content.steps.map((step, index) => (
            <Reveal key={step.id} delay={index * 0.05}>
              <li className="group grid gap-4 border-t border-white/10 py-8 md:grid-cols-12 md:items-start md:gap-8 md:py-10">
                <span className="font-display text-4xl font-semibold text-white/15 transition-colors group-hover:text-[#A855F7]/50 md:col-span-2 md:text-5xl">
                  {step.step}
                </span>
                <div className="md:col-span-3">
                  <h3 className="font-display text-2xl font-semibold text-white">
                    {step.title}
                  </h3>
                </div>
                <p className="text-sm leading-relaxed text-white/55 md:col-span-7 md:text-base">
                  {step.description}
                </p>
              </li>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
