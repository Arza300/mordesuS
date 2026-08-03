import { ElevatorCanvas } from "@/experiences/elevator/elevator-canvas";
import { ELEVATOR_FRAGMENT_SHADER } from "@/experiences/elevator/shader.frag";
import { GridRunCanvas } from "@/experiences/grid-run/grid-run-canvas";
import { GRID_RUN_FRAGMENT_SHADER } from "@/experiences/grid-run/shader.frag";
import { NeuralSynapseCanvas } from "@/experiences/neural-synapse/neural-synapse-canvas";
import { RadioStormCanvas } from "@/experiences/radio-storm/radio-storm-canvas";

export const EXPERIENCE_IDS = [
  "elevator",
  "grid-run",
  "neural-synapse",
  "radio-storm",
] as const;

export type ExperienceId = (typeof EXPERIENCE_IDS)[number];

export type ShaderExperienceId = "elevator" | "grid-run";

export const DEFAULT_EXPERIENCE: ExperienceId = "elevator";

export const EXPERIENCE_SHADERS: Record<ShaderExperienceId, string> = {
  elevator: ELEVATOR_FRAGMENT_SHADER,
  "grid-run": GRID_RUN_FRAGMENT_SHADER,
};

export function isShaderExperience(id: ExperienceId): id is ShaderExperienceId {
  return id === "elevator" || id === "grid-run";
}

export function getExperienceComponent(id: ExperienceId = DEFAULT_EXPERIENCE) {
  switch (id) {
    case "grid-run":
      return GridRunCanvas;
    case "neural-synapse":
      return NeuralSynapseCanvas;
    case "radio-storm":
      return RadioStormCanvas;
    case "elevator":
    default:
      return ElevatorCanvas;
  }
}

export { ElevatorCanvas, GridRunCanvas, NeuralSynapseCanvas, RadioStormCanvas };
