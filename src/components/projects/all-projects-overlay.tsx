"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import Image from "next/image";
import Link from "next/link";
import { ChevronDown, Menu } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

import { BrandMark } from "@/components/common/brand-mark";
import type { MorphTargetRect } from "@/components/projects/logo-to-projects-morph";
import type { PublishedProject } from "@/types/project";
import { cn } from "@/lib/utils";

type AllProjectsOverlayProps = {
  open: boolean;
  projects: PublishedProject[];
  onClose: () => void;
  /** First N cards stay invisible while morph pieces fly in */
  morphing?: boolean;
  morphedCount?: number;
  onTargetsReady?: (rects: MorphTargetRect[]) => void;
};

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

/** Long Resn-style shaft + chevron arrow */
function LongArrow({ direction }: { direction: "up" | "down" }) {
  return (
    <svg
      viewBox="0 0 24 80"
      className="h-[4.5rem] w-5 sm:h-24 sm:w-6"
      fill="none"
      aria-hidden
    >
      <g
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        transform={direction === "up" ? "rotate(180 12 40)" : undefined}
      >
        <line x1="12" y1="2" x2="12" y2="64" />
        <polyline points="4,54 12,70 20,54" />
      </g>
    </svg>
  );
}

/** Default filter label — key shipped ideas, not an exhaustive archive */
const ALL_LABEL = "Selected Ideas";

