"use client";

import { useEffect, useRef } from "react";

type UseMidBandSecretOptions = {
  /** 0–1 hold progress */
  progress: number;
  enabled?: boolean;
  bandMin?: number;
  bandMax?: number;
  dwellMs?: number;
  onUnlock: () => void;
};

/**
 * Hidden unlock: keep progress inside a mid band continuously for dwellMs.
 * Does not change charge/release physics — watch-only.
 * rAF only runs while progress is inside the band (idle = zero cost).
 */
export function useMidBandSecret({
  progress,
  enabled = true,
  bandMin = 0.2,
  bandMax = 0.8,
  dwellMs = 3000,
  onUnlock,
}: UseMidBandSecretOptions) {
  const progressRef = useRef(progress);
  const onUnlockRef = useRef(onUnlock);
  const firedRef = useRef(false);
  const enteredAtRef = useRef<number | null>(null);

  progressRef.current = progress;
  onUnlockRef.current = onUnlock;

  useEffect(() => {
    if (!enabled) {
      enteredAtRef.current = null;
      return;
    }

    if (progress <= 0.05) {
      firedRef.current = false;
    }

    const inBand =
      progress >= bandMin &&
      progress <= bandMax &&
      progress > 0.05 &&
      progress < 0.97;

    if (!inBand || firedRef.current) {
      if (!inBand) enteredAtRef.current = null;
      return;
    }

    let raf = 0;

    const tick = (now: number) => {
      const p = progressRef.current;
      const still =
        p >= bandMin &&
        p <= bandMax &&
        p > 0.05 &&
        p < 0.97 &&
        !firedRef.current;

      if (!still) {
        enteredAtRef.current = null;
        return;
      }

      if (enteredAtRef.current === null) {
        enteredAtRef.current = now;
      } else if (now - enteredAtRef.current >= dwellMs) {
        firedRef.current = true;
        enteredAtRef.current = null;
        onUnlockRef.current();
        return;
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [enabled, progress, bandMin, bandMax, dwellMs]);
}
