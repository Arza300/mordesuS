"use client";

import { useEffect, useRef } from "react";

import { motion } from "motion/react";

import {
  ExperiencePointerTracker,
  ShaderExperienceRenderer,
} from "@/experiences/shared/webgl-renderer";
import { cn } from "@/lib/utils";

type ShaderExperienceCanvasProps = {
  active: boolean;
  fragmentShader: string;
  pointerX?: number;
  pointerY?: number;
  className?: string;
  label?: string;
};

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
  activeRef.current = active;
  labelRef.current = label;

  // Create WebGL once for this canvas element — never depend on fragmentShader here
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dprScale = Math.min(
      0.65,
      Math.max(0.4, window.devicePixelRatio * 0.45),
    );

    try {
      const renderer = new ShaderExperienceRenderer(
        canvas,
        fragmentShader,
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
      rafRef.current = requestAnimationFrame(loop);
      if (!activeRef.current) return;
      const renderer = rendererRef.current;
      if (!renderer) return;
      const tracker = trackerRef.current;
      renderer.updateMove(tracker.moves);
      renderer.updateWheel(tracker.wheel);
      renderer.render(now);
    };

    rafRef.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
      rendererRef.current?.dispose();
      rendererRef.current = null;
      trackerRef.current.reset();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount once per canvas
  }, []);

  // Hot-swap fragment program without destroying the WebGL context
  useEffect(() => {
    const renderer = rendererRef.current;
    if (!renderer) return;
    try {
      renderer.updateFragment(fragmentShader);
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
    } else {
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
