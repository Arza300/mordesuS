"use client";

import { useRef, useState } from "react";

import Image from "next/image";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useSpring,
} from "motion/react";

import { Reveal } from "@/components/common/reveal";
import { SectionHeading } from "@/components/common/section-heading";
import { getContent } from "@/content";
import type { Project } from "@/content/types";
import { cn } from "@/lib/utils";

function ProjectCard({ project, index }: { project: Project; index: number }) {
  const ref = useRef<HTMLAnchorElement>(null);
  const [hovered, setHovered] = useState(false);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useSpring(0, { stiffness: 200, damping: 20 });
  const rotateY = useSpring(0, { stiffness: 200, damping: 20 });
  const labelX = useSpring(0, { stiffness: 250, damping: 25 });
  const labelY = useSpring(0, { stiffness: 250, damping: 25 });

  const glow = useMotionTemplate`radial-gradient(420px circle at ${mouseX}px ${mouseY}px, rgba(168,85,247,0.18), transparent 55%)`;

  const onMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    mouseX.set(x);
    mouseY.set(y);
    const px = (x / rect.width - 0.5) * 2;
    const py = (y / rect.height - 0.5) * 2;
    rotateY.set(px * 8);
    rotateX.set(-py * 8);
    labelX.set(x);
    labelY.set(y);
  };

  const onLeave = () => {
    setHovered(false);
    rotateX.set(0);
    rotateY.set(0);
  };

  return (
    <Reveal delay={index * 0.08}>
      <motion.a
        ref={ref}
        href={project.href}
        data-cursor="hover"
        onMouseMove={onMove}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={onLeave}
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
          perspective: 1000,
        }}
        className={cn(
          "group relative block overflow-hidden rounded-3xl border border-white/10 bg-[#0a0a0a]",
          "transition-[border-color] duration-500 hover:border-[#A855F7]/35",
        )}
      >
        <motion.div
          className="pointer-events-none absolute inset-0 z-10 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{ background: glow }}
        />

        <div className="relative aspect-[16/10] overflow-hidden">
          <Image
            src={project.image}
            alt={project.imageAlt}
            fill
            unoptimized
            sizes="(max-width: 768px) 100vw, 50vw"
            className={cn(
              "object-cover transition-all duration-700 ease-out",
              hovered ? "scale-110 blur-[1px]" : "scale-100",
            )}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/20 to-transparent" />
          {project.video ? (
            <video
              className={cn(
                "absolute inset-0 h-full w-full object-cover transition-opacity duration-500",
                hovered ? "opacity-80" : "opacity-0",
              )}
              src={project.video}
              muted
              loop
              playsInline
              preload="none"
              autoPlay={hovered}
            />
          ) : null}
        </div>

        <div className="relative z-20 flex flex-col gap-3 p-6 md:p-8">
          <div className="flex items-center justify-between gap-4 text-xs tracking-[0.18em] text-white/45 uppercase">
            <span>{project.category}</span>
            <span>{project.year}</span>
          </div>
          <h3 className="font-display text-2xl font-semibold tracking-tight text-white md:text-3xl">
            {project.title}
          </h3>
          <p className="max-w-xl text-sm leading-relaxed text-white/55 md:text-base">
            {project.description}
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {project.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-white/10 px-3 py-1 text-[11px] tracking-wide text-white/50"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        <motion.div
          aria-hidden
          className="pointer-events-none absolute z-30 hidden rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[10px] tracking-[0.2em] text-white uppercase backdrop-blur-md md:block"
          style={{
            left: labelX,
            top: labelY,
            x: "-50%",
            y: "-140%",
            opacity: hovered ? 1 : 0,
            scale: hovered ? 1 : 0.85,
          }}
        >
          View
        </motion.div>
      </motion.a>
    </Reveal>
  );
}

export function ProjectsSection() {
  const content = getContent().projects;

  return (
    <section
      id="work"
      className="section-pad relative"
      aria-labelledby="work-title"
    >
      <div className="container-studio">
        <Reveal>
          <SectionHeading
            eyebrow={content.eyebrow}
            title={content.title}
            description={content.description}
          />
        </Reveal>
        <div className="mt-14 grid gap-8 lg:grid-cols-2">
          {content.items.map((project, index) => (
            <ProjectCard key={project.id} project={project} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
