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
 * One-shot shatter / explode burst for “View all projects” logo disperse.
 */
export async function playLogoExplodeSound() {
  const ctx = await getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const master = ctx.createGain();
  master.gain.value = SILENT;
  master.connect(ctx.destination);

  // Longer body: impact → sustain → long tail
  master.gain.setValueAtTime(SILENT, now);
  master.gain.exponentialRampToValueAtTime(0.62, now + 0.06);
  master.gain.exponentialRampToValueAtTime(0.38, now + 0.45);
  master.gain.exponentialRampToValueAtTime(0.16, now + 1.1);
  master.gain.exponentialRampToValueAtTime(SILENT, now + 2.0);

  // Deep sub thump
  const sub = ctx.createOscillator();
  sub.type = "sine";
  sub.frequency.setValueAtTime(72, now);
  sub.frequency.exponentialRampToValueAtTime(32, now + 1.2);
  const subGain = ctx.createGain();
  subGain.gain.setValueAtTime(SILENT, now);
  subGain.gain.exponentialRampToValueAtTime(0.55, now + 0.04);
  subGain.gain.exponentialRampToValueAtTime(0.28, now + 0.4);
  subGain.gain.exponentialRampToValueAtTime(0.1, now + 1.0);
  subGain.gain.exponentialRampToValueAtTime(SILENT, now + 1.7);
  sub.connect(subGain);
  subGain.connect(master);
  sub.start(now);
  sub.stop(now + 1.75);

  // Low body boom
  const boom = ctx.createOscillator();
  boom.type = "triangle";
  boom.frequency.setValueAtTime(110, now);
  boom.frequency.exponentialRampToValueAtTime(42, now + 1.3);
  const boomGain = ctx.createGain();
  boomGain.gain.setValueAtTime(SILENT, now);
  boomGain.gain.exponentialRampToValueAtTime(0.32, now + 0.05);
  boomGain.gain.exponentialRampToValueAtTime(0.14, now + 0.7);
  boomGain.gain.exponentialRampToValueAtTime(SILENT, now + 1.6);
  boom.connect(boomGain);
  boomGain.connect(master);
  boom.start(now);
  boom.stop(now + 1.65);

  // Filtered noise — longer decay trail
  const noiseBuffer = ctx.createBuffer(
    1,
    Math.floor(ctx.sampleRate * 1.4),
    ctx.sampleRate,
  );
  const data = noiseBuffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) {
    const env = 1 - i / data.length;
    data[i] = (Math.random() * 2 - 1) * env * env;
  }
  const noise = ctx.createBufferSource();
  noise.buffer = noiseBuffer;
  const noiseFilter = ctx.createBiquadFilter();
  noiseFilter.type = "lowpass";
  noiseFilter.frequency.value = 900;
  noiseFilter.Q.value = 0.6;
  const noiseGain = ctx.createGain();
  noise.connect(noiseFilter);
  noiseFilter.connect(noiseGain);
  noiseGain.connect(master);
  noiseFilter.frequency.setValueAtTime(1200, now);
  noiseFilter.frequency.exponentialRampToValueAtTime(140, now + 1.2);
  noiseGain.gain.setValueAtTime(0.28, now);
  noiseGain.gain.exponentialRampToValueAtTime(0.12, now + 0.5);
  noiseGain.gain.exponentialRampToValueAtTime(SILENT, now + 1.35);
  noise.start(now);
  noise.stop(now + 1.4);

  // Descending mid tones — linger into the tail
  const tones = [
    { freq: 280, type: "sine" as const, gain: 0.2, delay: 0.02, dur: 1.5 },
    {
      freq: 160,
      type: "triangle" as const,
      gain: 0.16,
      delay: 0.08,
      dur: 1.65,
    },
    { freq: 95, type: "sine" as const, gain: 0.22, delay: 0.14, dur: 1.8 },
  ];

  for (const tone of tones) {
    const osc = ctx.createOscillator();
    osc.type = tone.type;
    osc.frequency.setValueAtTime(tone.freq, now + tone.delay);
    osc.frequency.exponentialRampToValueAtTime(
      Math.max(36, tone.freq * 0.28),
      now + tone.delay + tone.dur * 0.85,
    );
    const g = ctx.createGain();
    g.gain.setValueAtTime(SILENT, now + tone.delay);
    g.gain.exponentialRampToValueAtTime(tone.gain, now + tone.delay + 0.04);
    g.gain.exponentialRampToValueAtTime(
      tone.gain * 0.45,
      now + tone.delay + tone.dur * 0.45,
    );
    g.gain.exponentialRampToValueAtTime(SILENT, now + tone.delay + tone.dur);
    osc.connect(g);
    g.connect(master);
    osc.start(now + tone.delay);
    osc.stop(now + tone.delay + tone.dur + 0.05);
  }
}

/**
 * One-shot gather / reassemble for closing All Projects (logo comes back).
 */
