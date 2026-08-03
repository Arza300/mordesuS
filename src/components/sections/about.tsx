"use client";

import { Reveal } from "@/components/common/reveal";
import { SectionHeading } from "@/components/common/section-heading";
import { getContent } from "@/content";

export function AboutSection() {
  const content = getContent().about;

  return (
    <section
      id="about"
      className="section-pad relative"
      aria-labelledby="about-title"
    >
      <div className="container-studio">
        <Reveal>
          <SectionHeading eyebrow={content.eyebrow} title={content.title} />
        </Reveal>
        <div className="mt-12 grid gap-10 lg:grid-cols-12 lg:gap-16">
          <div className="space-y-6 lg:col-span-7">
            {content.body.map((paragraph) => (
              <Reveal key={paragraph.slice(0, 24)}>
                <p className="text-lg leading-relaxed text-white/65 md:text-xl">
                  {paragraph}
                </p>
              </Reveal>
            ))}
          </div>
          <Reveal className="lg:col-span-5" delay={0.15}>
            <div className="glass glow-box rounded-3xl p-8 md:p-10">
              <p className="font-display text-2xl leading-snug font-medium text-white md:text-3xl">
                {content.highlight}
              </p>
              <div className="mt-8 h-px w-full bg-gradient-to-r from-[#7C3AED] via-[#A855F7] to-transparent" />
              <p className="mt-6 text-sm tracking-[0.2em] text-white/40 uppercase">
                Mordesu Studio
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
