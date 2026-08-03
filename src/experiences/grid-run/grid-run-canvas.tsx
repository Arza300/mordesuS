"use client";

import { ShaderExperienceCanvas } from "@/experiences/shared/shader-experience-canvas";
import { GRID_RUN_FRAGMENT_SHADER } from "@/experiences/grid-run/shader.frag";

type GridRunCanvasProps = {
  active: boolean;
  pointerX?: number;
  pointerY?: number;
  className?: string;
};

export function GridRunCanvas({
  active,
  pointerX,
  pointerY,
  className,
}: GridRunCanvasProps) {
  return (
    <ShaderExperienceCanvas
      active={active}
      fragmentShader={GRID_RUN_FRAGMENT_SHADER}
      pointerX={pointerX}
      pointerY={pointerY}
      className={className}
      label="GridRun"
    />
  );
}
