"use client";

const SILENT = 0.0001;

let sharedCtx: AudioContext | null = null;

async function getAudioContext() {
  if (typeof window === "undefined") return null;
  if (!sharedCtx) sharedCtx = new AudioContext();
  if (sharedCtx.state === "suspended") {
    await sharedCtx.resume();
  }
  return sharedCtx;
}

/**
 * Soft inbound pulse along dendrites (orange travel).
 */
export async function playNeuralPulseSound() {
  const ctx = await getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const master = ctx.createGain();
  master.gain.value = SILENT;
  master.connect(ctx.destination);

  master.gain.setValueAtTime(SILENT, now);
  master.gain.exponentialRampToValueAtTime(0.4, now + 0.04);
  master.gain.exponentialRampToValueAtTime(0.18, now + 0.45);
  master.gain.exponentialRampToValueAtTime(SILENT, now + 1.1);

  const tones = [
    { freq: 420, end: 280, type: "sine" as const, gain: 0.18, delay: 0 },
    { freq: 640, end: 360, type: "triangle" as const, gain: 0.12, delay: 0.04 },
  ];

  for (const tone of tones) {
    const osc = ctx.createOscillator();
    osc.type = tone.type;
    osc.frequency.setValueAtTime(tone.freq, now + tone.delay);
    osc.frequency.exponentialRampToValueAtTime(
      tone.end,
      now + tone.delay + 0.7,
    );
    const g = ctx.createGain();
    g.gain.setValueAtTime(SILENT, now + tone.delay);
    g.gain.exponentialRampToValueAtTime(tone.gain, now + tone.delay + 0.03);
    g.gain.exponentialRampToValueAtTime(SILENT, now + tone.delay + 0.85);
    osc.connect(g);
    g.connect(master);
    osc.start(now + tone.delay);
    osc.stop(now + tone.delay + 0.9);
  }

  const sub = ctx.createOscillator();
  sub.type = "sine";
  sub.frequency.setValueAtTime(90, now);
  sub.frequency.exponentialRampToValueAtTime(55, now + 0.8);
  const subGain = ctx.createGain();
  subGain.gain.setValueAtTime(SILENT, now);
  subGain.gain.exponentialRampToValueAtTime(0.22, now + 0.05);
  subGain.gain.exponentialRampToValueAtTime(SILENT, now + 0.95);
  sub.connect(subGain);
  subGain.connect(master);
  sub.start(now);
  sub.stop(now + 1.0);
}

/**
 * Bright cyan / magenta synapse activation lights.
 */
export async function playNeuralActivationSound() {
  const ctx = await getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const master = ctx.createGain();
  master.gain.value = SILENT;
  master.connect(ctx.destination);

  master.gain.setValueAtTime(SILENT, now);
  master.gain.exponentialRampToValueAtTime(0.55, now + 0.03);
  master.gain.exponentialRampToValueAtTime(0.28, now + 0.5);
  master.gain.exponentialRampToValueAtTime(SILENT, now + 1.65);

  // Crystal sparkle cluster (cyan-ish highs + magenta mid)
  const sparks = [
    { freq: 1180, end: 740, type: "sine" as const, gain: 0.14, delay: 0 },
    { freq: 880, end: 520, type: "triangle" as const, gain: 0.16, delay: 0.03 },
    { freq: 1560, end: 980, type: "sine" as const, gain: 0.1, delay: 0.07 },
    { freq: 620, end: 340, type: "sine" as const, gain: 0.14, delay: 0.1 },
    {
      freq: 2100,
      end: 1200,
      type: "triangle" as const,
      gain: 0.07,
      delay: 0.14,
    },
  ];

  for (const spark of sparks) {
    const osc = ctx.createOscillator();
    osc.type = spark.type;
    osc.frequency.setValueAtTime(spark.freq, now + spark.delay);
    osc.frequency.exponentialRampToValueAtTime(
      spark.end,
      now + spark.delay + 0.55,
    );
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(4800, now + spark.delay);
    filter.frequency.exponentialRampToValueAtTime(900, now + spark.delay + 0.7);
    const g = ctx.createGain();
    g.gain.setValueAtTime(SILENT, now + spark.delay);
    g.gain.exponentialRampToValueAtTime(spark.gain, now + spark.delay + 0.02);
    g.gain.exponentialRampToValueAtTime(
      spark.gain * 0.35,
      now + spark.delay + 0.35,
    );
    g.gain.exponentialRampToValueAtTime(SILENT, now + spark.delay + 0.85);
    osc.connect(filter);
    filter.connect(g);
    g.connect(master);
    osc.start(now + spark.delay);
    osc.stop(now + spark.delay + 0.9);
  }

  // Soft shimmer noise
  const shimmerLen = Math.floor(ctx.sampleRate * 0.7);
  const shimmerBuf = ctx.createBuffer(1, shimmerLen, ctx.sampleRate);
  const data = shimmerBuf.getChannelData(0);
  for (let i = 0; i < shimmerLen; i++) {
    const t = i / shimmerLen;
    const env = Math.exp(-t * 3.5) * (1 - t * 0.4);
    data[i] = (Math.random() * 2 - 1) * env;
  }
  const shimmer = ctx.createBufferSource();
  shimmer.buffer = shimmerBuf;
  const shimmerBp = ctx.createBiquadFilter();
  shimmerBp.type = "bandpass";
  shimmerBp.frequency.setValueAtTime(2400, now);
  shimmerBp.frequency.exponentialRampToValueAtTime(600, now + 0.65);
  shimmerBp.Q.value = 0.9;
  const shimmerGain = ctx.createGain();
  shimmerGain.gain.setValueAtTime(0.16, now);
  shimmerGain.gain.exponentialRampToValueAtTime(SILENT, now + 0.75);
  shimmer.connect(shimmerBp);
  shimmerBp.connect(shimmerGain);
  shimmerGain.connect(master);
  shimmer.start(now);
  shimmer.stop(now + 0.8);

  // Deep body under the lights
  const sub = ctx.createOscillator();
  sub.type = "sine";
  sub.frequency.setValueAtTime(78, now);
  sub.frequency.exponentialRampToValueAtTime(42, now + 1.2);
  const subGain = ctx.createGain();
  subGain.gain.setValueAtTime(SILENT, now);
  subGain.gain.exponentialRampToValueAtTime(0.32, now + 0.06);
  subGain.gain.exponentialRampToValueAtTime(0.12, now + 0.7);
  subGain.gain.exponentialRampToValueAtTime(SILENT, now + 1.45);
  sub.connect(subGain);
  subGain.connect(master);
  sub.start(now);
  sub.stop(now + 1.5);
}
