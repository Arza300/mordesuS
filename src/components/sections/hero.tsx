"use client";

import { useEffect, useRef, useState } from "react";

import { BrokenLogoButton } from "@/components/common/broken-logo-button";
import { HoldProgressBar } from "@/components/common/hold-progress-bar";
import { AllProjectsOverlay } from "@/components/projects/all-projects-overlay";
import { getContent } from "@/content";
import {
  EXPERIENCE_IDS,
  EXPERIENCE_SHADERS,
  isShaderExperience,
  type ExperienceId,
} from "@/experiences";
import { NeuralSynapseCanvas } from "@/experiences/neural-synapse/neural-synapse-canvas";
import { RadioStormCanvas } from "@/experiences/radio-storm/radio-storm-canvas";
import { ShaderExperienceCanvas } from "@/experiences/shared/shader-experience-canvas";
import { useHoldChargeAudio } from "@/hooks/use-hold-charge-audio";
import { useHoldInteraction } from "@/hooks/use-hold-interaction";
import { useIsTouchDevice } from "@/hooks/use-media-query";
import {
  playLogoExplodeSound,
  playLogoReassembleSound,
} from "@/lib/logo-explode-sound";
import { useLenis } from "@/providers/smooth-scroll-provider";
import { useProjectsOverlayStore } from "@/stores/projects-overlay-store";
import type { PublishedProject } from "@/types/project";
import { cn } from "@/lib/utils";

const EXPLODE_TO_OVERLAY_MS = 650;

type HeroSectionProps = {
  projects: PublishedProject[];
};

