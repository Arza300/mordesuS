"use client";

import { useMemo } from "react";

import {
  Bloom,
  ChromaticAberration,
  EffectComposer,
  Vignette,
} from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import { Vector2 } from "three";

type HeroEffectsProps = {
  holdProgress: number;
  enabled?: boolean;
};

export function HeroEffects({
  holdProgress,
  enabled = true,
}: HeroEffectsProps) {
  const offset = useMemo(() => {
    const base = 0.0012 + holdProgress * 0.004;
    return new Vector2(base, base * 0.8);
  }, [holdProgress]);

  if (!enabled) return null;

  return (
    <EffectComposer multisampling={0} enableNormalPass={false}>
      <Bloom
        intensity={0.4 + holdProgress * 0.9}
        luminanceThreshold={0.28}
        luminanceSmoothing={0.6}
        mipmapBlur
      />
      <ChromaticAberration
        blendFunction={BlendFunction.NORMAL}
        offset={offset}
        radialModulation
        modulationOffset={0.25}
      />
      <Vignette offset={0.3} darkness={0.55} />
    </EffectComposer>
  );
}
