"use client";

import { useEffect, useRef, useState } from "react";

import { AnimatePresence, motion } from "motion/react";

import { LOGO_SHARDS } from "@/components/projects/logo-shards";
import type { PublishedProject } from "@/types/project";

export type MorphTargetRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type LogoToProjectsMorphProps = {
  active: boolean;
  projects: PublishedProject[];
  logoRect: MorphTargetRect | null;
  targets: MorphTargetRect[] | null;
  onComplete: () => void;
};

const SETTLE_DURATION = 0.95;
const HANDOFF_FADE_MS = 140;
const SOFT_EASE: [number, number, number, number] = [0.33, 1, 0.32, 1];

/**
 * Single animation: logo shards → project cards.
 * Exit-fades over already-visible cards so the handoff never blinks.
 */
export function LogoToProjectsMorph({
  active,
  projects,
  logoRect,
  targets,
  onComplete,
}: LogoToProjectsMorphProps) {
  const completedRef = useRef(false);
  const [ready, setReady] = useState(false);

  const count = Math.min(
    projects.length,
    targets?.length ?? 0,
    LOGO_SHARDS.length,
  );
  const canRun = active && !!logoRect && !!targets && count > 0;

  useEffect(() => {
    if (!canRun) {
      setReady(false);
      completedRef.current = false;
      return;
    }
    const id = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(id);
  }, [canRun]);

  useEffect(() => {
    if (!active) {
      completedRef.current = false;
      setReady(false);
    }
  }, [active]);

  useEffect(() => {
    if (!ready || !canRun || completedRef.current) return;

    const lastStagger = (count - 1) * 0.05;
    // Finish settle, then reveal real cards while morph still covers them,
    // then morph exit-fades (AnimatePresence) with no blank frame.
    const ms = (SETTLE_DURATION + lastStagger) * 1000;
    const t = setTimeout(() => {
      if (completedRef.current) return;
      completedRef.current = true;
      onComplete();
    }, ms);

    return () => clearTimeout(t);
  }, [ready, canRun, count, onComplete]);

  return (
    <AnimatePresence>
      {canRun && logoRect && targets ? (
        <motion.div
          key="logo-to-projects-morph"
          className="pointer-events-none fixed inset-0 z-[90]"
          aria-hidden
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: HANDOFF_FADE_MS / 1000, ease: "easeOut" }}
        >
          {projects.slice(0, count).map((project, index) => {
            const shard = LOGO_SHARDS[index]!;
            const target = targets[index]!;

            return (
              <MorphPiece
                key={project.id}
                project={project}
                clip={shard.clip}
                logoRect={logoRect}
                target={target}
                index={index}
                ready={ready}
              />
            );
          })}
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function MorphPiece({
  project,
  clip,
  logoRect,
  target,
  index,
  ready,
}: {
  project: PublishedProject;
  clip: string;
  logoRect: MorphTargetRect;
  target: MorphTargetRect;
  index: number;
  ready: boolean;
}) {
  const stagger = index * 0.05;

  const origin = {
    left: logoRect.x,
    top: logoRect.y,
    width: logoRect.width,
    height: logoRect.height,
    rotate: 0,
    scale: 1,
    clipPath: clip,
  };

  const settle = {
    left: target.x,
    top: target.y,
    width: target.width,
    height: target.height,
    rotate: 0,
    scale: 1,
    clipPath: "inset(0% 0% 0% 0%)",
  };

  return (
    <motion.div
      className="absolute overflow-hidden will-change-transform"
      initial={origin}
      animate={ready ? settle : origin}
      transition={{
        duration: SETTLE_DURATION,
        delay: stagger,
        ease: SOFT_EASE,
        clipPath: {
          duration: SETTLE_DURATION * 0.75,
          delay: stagger + 0.12,
          ease: SOFT_EASE,
        },
      }}
      style={{ filter: "drop-shadow(0 8px 24px rgba(0,0,0,0.35))" }}
    >
      <motion.img
        src="/brand/logo.png"
        alt=""
        draggable={false}
        className="absolute inset-0 h-full w-full object-contain"
        initial={{ opacity: 1 }}
        animate={{ opacity: ready ? 0 : 1 }}
        transition={{
          duration: 0.5,
          delay: stagger + 0.06,
          ease: "easeInOut",
        }}
      />
      <motion.img
        src={project.imageUrl}
        alt=""
        draggable={false}
        className="absolute inset-0 h-full w-full object-cover"
        initial={{ opacity: 0 }}
        animate={{ opacity: ready ? 1 : 0 }}
        transition={{
          duration: 0.55,
          delay: stagger + 0.04,
          ease: "easeInOut",
        }}
      />
    </motion.div>
  );
}