export function AllProjectsOverlay({
  open,
  projects,
  onClose,
  morphing = false,
  morphedCount = 0,
  onTargetsReady,
}: AllProjectsOverlayProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollAnimRef = useRef<number | null>(null);
  const mediaRefs = useRef<(HTMLDivElement | null)[]>([]);

  const categories = useMemo(() => {
    const unique = Array.from(new Set(projects.map((p) => p.category))).sort();
    return [ALL_LABEL, ...unique];
  }, [projects]);

  const [filter, setFilter] = useState(ALL_LABEL);
  const [filterOpen, setFilterOpen] = useState(false);
  const [canScrollUp, setCanScrollUp] = useState(false);
  const [canScrollDown, setCanScrollDown] = useState(false);

  const filtered =
    filter === ALL_LABEL
      ? projects
      : projects.filter((p) => p.category === filter);

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const max = el.scrollHeight - el.clientHeight;
    setCanScrollUp(el.scrollTop > 8);
    setCanScrollDown(max > 8 && el.scrollTop < max - 8);
  }, []);

  useEffect(() => {
    if (!open) return;
    const el = scrollRef.current;
    if (!el) return;

    updateScrollState();
    el.addEventListener("scroll", updateScrollState, { passive: true });
    const ro = new ResizeObserver(updateScrollState);
    ro.observe(el);

    return () => {
      el.removeEventListener("scroll", updateScrollState);
      ro.disconnect();
      if (scrollAnimRef.current !== null) {
        cancelAnimationFrame(scrollAnimRef.current);
      }
    };
  }, [open, filtered.length, filter, updateScrollState]);

  // Reset filter when overlay closes so morph always maps to full list order
  useEffect(() => {
    if (!open) {
      setFilter(ALL_LABEL);
      setFilterOpen(false);
    }
  }, [open]);

  // Measure morph target media boxes (first N projects in published order)
  useEffect(() => {
    if (!open || !onTargetsReady || morphedCount <= 0) return;

    let cancelled = false;
    const measure = () => {
      if (cancelled) return;
      const rects: MorphTargetRect[] = [];
      for (let i = 0; i < morphedCount; i++) {
        const el = mediaRefs.current[i];
        if (!el) return;
        const r = el.getBoundingClientRect();
        if (r.width < 2 || r.height < 2) return;
        rects.push({
          x: r.left,
          y: r.top,
          width: r.width,
          height: r.height,
        });
      }
      if (rects.length === morphedCount) {
        onTargetsReady(rects);
      }
    };

    // Wait for layout after overlay mounts
    const raf = requestAnimationFrame(() => {
      requestAnimationFrame(measure);
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
    };
  }, [open, morphedCount, onTargetsReady, projects.length]);

  const scrollByPage = (direction: "up" | "down") => {
    const el = scrollRef.current;
    if (!el) return;

    if (scrollAnimRef.current !== null) {
      cancelAnimationFrame(scrollAnimRef.current);
    }

    const amount = Math.max(340, Math.round(el.clientHeight * 0.8));
    const start = el.scrollTop;
    const max = el.scrollHeight - el.clientHeight;
    const end = Math.max(
      0,
      Math.min(max, start + (direction === "down" ? amount : -amount)),
    );
    const delta = end - start;
    if (Math.abs(delta) < 1) return;

    const duration = 1150;
    const t0 = performance.now();

    const tick = (now: number) => {
      const progress = Math.min(1, (now - t0) / duration);
      el.scrollTop = start + delta * easeInOutCubic(progress);
      if (progress < 1) {
        scrollAnimRef.current = requestAnimationFrame(tick);
      } else {
        scrollAnimRef.current = null;
        updateScrollState();
      }
    };

    scrollAnimRef.current = requestAnimationFrame(tick);
  };

  // Sit just outside the max-w-6xl project grid
  const arrowSideClass =
    "fixed top-1/2 z-30 -translate-y-1/2 p-1 text-white/90 transition-[opacity,transform] duration-300";

  const setMediaRef = useCallback(
    (index: number) => (el: HTMLDivElement | null) => {
      mediaRefs.current[index] = el;
    },
    [],
  );

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          key="all-projects"
          role="dialog"
          aria-modal="true"
          aria-label="Selected ideas"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{
            duration: 0.7,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="font-projects fixed inset-0 z-[80] bg-[#0a0a0a] text-white"
        >
          <button
            type="button"
            aria-label="Scroll projects up"
            disabled={!canScrollUp}
            onClick={() => scrollByPage("up")}
            className={cn(
              arrowSideClass,
              "left-[max(1rem,calc((100vw-72rem)/2-5.5rem))] hover:-translate-y-[calc(50%+4px)]",
              canScrollUp
                ? "opacity-90 hover:opacity-100"
                : "pointer-events-none opacity-20",
            )}
          >
            <LongArrow direction="up" />
          </button>

          <button
            type="button"
            aria-label="Scroll projects down"
            disabled={!canScrollDown}
            onClick={() => scrollByPage("down")}
            className={cn(
              arrowSideClass,
              "right-[max(1rem,calc((100vw-72rem)/2-5.5rem))] hover:-translate-y-[calc(50%-4px)]",
              canScrollDown
                ? "opacity-90 hover:opacity-100"
                : "pointer-events-none opacity-20",
            )}
          >
            <LongArrow direction="down" />
          </button>

          <div
            ref={scrollRef}
            className="relative z-10 h-full overflow-y-auto overscroll-contain"
          >
            <header className="sticky top-0 z-20 flex items-center justify-between bg-[#0a0a0a]/80 px-5 py-5 backdrop-blur-sm sm:px-8 lg:px-10">
              <Link
                href="/"
                onClick={onClose}
                className="relative z-10 inline-flex items-center"
                aria-label="Close and return home"
              >
                <BrandMark size={36} />
              </Link>

              <div className="relative z-10 flex items-center gap-5 sm:gap-7">
                <button
                  type="button"
                  onClick={onClose}
                  className="font-projects text-[12px] font-light tracking-[0.14em] text-white/90 uppercase transition-colors hover:text-white sm:text-[13px]"
                >
                  Close Ideas
                </button>
                <span
                  className="inline-flex size-9 items-center justify-center text-white/80"
                  aria-hidden
                >
                  <Menu className="size-5" strokeWidth={1.25} />
                </span>
              </div>
            </header>

            <div className="relative z-10 mx-auto w-full max-w-6xl px-10 pt-6 pb-24 sm:px-14 lg:px-16">
              <div className="mb-10 sm:mb-14">
                <p className="mb-2 text-[10px] font-normal tracking-[0.32em] text-white/40 uppercase">
                  Filter
                </p>
                <div className="relative inline-block">
                  <button
                    type="button"
                    aria-expanded={filterOpen}
                    onClick={() => setFilterOpen((v) => !v)}
                    className="inline-flex items-center gap-2.5 text-left text-3xl font-light tracking-[-0.02em] text-white sm:text-4xl md:text-[3.25rem] md:leading-none"
                  >
                    {filter}
                    <ChevronDown
                      className={cn(
                        "size-5 opacity-70 transition-transform sm:size-6",
                        filterOpen && "rotate-180",
                      )}
                      strokeWidth={1.5}
                    />
                  </button>

                  <AnimatePresence>
                    {filterOpen ? (
                      <motion.ul
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        className="absolute top-full left-0 z-30 mt-3 min-w-[14rem] border border-white/10 bg-[#111] py-2 shadow-2xl"
                      >
                        {categories.map((category) => (
                          <li key={category}>
                            <button
                              type="button"
                              className={cn(
                                "block w-full px-4 py-2.5 text-left text-sm font-light tracking-wide text-white/55 transition-colors hover:bg-white/5 hover:text-white",
                                category === filter && "font-normal text-white",
                              )}
                              onClick={() => {
                                setFilter(category);
                                setFilterOpen(false);
                              }}
                            >
                              {category}
                            </button>
                          </li>
                        ))}
                      </motion.ul>
                    ) : null}
                  </AnimatePresence>
                </div>
              </div>

              {filtered.length === 0 ? (
                <p className="text-sm text-white/50">
                  No published projects yet.
                </p>
              ) : (
                <div className="grid grid-cols-1 gap-x-8 gap-y-12 md:grid-cols-2 md:gap-y-16">
                  {filtered.map((project, index) => {
                    // Map filtered index back to published order for morph refs
                    const publishedIndex = projects.findIndex(
                      (p) => p.id === project.id,
                    );
                    const isMorphSlot =
                      publishedIndex >= 0 && publishedIndex < morphedCount;

                    return (
                      <OverlayProjectCard
                        key={project.id}
                        project={project}
                        index={index}
                        mediaRef={
                          isMorphSlot ? setMediaRef(publishedIndex) : undefined
                        }
                        morphing={morphing}
                        isMorphSlot={isMorphSlot}
                      />
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function OverlayProjectCard({
  project,
  index,
  mediaRef,
  morphing = false,
  isMorphSlot = false,
}: {
  project: PublishedProject;
  index: number;
  mediaRef?: (el: HTMLDivElement | null) => void;
  morphing?: boolean;
  isMorphSlot?: boolean;
}) {
  const href = project.href?.trim() || null;
  const media = (
    <>
      <div
        ref={mediaRef}
        className="relative mb-4 aspect-[16/10] overflow-hidden bg-[#141414]"
      >
        <Image
          src={project.imageUrl}
          alt={project.imageAlt}
          fill
          unoptimized
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
        />
      </div>
      <h3 className="text-[13px] font-semibold tracking-[0.14em] text-white uppercase sm:text-[14px]">
        {project.title}
      </h3>
      <p className="mt-1.5 text-[13px] font-light text-white/40">
        {project.client}
      </p>
    </>
  );

  // Morph slots: CSS opacity only (no motion re-fire) so handoff has no blank frame.
  // Remaining cards: soft stagger after morph ends.
  if (isMorphSlot) {
    return (
      <article
        className={cn(
          "transition-none",
          morphing ? "pointer-events-none opacity-0" : "opacity-100",
        )}
        aria-hidden={morphing}
      >
        {href ? (
          <a
            href={href}
            className="group block"
            target={href.startsWith("http") ? "_blank" : undefined}
            rel={href.startsWith("http") ? "noreferrer" : undefined}
            tabIndex={morphing ? -1 : undefined}
          >
            {media}
          </a>
        ) : (
          <div className="group block">{media}</div>
        )}
      </article>
    );
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 28 }}
      animate={morphing ? { opacity: 0, y: 28 } : { opacity: 1, y: 0 }}
      transition={
        morphing
          ? { duration: 0 }
          : {
              duration: 0.55,
              delay: 0.05 + index * 0.06,
              ease: [0.22, 1, 0.36, 1] as const,
            }
      }
    >
      {href ? (
        <a
          href={href}
          className="group block"
          target={href.startsWith("http") ? "_blank" : undefined}
          rel={href.startsWith("http") ? "noreferrer" : undefined}
        >
          {media}
        </a>
      ) : (
        <div className="group block">{media}</div>
      )}
    </motion.article>
  );
}
