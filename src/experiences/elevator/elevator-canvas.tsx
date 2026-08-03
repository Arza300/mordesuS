"use client";

import { ShaderExperienceCanvas } from "@/experiences/shared/shader-experience-canvas";
import { ELEVATOR_FRAGMENT_SHADER } from "@/experiences/elevator/shader.frag";

type ElevatorCanvasProps = {
  active: boolean;
  pointerX?: number;
  pointerY?: number;
  className?: string;
};

export function ElevatorCanvas({
  active,
  pointerX,
  pointerY,
  className,
}: ElevatorCanvasProps) {
  return (
    <ShaderExperienceCanvas
      active={active}
      fragmentShader={ELEVATOR_FRAGMENT_SHADER}
      pointerX={pointerX}
      pointerY={pointerY}
      className={className}
      label="Elevator"
    />
  );
}
