"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { gsap } from "@/animations/gsap-setup";

type UseHoldInteractionOptions = {
  duration?: number;
  /** how fast the bar empties on release */
  releaseDuration?: number;
  disabled?: boolean;
  onComplete?: () => void;
};

export function useHoldInteraction({
  duration = 1.15,
  releaseDuration = 0.5,
  disabled = false,
  onComplete,
}: UseHoldInteractionOptions = {}) {
  const [progress, setProgress] = useState(0);
  const [holding, setHolding] = useState(false);
  const [completed, setCompleted] = useState(false);
  const tweenRef = useRef<gsap.core.Tween | null>(null);
  const progressObj = useRef({ value: 0 });
  const holdingRef = useRef(false);
  const firedCompleteRef = useRef(false);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const syncProgress = useCallback(() => {
    setProgress(progressObj.current.value);
  }, []);

  const killTween = useCallback(() => {
    tweenRef.current?.kill();
    tweenRef.current = null;
  }, []);

  const startHold = useCallback(() => {
    if (disabled) return;
    // Allow restart even if a release tween is running
    holdingRef.current = true;
    firedCompleteRef.current = false;
    setHolding(true);
    setCompleted(false);
    killTween();

    const remaining = Math.max(0, 1 - progressObj.current.value);
    tweenRef.current = gsap.to(progressObj.current, {
      value: 1,
      duration: Math.max(0.05, duration * remaining),
      ease: "none",
      onUpdate: syncProgress,
      onComplete: () => {
        progressObj.current.value = 1;
        setProgress(1);
        setCompleted(true);
        if (!firedCompleteRef.current) {
          firedCompleteRef.current = true;
          onCompleteRef.current?.();
        }
      },
    });
  }, [disabled, duration, killTween, syncProgress]);

  const endHold = useCallback(() => {
    if (!holdingRef.current && progressObj.current.value <= 0.001) {
      progressObj.current.value = 0;
      setProgress(0);
      return;
    }

    holdingRef.current = false;
    setHolding(false);
    setCompleted(false);
    firedCompleteRef.current = false;
    killTween();

    const current = progressObj.current.value;
    tweenRef.current = gsap.to(progressObj.current, {
      value: 0,
      duration: Math.max(0.08, releaseDuration * current),
      ease: "power2.out",
      onUpdate: syncProgress,
      onComplete: () => {
        progressObj.current.value = 0;
        setProgress(0);
      },
    });
  }, [killTween, releaseDuration, syncProgress]);

  const reset = useCallback(() => {
    killTween();
    holdingRef.current = false;
    firedCompleteRef.current = false;
    progressObj.current.value = 0;
    setProgress(0);
    setHolding(false);
    setCompleted(false);
  }, [killTween]);

  useEffect(() => () => killTween(), [killTween]);

  return {
    progress,
    holding,
    completed,
    startHold,
    endHold,
    reset,
  };
}
