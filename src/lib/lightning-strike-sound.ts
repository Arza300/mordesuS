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
 * Crack + rumble for Radio Storm lightning strikes.
 */
export async function playLightningStrikeSound() {
  const ctx = await getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const master = ctx.createGain();
  master.gain.value = SILENT;
  master.connect(ctx.destination);

  master.gain.setValueAtTime(SILENT, now);
  master.gain.exponentialRampToValueAtTime(0.7, now + 0.012);
  master.gain.exponentialRampToValueAtTime(0.35, now + 0.12);
  master.gain.exponentialRampToValueAtTime(0.18, now + 0.55);
  master.gain.exponentialRampToValueAtTime(SILENT, now + 1.55);

  // Sharp crack (noise)
  const crackLen = Math.floor(ctx.sampleRate * 0.22);
  const crackBuf = ctx.createBuffer(1, crackLen, ctx.sampleRate);
  const crackData = crackBuf.getChannelData(0);
  for (let i = 0; i < crackLen; i++) {
    const t = i / crackLen;
    const env = Math.exp(-t * 14) * (1 - t * 0.3);
    crackData[i] = (Math.random() * 2 - 1) * env;
  }
  const crack = ctx.createBufferSource();
  crack.buffer = crackBuf;
  const crackHp = ctx.createBiquadFilter();
  crackHp.type = "highpass";
  crackHp.frequency.value = 900;
  const crackBp = ctx.createBiquadFilter();
  crackBp.type = "bandpass";
  crackBp.frequency.value = 2800;
  crackBp.Q.value = 0.8;
  const crackGain = ctx.createGain();
  crackGain.gain.setValueAtTime(0.55, now);
  crackGain.gain.exponentialRampToValueAtTime(SILENT, now + 0.28);
  crack.connect(crackHp);
  crackHp.connect(crackBp);
  crackBp.connect(crackGain);
  crackGain.connect(master);
  crack.start(now);
  crack.stop(now + 0.3);

  // Electric zap tones
  const zaps = [
    { freq: 1800, end: 220, delay: 0, gain: 0.18, dur: 0.22 },
    { freq: 920, end: 140, delay: 0.02, gain: 0.14, dur: 0.28 },
  ];
  for (const zap of zaps) {
    const osc = ctx.createOscillator();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(zap.freq, now + zap.delay);
    osc.frequency.exponentialRampToValueAtTime(
      zap.end,
      now + zap.delay + zap.dur,
    );
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(4200, now + zap.delay);
    filter.frequency.exponentialRampToValueAtTime(
      400,
      now + zap.delay + zap.dur,
    );
    const g = ctx.createGain();
    g.gain.setValueAtTime(SILENT, now + zap.delay);
    g.gain.exponentialRampToValueAtTime(zap.gain, now + zap.delay + 0.008);
    g.gain.exponentialRampToValueAtTime(SILENT, now + zap.delay + zap.dur);
    osc.connect(filter);
    filter.connect(g);
    g.connect(master);
    osc.start(now + zap.delay);
    osc.stop(now + zap.delay + zap.dur + 0.02);
  }

  // Deep thunder rumble after the crack
  const rumble = ctx.createOscillator();
  rumble.type = "sine";
  rumble.frequency.setValueAtTime(55, now + 0.05);
  rumble.frequency.exponentialRampToValueAtTime(32, now + 1.2);
  const rumbleGain = ctx.createGain();
  rumbleGain.gain.setValueAtTime(SILENT, now + 0.05);
  rumbleGain.gain.exponentialRampToValueAtTime(0.48, now + 0.12);
  rumbleGain.gain.exponentialRampToValueAtTime(0.2, now + 0.7);
  rumbleGain.gain.exponentialRampToValueAtTime(SILENT, now + 1.45);
  rumble.connect(rumbleGain);
  rumbleGain.connect(master);
  rumble.start(now + 0.05);
  rumble.stop(now + 1.5);

  const rumble2 = ctx.createOscillator();
  rumble2.type = "triangle";
  rumble2.frequency.setValueAtTime(78, now + 0.08);
  rumble2.frequency.exponentialRampToValueAtTime(40, now + 1.1);
  const rumble2Gain = ctx.createGain();
  rumble2Gain.gain.setValueAtTime(SILENT, now + 0.08);
  rumble2Gain.gain.exponentialRampToValueAtTime(0.22, now + 0.16);
  rumble2Gain.gain.exponentialRampToValueAtTime(SILENT, now + 1.25);
  rumble2.connect(rumble2Gain);
  rumble2Gain.connect(master);
  rumble2.start(now + 0.08);
  rumble2.stop(now + 1.3);

  // Soft low noise body for thunder texture
  const bodyLen = Math.floor(ctx.sampleRate * 1.2);
  const bodyBuf = ctx.createBuffer(1, bodyLen, ctx.sampleRate);
  const bodyData = bodyBuf.getChannelData(0);
  for (let i = 0; i < bodyLen; i++) {
    const t = i / bodyLen;
    const env = Math.exp(-t * 2.2) * (0.4 + 0.6 * (1 - t));
    bodyData[i] = (Math.random() * 2 - 1) * env;
  }
  const body = ctx.createBufferSource();
  body.buffer = bodyBuf;
  const bodyLp = ctx.createBiquadFilter();
  bodyLp.type = "lowpass";
  bodyLp.frequency.setValueAtTime(500, now + 0.06);
  bodyLp.frequency.exponentialRampToValueAtTime(120, now + 1.1);
  const bodyGain = ctx.createGain();
  bodyGain.gain.setValueAtTime(0.22, now + 0.06);
  bodyGain.gain.exponentialRampToValueAtTime(SILENT, now + 1.2);
  body.connect(bodyLp);
  bodyLp.connect(bodyGain);
  bodyGain.connect(master);
  body.start(now + 0.06);
  body.stop(now + 1.25);
}