export async function playLogoReassembleSound() {
  const ctx = await getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const master = ctx.createGain();
  master.gain.value = SILENT;
  master.connect(ctx.destination);

  master.gain.setValueAtTime(SILENT, now);
  master.gain.exponentialRampToValueAtTime(0.52, now + 0.12);
  master.gain.exponentialRampToValueAtTime(0.34, now + 0.7);
  master.gain.exponentialRampToValueAtTime(0.14, now + 1.35);
  master.gain.exponentialRampToValueAtTime(SILENT, now + 2.05);

  // Sub rises into place then settles
  const sub = ctx.createOscillator();
  sub.type = "sine";
  sub.frequency.setValueAtTime(36, now);
  sub.frequency.exponentialRampToValueAtTime(68, now + 0.9);
  sub.frequency.exponentialRampToValueAtTime(55, now + 1.6);
  const subGain = ctx.createGain();
  subGain.gain.setValueAtTime(SILENT, now);
  subGain.gain.exponentialRampToValueAtTime(0.5, now + 0.1);
  subGain.gain.exponentialRampToValueAtTime(0.22, now + 1.0);
  subGain.gain.exponentialRampToValueAtTime(SILENT, now + 1.85);
  sub.connect(subGain);
  subGain.connect(master);
  sub.start(now);
  sub.stop(now + 1.9);

  // Soft body that resolves upward
  const boom = ctx.createOscillator();
  boom.type = "triangle";
  boom.frequency.setValueAtTime(48, now);
  boom.frequency.exponentialRampToValueAtTime(98, now + 1.1);
  const boomGain = ctx.createGain();
  boomGain.gain.setValueAtTime(SILENT, now);
  boomGain.gain.exponentialRampToValueAtTime(0.28, now + 0.12);
  boomGain.gain.exponentialRampToValueAtTime(0.12, now + 0.9);
  boomGain.gain.exponentialRampToValueAtTime(SILENT, now + 1.7);
  boom.connect(boomGain);
  boomGain.connect(master);
  boom.start(now);
  boom.stop(now + 1.75);

  // Soft grit that closes / darkens as pieces lock
  const noiseBuffer = ctx.createBuffer(
    1,
    Math.floor(ctx.sampleRate * 1.35),
    ctx.sampleRate,
  );
  const data = noiseBuffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) {
    const env = 1 - i / data.length;
    data[i] = (Math.random() * 2 - 1) * env * env * 0.85;
  }
  const noise = ctx.createBufferSource();
  noise.buffer = noiseBuffer;
  const noiseFilter = ctx.createBiquadFilter();
  noiseFilter.type = "lowpass";
  noiseFilter.Q.value = 0.55;
  const noiseGain = ctx.createGain();
  noise.connect(noiseFilter);
  noiseFilter.connect(noiseGain);
  noiseGain.connect(master);
  noiseFilter.frequency.setValueAtTime(220, now);
  noiseFilter.frequency.exponentialRampToValueAtTime(700, now + 0.7);
  noiseFilter.frequency.exponentialRampToValueAtTime(160, now + 1.25);
  noiseGain.gain.setValueAtTime(0.18, now);
  noiseGain.gain.exponentialRampToValueAtTime(0.1, now + 0.55);
  noiseGain.gain.exponentialRampToValueAtTime(SILENT, now + 1.3);
  noise.start(now);
  noise.stop(now + 1.35);

  // Ascending tones — pieces locking in
  const tones = [
    {
      freqFrom: 55,
      freqTo: 120,
      type: "sine" as const,
      gain: 0.2,
      delay: 0.05,
      dur: 1.55,
    },
    {
      freqFrom: 80,
      freqTo: 175,
      type: "triangle" as const,
      gain: 0.15,
      delay: 0.14,
      dur: 1.65,
    },
    {
      freqFrom: 110,
      freqTo: 240,
      type: "sine" as const,
      gain: 0.14,
      delay: 0.26,
      dur: 1.75,
    },
  ];

  for (const tone of tones) {
    const osc = ctx.createOscillator();
    osc.type = tone.type;
    osc.frequency.setValueAtTime(tone.freqFrom, now + tone.delay);
    osc.frequency.exponentialRampToValueAtTime(
      tone.freqTo,
      now + tone.delay + tone.dur * 0.7,
    );
    const g = ctx.createGain();
    g.gain.setValueAtTime(SILENT, now + tone.delay);
    g.gain.exponentialRampToValueAtTime(tone.gain, now + tone.delay + 0.08);
    g.gain.exponentialRampToValueAtTime(
      tone.gain * 0.5,
      now + tone.delay + tone.dur * 0.5,
    );
    g.gain.exponentialRampToValueAtTime(SILENT, now + tone.delay + tone.dur);
    osc.connect(g);
    g.connect(master);
    osc.start(now + tone.delay);
    osc.stop(now + tone.delay + tone.dur + 0.05);
  }
}
