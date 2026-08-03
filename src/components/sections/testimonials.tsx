"use client";

import { useState } from "react";

import { AnimatePresence, motion } from "motion/react";

import { Reveal } from "@/components/common/reveal";
import { SectionHeading } from "@/components/common/section-heading";
import { getContent } from "@/content";
import { cn } from "@/lib/utils";

export function TestimonialsSection() {
  const content = getContent().testimonials;
  const [active, setActive] = useState(0);
  const item = content.items[active]!;

  return (
    <section
      id="testimonials"
      className="section-pad relative"
      aria-labelledby="testimonials-title"
    >
      <div className="container-studio">
        <Reveal>
          <SectionHeading
            eyebrow={content.eyebrow}
            title={content.title}
            description={content.description}
          />
        </Reveal>

        <Reveal className="mt-14" delay={0.1}>
          <div className="glass relative overflow-hidden rounded-[2rem] p-8 md:p-12 lg:p-16">
            <div className="pointer-events-none absolute -top-24 -left-16 size-64 rounded-full bg-[#7C3AED]/20 blur-3xl" />
            <AnimatePresence mode="wait">
              <motion.blockquote
                key={item.id}
                initial={{ opacity: 0, y: 20, filter: "blur(6px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -12, filter: "blur(6px)" }}
                transition={{ duration: 0.45 }}
                className="relative"
              >
                <p className="font-display max-w-4xl text-2xl leading-snug font-medium text-white sm:text-3xl md:text-4xl">
                  &ldquo;{item.quote}&rdquo;
                </p>
                <footer className="mt-10">
                  <cite className="not-italic">
                    <span className="block text-base font-medium text-white">
                      {item.name}
                    </span>
                    <span className="mt-1 block text-sm text-white/50">
                      {item.role}, {item.company}
                    </span>
                  </cite>
                </footer>
              </motion.blockquote>
            </AnimatePresence>

            <div
              className="mt-10 flex gap-2"
              role="tablist"
              aria-label="Testimonials"
            >
              {content.items.map((t, i) => (
                <button
                  key={t.id}
                  type="button"
                  role="tab"
                  aria-selected={i === active}
                  aria-label={`Show testimonial from ${t.name}`}
                  data-cursor="hover"
                  onClick={() => setActive(i)}
                  className={cn(
                    "h-1.5 rounded-full transition-all duration-300",
                    i === active
                      ? "w-10 bg-[#A855F7]"
                      : "w-4 bg-white/20 hover:bg-white/40",
                  )}
                />
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