/**
 * Soft settle / afterglow rumble when a strike finishes and the flash fades.
 */
export async function playLightningEndSound() {
  const ctx = await getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const master = ctx.createGain();
  master.gain.value = SILENT;
  master.connect(ctx.destination);

  master.gain.setValueAtTime(SILENT, now);
  master.gain.exponentialRampToValueAtTime(0.48, now + 0.05);
  master.gain.exponentialRampToValueAtTime(0.22, now + 0.5);
  master.gain.exponentialRampToValueAtTime(SILENT, now + 1.7);

  // Soft flash pop as glow peaks then dies
  const flashLen = Math.floor(ctx.sampleRate * 0.35);
  const flashBuf = ctx.createBuffer(1, flashLen, ctx.sampleRate);
  const flashData = flashBuf.getChannelData(0);
  for (let i = 0; i < flashLen; i++) {
    const t = i / flashLen;
    const env = Math.exp(-t * 6) * (1 - t);
    flashData[i] = (Math.random() * 2 - 1) * env;
  }
  const flash = ctx.createBufferSource();
  flash.buffer = flashBuf;
  const flashFilter = ctx.createBiquadFilter();
  flashFilter.type = "bandpass";
  flashFilter.frequency.setValueAtTime(1600, now);
  flashFilter.frequency.exponentialRampToValueAtTime(280, now + 0.4);
  flashFilter.Q.value = 0.7;
  const flashGain = ctx.createGain();
  flashGain.gain.setValueAtTime(0.28, now);
  flashGain.gain.exponentialRampToValueAtTime(SILENT, now + 0.45);
  flash.connect(flashFilter);
  flashFilter.connect(flashGain);
  flashGain.connect(master);
  flash.start(now);
  flash.stop(now + 0.5);

  // Deep settle rumble
  const sub = ctx.createOscillator();
  sub.type = "sine";
  sub.frequency.setValueAtTime(62, now);
  sub.frequency.exponentialRampToValueAtTime(28, now + 1.4);
  const subGain = ctx.createGain();
  subGain.gain.setValueAtTime(SILENT, now);
  subGain.gain.exponentialRampToValueAtTime(0.42, now + 0.08);
  subGain.gain.exponentialRampToValueAtTime(0.16, now + 0.7);
  subGain.gain.exponentialRampToValueAtTime(SILENT, now + 1.55);
  sub.connect(subGain);
  subGain.connect(master);
  sub.start(now);
  sub.stop(now + 1.6);

  const body = ctx.createOscillator();
  body.type = "triangle";
  body.frequency.setValueAtTime(95, now);
  body.frequency.exponentialRampToValueAtTime(44, now + 1.2);
  const bodyGain = ctx.createGain();
  bodyGain.gain.setValueAtTime(SILENT, now);
  bodyGain.gain.exponentialRampToValueAtTime(0.2, now + 0.1);
  bodyGain.gain.exponentialRampToValueAtTime(SILENT, now + 1.35);
  body.connect(bodyGain);
  bodyGain.connect(master);
  body.start(now);
  body.stop(now + 1.4);

  // Low noise wash as electricity drains
  const washLen = Math.floor(ctx.sampleRate * 1.35);
  const washBuf = ctx.createBuffer(1, washLen, ctx.sampleRate);
  const washData = washBuf.getChannelData(0);
  for (let i = 0; i < washLen; i++) {
    const t = i / washLen;
    const env = Math.exp(-t * 1.8) * (1 - t * 0.5);
    washData[i] = (Math.random() * 2 - 1) * env;
  }
  const wash = ctx.createBufferSource();
  wash.buffer = washBuf;
  const washLp = ctx.createBiquadFilter();
  washLp.type = "lowpass";
  washLp.frequency.setValueAtTime(700, now);
  washLp.frequency.exponentialRampToValueAtTime(90, now + 1.2);
  const washGain = ctx.createGain();
  washGain.gain.setValueAtTime(0.18, now);
  washGain.gain.exponentialRampToValueAtTime(SILENT, now + 1.35);
  wash.connect(washLp);
  washLp.connect(washGain);
  washGain.connect(master);
  wash.start(now);
  wash.stop(now + 1.4);
}