export function HeroSection({ projects }: HeroSectionProps) {
  const content = getContent().hero;
  const isTouch = useIsTouchDevice();
  const { setScrollLocked, scrollLocked } = useLenis();
  const rootRef = useRef<HTMLElement>(null);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const [pointer, setPointer] = useState({ x: 0, y: 0 });
  const activePointer = useRef<number | null>(null);
  const [experienceIndex, setExperienceIndex] = useState(0);
  const wasExperienceActive = useRef(false);
  const explodeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const {
    open: projectsOpen,
    exploding,
    openProjects,
    markOverlayReady,
    closeProjects,
  } = useProjectsOverlayStore();

  useEffect(() => {
    document.documentElement.dataset.scrollGate = "locked";
    setScrollLocked(true);
  }, [setScrollLocked]);

  useEffect(() => {
    if (projectsOpen) {
      setScrollLocked(false);
      document.documentElement.dataset.scrollGate = "open";
      return;
    }
    document.documentElement.dataset.scrollGate = "locked";
    setScrollLocked(true);
  }, [projectsOpen, setScrollLocked]);

  useEffect(() => {
    if (!exploding) return;

    explodeTimer.current = setTimeout(() => {
      markOverlayReady();
    }, EXPLODE_TO_OVERLAY_MS);

    return () => {
      if (explodeTimer.current) clearTimeout(explodeTimer.current);
    };
  }, [exploding, markOverlayReady]);

  const { progress, holding, completed, startHold, endHold } =
    useHoldInteraction({
      duration: 1.15,
      releaseDuration: 0.55,
      disabled: projectsOpen || exploding,
    });

  useHoldChargeAudio({
    progress,
    holding,
    disabled: projectsOpen || exploding,
  });

  const experienceActive = holding && completed;
  const logoDispersed = experienceActive || exploding || projectsOpen;
  const currentExperienceId = EXPERIENCE_IDS[
    experienceIndex % EXPERIENCE_IDS.length
  ] as ExperienceId;

  useEffect(() => {
    if (wasExperienceActive.current && !experienceActive) {
      setExperienceIndex((i) => (i + 1) % EXPERIENCE_IDS.length);
    }
    wasExperienceActive.current = experienceActive;
  }, [experienceActive]);

  const handleOpenProjects = (e: React.PointerEvent | React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    endHold();
    void playLogoExplodeSound();
    openProjects();
  };

  const handleCloseProjects = () => {
    void playLogoReassembleSound();
    closeProjects();
  };

  return (
    <>
      <section
        ref={rootRef}
        id="hero"
        className="relative flex h-dvh min-h-[100dvh] touch-none items-center justify-center overflow-hidden bg-[#0a0a0a] select-none"
        aria-label="Hero"
        onPointerMove={(e) => {
          setPointer({ x: e.clientX, y: e.clientY });
          const el = rootRef.current;
          if (!el) return;
          const rect = el.getBoundingClientRect();
          const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
          const y = ((e.clientY - rect.top) / rect.height) * 2 - 1;
          setMouse({
            x: Math.max(-1, Math.min(1, x)),
            y: Math.max(-1, Math.min(1, y)),
          });
        }}
        onPointerDown={(e) => {
          if (projectsOpen || exploding) return;
          if (e.button !== 0) return;
          activePointer.current = e.pointerId;
          setPointer({ x: e.clientX, y: e.clientY });
          try {
            (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
          } catch {
            /* ignore */
          }
          startHold();
        }}
        onPointerUp={(e) => {
          if (
            activePointer.current !== null &&
            e.pointerId !== activePointer.current
          ) {
            return;
          }
          activePointer.current = null;
          endHold();
        }}
        onPointerCancel={(e) => {
          if (
            activePointer.current !== null &&
            e.pointerId !== activePointer.current
          ) {
            return;
          }
          activePointer.current = null;
          endHold();
        }}
        onPointerLeave={() => {
          setMouse({ x: 0, y: 0 });
          if (activePointer.current === null) endHold();
        }}
      >
        <div
          className="pointer-events-none absolute inset-0 z-0"
          style={{
            backgroundImage:
              "radial-gradient(ellipse 55% 45% at 50% 48%, rgba(80,80,100,0.4), transparent 70%)",
          }}
          aria-hidden
        />

        {isShaderExperience(currentExperienceId) ? (
          <ShaderExperienceCanvas
            active={experienceActive}
            fragmentShader={EXPERIENCE_SHADERS[currentExperienceId]}
            label={currentExperienceId}
            pointerX={pointer.x}
            pointerY={pointer.y}
          />
        ) : currentExperienceId === "neural-synapse" ? (
          <NeuralSynapseCanvas
            active={experienceActive}
            pointerX={pointer.x}
            pointerY={pointer.y}
          />
        ) : currentExperienceId === "radio-storm" ? (
          <RadioStormCanvas
            active={experienceActive}
            pointerX={pointer.x}
            pointerY={pointer.y}
          />
        ) : null}

        <div
          className={cn(
            "relative z-10 flex items-center justify-center transition-opacity duration-500 [perspective:1000px]",
            (experienceActive || exploding || projectsOpen) &&
              "pointer-events-none",
            projectsOpen && "opacity-0",
          )}
        >
          <BrokenLogoButton
            progress={progress}
            holding={holding}
            mouseX={isTouch || experienceActive || exploding ? 0 : mouse.x}
            mouseY={isTouch || experienceActive || exploding ? 0 : mouse.y}
            dispersed={logoDispersed}
          />
        </div>

        <div
          className={cn(
            "absolute inset-x-0 top-8 z-20 flex justify-center px-4 transition-opacity duration-400 sm:top-10",
            (experienceActive || exploding || projectsOpen) &&
              "pointer-events-none opacity-0",
          )}
        >
          <button
            type="button"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={handleOpenProjects}
            className="font-projects group pointer-events-auto relative pb-[7px] text-[11px] font-light tracking-[0.28em] text-white uppercase"
          >
            {content.viewWork}
            {/* Empty track */}
            <span
              aria-hidden
              className="absolute inset-x-0 bottom-0 h-px bg-white/25"
            />
            {/* Charge fill: right → left */}
            <span
              aria-hidden
              className="absolute right-0 bottom-0 h-px w-full origin-right scale-x-0 bg-white transition-transform duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-x-100"
            />
          </button>
        </div>

        <div
          className={cn(
            "pointer-events-none absolute inset-x-0 bottom-10 z-20 flex flex-col items-center gap-3 px-4 transition-opacity duration-400",
            (experienceActive || exploding || projectsOpen) && "opacity-0",
          )}
        >
          <p
            className={cn(
              "text-[10px] tracking-[0.4em] text-white/40 uppercase transition-colors duration-300",
              holding && "text-white/75",
              completed && "text-white/60",
            )}
          >
            {content.holdHint}
          </p>
          <HoldProgressBar progress={progress} holding={holding} />
        </div>

        {scrollLocked ? (
          <div className="sr-only" aria-live="polite">
            Hold to charge the mark and reveal a visual experience. Release to
            return. Experiences cycle on each full charge.
          </div>
        ) : null}
      </section>

      <AllProjectsOverlay
        open={projectsOpen}
        projects={projects}
        onClose={handleCloseProjects}
      />
    </>
  );
}
