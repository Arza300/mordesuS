"use client";

import { useState } from "react";

import { AnimatePresence, motion } from "motion/react";
import { Plus } from "lucide-react";

import { Reveal } from "@/components/common/reveal";
import { SectionHeading } from "@/components/common/section-heading";
import { getContent } from "@/content";
import { cn } from "@/lib/utils";

export function FaqSection() {
  const content = getContent().faq;
  const [openId, setOpenId] = useState<string | null>(
    content.items[0]?.id ?? null,
  );

  return (
    <section
      id="faq"
      className="section-pad relative"
      aria-labelledby="faq-title"
    >
      <div className="container-studio">
        <Reveal>
          <SectionHeading
            eyebrow={content.eyebrow}
            title={content.title}
            description={content.description}
          />
        </Reveal>

        <div className="mt-12 max-w-3xl">
          {content.items.map((item, index) => {
            const open = openId === item.id;
            return (
              <Reveal key={item.id} delay={index * 0.04}>
                <div className="border-b border-white/10">
                  <h3>
                    <button
                      type="button"
                      data-cursor="hover"
                      aria-expanded={open}
                      aria-controls={`faq-panel-${item.id}`}
                      id={`faq-button-${item.id}`}
                      className="flex w-full items-center justify-between gap-4 py-6 text-left"
                      onClick={() => setOpenId(open ? null : item.id)}
                    >
                      <span className="font-display text-lg font-medium text-white md:text-xl">
                        {item.question}
                      </span>
                      <Plus
                        className={cn(
                          "size-5 shrink-0 text-[#A855F7] transition-transform duration-300",
                          open && "rotate-45",
                        )}
                        aria-hidden
                      />
                    </button>
                  </h3>
                  <AnimatePresence initial={false}>
                    {open ? (
                      <motion.div
                        id={`faq-panel-${item.id}`}
                        role="region"
                        aria-labelledby={`faq-button-${item.id}`}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{
                          duration: 0.35,
                          ease: [0.22, 1, 0.36, 1],
                        }}
                        className="overflow-hidden"
                      >
                        <p className="pb-6 text-sm leading-relaxed text-white/55 md:text-base">
                          {item.answer}
                        </p>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
