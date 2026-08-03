"use client";

import { useEffect, useRef } from "react";

import { motion } from "motion/react";

import {
  ExperiencePointerTracker,
  ShaderExperienceRenderer,
} from "@/experiences/shared/webgl-renderer";
import { isCoarsePointer } from "@/lib/device";
import { cn } from "@/lib/utils";

type ShaderExperienceCanvasProps = {
  active: boolean;
  fragmentShader: string;
  pointerX?: number;
  pointerY?: number;
  className?: string;
  label?: string;
};

/** Lower raymarch iteration count on phones (elevator / grid-run). */
function adaptFragmentForDevice(source: string, mobile: boolean): string {
  if (!mobile) return source;
  return source
    .replace(/i\+\+<400;/g, "i++<140;")
    .replace(/i\+\+<400\.;/g, "i++<140.;");
}

export function ShaderExperienceCanvas({
  active,
  fragmentShader,
  pointerX = 0,
  pointerY = 0,
  className,
  label = "experience",
}: ShaderExperienceCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<ShaderExperienceRenderer | null>(null);
  const trackerRef = useRef(new ExperiencePointerTracker());
  const rafRef = useRef(0);
  const activeRef = useRef(active);
  const labelRef = useRef(label);
  const mobileRef = useRef(false);
  activeRef.current = active;
  labelRef.current = label;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const mobile = isCoarsePointer();
    mobileRef.current = mobile;

    const dprScale = mobile
      ? Math.min(0.4, Math.max(0.28, window.devicePixelRatio * 0.28))
      : Math.min(0.65, Math.max(0.4, window.devicePixelRatio * 0.45));

    try {
      const renderer = new ShaderExperienceRenderer(
        canvas,
        adaptFragmentForDevice(fragmentShader, mobile),
        dprScale,
      );
      renderer.setup();
      rendererRef.current = renderer;
    } catch (err) {
      console.error(`[${labelRef.current}]`, err);
      return;
    }

    const resize = () => {
      const parent = canvas.parentElement;
      const w = parent?.clientWidth || window.innerWidth;
      const h = parent?.clientHeight || window.innerHeight;
      rendererRef.current?.resize(w, h);
    };

    resize();
    window.addEventListener("resize", resize);

    const loop = (now: number) => {
      if (!activeRef.current) {
        rafRef.current = 0;
        return;
      }
      rafRef.current = requestAnimationFrame(loop);
      const renderer = rendererRef.current;
      if (!renderer) return;
      const tracker = trackerRef.current;
      renderer.updateMove(tracker.moves);
      renderer.updateWheel(tracker.wheel);
      renderer.render(now);
    };

    if (activeRef.current) {
      rafRef.current = requestAnimationFrame(loop);
    }

    return () => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
      window.removeEventListener("resize", resize);
      rendererRef.current?.dispose();
      rendererRef.current = null;
      trackerRef.current.reset();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount once per canvas
  }, []);

  useEffect(() => {
    const renderer = rendererRef.current;
    if (!renderer) return;
    try {
      renderer.updateFragment(
        adaptFragmentForDevice(fragmentShader, mobileRef.current),
      );
    } catch (err) {
      console.error(`[${label}] fragment swap failed`, err);
    }
  }, [fragmentShader, label]);

  useEffect(() => {
    if (active) {
      trackerRef.current.reset();
      trackerRef.current.onPointerDown(pointerX, pointerY);
      rendererRef.current?.resetClock();
      const canvas = canvasRef.current;
      const parent = canvas?.parentElement;
      if (canvas && parent && rendererRef.current) {
        rendererRef.current.resize(parent.clientWidth, parent.clientHeight);
      }
      if (!rafRef.current) {
        const loop = (now: number) => {
          if (!activeRef.current) {
            rafRef.current = 0;
            return;
          }
          rafRef.current = requestAnimationFrame(loop);
          const renderer = rendererRef.current;
          if (!renderer) return;
          const tracker = trackerRef.current;
          renderer.updateMove(tracker.moves);
          renderer.updateWheel(tracker.wheel);
          renderer.render(now);
        };
        rafRef.current = requestAnimationFrame(loop);
      }
    } else {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
      trackerRef.current.onPointerUp();
      trackerRef.current.reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  useEffect(() => {
    if (!active) return;
    trackerRef.current.onPointerMove(pointerX, pointerY);
  }, [active, pointerX, pointerY]);

  return (
    <motion.div
      className={cn("pointer-events-none absolute inset-0 z-[1]", className)}
      initial={false}
      animate={{ opacity: active ? 1 : 0 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      style={{ visibility: active ? "visible" : "hidden" }}
      aria-hidden={!active}
    >
      <canvas ref={canvasRef} className="block h-full w-full bg-black" />
    </motion.div>
  );
}
