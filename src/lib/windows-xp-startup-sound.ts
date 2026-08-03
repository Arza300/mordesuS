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
 * Soft ascending chime inspired by classic Windows XP startup.
 */
export async function playWindowsXpStartupSound() {
  const ctx = await getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const master = ctx.createGain();
  master.gain.value = SILENT;
  master.connect(ctx.destination);

  master.gain.setValueAtTime(SILENT, now);
  master.gain.exponentialRampToValueAtTime(0.55, now + 0.08);
  master.gain.exponentialRampToValueAtTime(0.32, now + 1.2);
  master.gain.exponentialRampToValueAtTime(SILENT, now + 3.2);

  // Warm pad under the chime
  const pad = ctx.createOscillator();
  pad.type = "sine";
  pad.frequency.value = 147; // D3
  const padGain = ctx.createGain();
  padGain.gain.setValueAtTime(SILENT, now);
  padGain.gain.exponentialRampToValueAtTime(0.18, now + 0.35);
  padGain.gain.exponentialRampToValueAtTime(SILENT, now + 2.8);
  const padFilter = ctx.createBiquadFilter();
  padFilter.type = "lowpass";
  padFilter.frequency.value = 900;
  pad.connect(padFilter);
  padFilter.connect(padGain);
  padGain.connect(master);
  pad.start(now);
  pad.stop(now + 2.9);

  // Classic-feeling rising chord hits
  const notes = [
    { freq: 294, delay: 0.0, dur: 1.6, gain: 0.22 }, // D4
    { freq: 370, delay: 0.22, dur: 1.55, gain: 0.2 }, // F#4
    { freq: 440, delay: 0.44, dur: 1.7, gain: 0.22 }, // A4
    { freq: 587, delay: 0.72, dur: 2.0, gain: 0.26 }, // D5
  ];

  for (const note of notes) {
    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(note.freq, now + note.delay);

    const shimmer = ctx.createOscillator();
    shimmer.type = "triangle";
    shimmer.frequency.setValueAtTime(note.freq * 2, now + note.delay);

    const g = ctx.createGain();
    g.gain.setValueAtTime(SILENT, now + note.delay);
    g.gain.exponentialRampToValueAtTime(note.gain, now + note.delay + 0.06);
    g.gain.exponentialRampToValueAtTime(
      note.gain * 0.45,
      now + note.delay + 0.55,
    );
    g.gain.exponentialRampToValueAtTime(SILENT, now + note.delay + note.dur);

    const sg = ctx.createGain();
    sg.gain.setValueAtTime(SILENT, now + note.delay);
    sg.gain.exponentialRampToValueAtTime(
      note.gain * 0.12,
      now + note.delay + 0.08,
    );
    sg.gain.exponentialRampToValueAtTime(
      SILENT,
      now + note.delay + note.dur * 0.85,
    );

    osc.connect(g);
    g.connect(master);
    shimmer.connect(sg);
    sg.connect(master);

    osc.start(now + note.delay);
    osc.stop(now + note.delay + note.dur + 0.05);
    shimmer.start(now + note.delay);
    shimmer.stop(now + note.delay + note.dur + 0.05);
  }
}
