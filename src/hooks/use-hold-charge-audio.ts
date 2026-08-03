"use client";

import { useEffect, useRef } from "react";

type UseHoldChargeAudioOptions = {
  /** 0–1 charge progress */
  progress: number;
  holding: boolean;
  /** Mute while overlay / experiences block hold */
  disabled?: boolean;
};

const SILENT = 0.0001;
/** Soft headphone-friendly fade-in when hold starts */
const FADE_IN_SEC = 0.35;
/** Soft fade-out when settled */
const FADE_OUT_SEC = 0.45;

/**
 * Clean charge / reassemble tone with a long fade-in for comfortable listening.
 */
export function useHoldChargeAudio({
  progress,
  holding,
  disabled = false,
}: UseHoldChargeAudioOptions) {
  const ctxRef = useRef<AudioContext | null>(null);
  const masterRef = useRef<GainNode | null>(null);
  const oscLowRef = useRef<OscillatorNode | null>(null);
  const oscMidRef = useRef<OscillatorNode | null>(null);
  const oscHighRef = useRef<OscillatorNode | null>(null);
  const highGainRef = useRef<GainNode | null>(null);
  const filterRef = useRef<BiquadFilterNode | null>(null);
  const startedRef = useRef(false);
  const wasHoldingRef = useRef(false);
  const attackUntilRef = useRef(0);

  const ensureGraph = async () => {
    if (typeof window === "undefined") return null;

    let ctx = ctxRef.current;
    if (!ctx) {
      ctx = new AudioContext();
      ctxRef.current = ctx;
    }

    if (ctx.state === "suspended") {
      await ctx.resume();
    }

    if (startedRef.current && masterRef.current) {
      return ctx;
    }

    const master = ctx.createGain();
    master.gain.value = SILENT;
    master.connect(ctx.destination);
    masterRef.current = master;

    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 900;
    filter.Q.value = 0.35;
    filter.connect(master);
    filterRef.current = filter;

    const t0 = ctx.currentTime + 0.03;

    const oscLow = ctx.createOscillator();
    oscLow.type = "sine";
    oscLow.frequency.value = 90;
    const lowGain = ctx.createGain();
    lowGain.gain.value = 0.24;
    oscLow.connect(lowGain);
    lowGain.connect(filter);
    oscLow.start(t0);
    oscLowRef.current = oscLow;

    const oscMid = ctx.createOscillator();
    oscMid.type = "triangle";
    oscMid.frequency.value = 135;
    const midGain = ctx.createGain();
    midGain.gain.value = 0.18;
    oscMid.connect(midGain);
    midGain.connect(filter);
    oscMid.start(t0);
    oscMidRef.current = oscMid;

    const oscHigh = ctx.createOscillator();
    oscHigh.type = "sine";
    oscHigh.frequency.value = 270;
    const highGain = ctx.createGain();
    highGain.gain.value = 0.05;
    oscHigh.connect(highGain);
    highGain.connect(master);
    oscHigh.start(t0);
    oscHighRef.current = oscHigh;
    highGainRef.current = highGain;

    startedRef.current = true;
    return ctx;
  };

  const fadeGain = (
    node: GainNode,
    ctx: AudioContext,
    target: number,
    duration: number,
  ) => {
    const param = node.gain;
    const now = ctx.currentTime;
    const from = Math.max(param.value, SILENT);
    const to = Math.max(target, SILENT);
    param.cancelScheduledValues(now);
    param.setValueAtTime(from, now);
    param.exponentialRampToValueAtTime(to, now + Math.max(0.08, duration));
  };

  useEffect(() => {
    if (!disabled) return;

    const ctx = ctxRef.current;
    const master = masterRef.current;
    if (!ctx || !master || !startedRef.current) return;

    wasHoldingRef.current = false;
    attackUntilRef.current = 0;
    fadeGain(master, ctx, SILENT, 0.1);
    if (highGainRef.current) {
      fadeGain(highGainRef.current, ctx, SILENT, 0.1);
    }
  }, [disabled]);

  useEffect(() => {
    if (disabled) return;

    let cancelled = false;

    const run = async () => {
      const ctx = await ensureGraph();
      if (!ctx || cancelled || !masterRef.current) return;

      if (holding) {
        wasHoldingRef.current = true;
        attackUntilRef.current = ctx.currentTime + FADE_IN_SEC;
        // Long smooth fade-in for headphones
        fadeGain(masterRef.current, ctx, 0.36, FADE_IN_SEC);
        if (highGainRef.current) {
          fadeGain(highGainRef.current, ctx, 0.055, FADE_IN_SEC * 0.9);
        }
        return;
      }

      if (wasHoldingRef.current && progress > 0.02) {
        attackUntilRef.current = 0;
        fadeGain(masterRef.current, ctx, 0.32, 0.28);
        if (highGainRef.current) {
          fadeGain(highGainRef.current, ctx, 0.08, 0.28);
        }
      }
    };

    void run();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [holding, disabled]);

  useEffect(() => {
    const ctx = ctxRef.current;
    if (!ctx || !startedRef.current || !masterRef.current) return;
    if (disabled) return;

    const t = Math.max(0, Math.min(1, progress));
    const now = ctx.currentTime;
    const reassembling = !holding && t > 0.001 && wasHoldingRef.current;
    const tau = 0.16;

    if (holding) {
      oscLowRef.current?.frequency.setTargetAtTime(85 + t * 45, now, tau);
      oscMidRef.current?.frequency.setTargetAtTime(128 + t * 70, now, tau);
      oscHighRef.current?.frequency.setTargetAtTime(256 + t * 90, now, tau);
      filterRef.current?.frequency.setTargetAtTime(780 + t * 520, now, tau);

      // Don't fight the fade-in — only follow progress after attack finishes
      if (now >= attackUntilRef.current) {
        masterRef.current.gain.setTargetAtTime(
          Math.max(0.2 + t * 0.24, SILENT),
          now,
          0.2,
        );
      }
      return;
    }

    if (reassembling) {
      oscLowRef.current?.frequency.setTargetAtTime(80 + t * 35, now, tau);
      oscMidRef.current?.frequency.setTargetAtTime(118 + t * 55, now, tau);
      oscHighRef.current?.frequency.setTargetAtTime(220 + t * 80, now, tau);
      filterRef.current?.frequency.setTargetAtTime(700 + t * 400, now, tau);
      masterRef.current.gain.setTargetAtTime(
        Math.max(0.08 + t * 0.24, SILENT),
        now,
        0.16,
      );
      return;
    }

    if (!holding && t <= 0.001 && wasHoldingRef.current) {
      wasHoldingRef.current = false;
      attackUntilRef.current = 0;
      fadeGain(masterRef.current, ctx, SILENT, FADE_OUT_SEC);
    }
  }, [progress, holding, disabled]);

  useEffect(() => {
    return () => {
      try {
        const ctx = ctxRef.current;
        const master = masterRef.current;
        if (ctx && master) {
          const now = ctx.currentTime;
          master.gain.cancelScheduledValues(now);
          master.gain.setValueAtTime(Math.max(master.gain.value, SILENT), now);
          master.gain.exponentialRampToValueAtTime(SILENT, now + 0.1);
        }
        oscLowRef.current?.stop();
        oscMidRef.current?.stop();
        oscHighRef.current?.stop();
        void ctxRef.current?.close();
      } catch {
        /* ignore */
      }
      startedRef.current = false;
      ctxRef.current = null;
      masterRef.current = null;
    };
  }, []);
}
