"use client";

import { useEffect, useRef } from "react";

import { motion } from "motion/react";

import { RadioStormEngine } from "@/experiences/radio-storm/engine";
import { cn } from "@/lib/utils";

type RadioStormCanvasProps = {
  active: boolean;
  pointerX?: number;
  pointerY?: number;
  className?: string;
};

export function RadioStormCanvas({
  active,
  pointerX = 0,
  pointerY = 0,
  className,
}: RadioStormCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<RadioStormEngine | null>(null);
  const activeRef = useRef(active);
  activeRef.current = active;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let engine: RadioStormEngine | null = null;
    try {
      engine = new RadioStormEngine(canvas);
      engineRef.current = engine;
      engine.setActive(activeRef.current);
    } catch (err) {
      console.error("[RadioStorm]", err);
      return;
    }

    const resize = () => {
      const parent = canvas.parentElement;
      engine?.resize(parent?.clientWidth, parent?.clientHeight);
    };
    resize();
    window.addEventListener("resize", resize);

    return () => {
      window.removeEventListener("resize", resize);
      engine?.dispose();
      engineRef.current = null;
    };
  }, []);

  useEffect(() => {
    engineRef.current?.setActive(active);
    if (active) {
      const canvas = canvasRef.current;
      const parent = canvas?.parentElement;
      engineRef.current?.resize(parent?.clientWidth, parent?.clientHeight);
    }
  }, [active]);

  useEffect(() => {
    if (!active) return;
    engineRef.current?.setPointer(pointerX, pointerY);
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
      <canvas ref={canvasRef} className="block h-full w-full" />
    </motion.div>
  );
}
