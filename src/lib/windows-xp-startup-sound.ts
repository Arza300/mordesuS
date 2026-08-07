"use client";

const STARTUP_SOUND_URL = "/sounds/windows-xp-startup.wav";
const CLICK_SOUND_URL = "/sounds/windows-xp-click.wav";
const SHUTDOWN_SOUND_URL = "/sounds/windows-xp-shutdown.wav";

let startupAudio: HTMLAudioElement | null = null;
let clickAudio: HTMLAudioElement | null = null;
let shutdownAudio: HTMLAudioElement | null = null;
let lastClickAt = 0;

function stopAudio(audio: HTMLAudioElement | null) {
  if (!audio) return;
  audio.pause();
  audio.currentTime = 0;
}

/**
 * Authentic Windows XP startup chime from the bundled WAV.
 */
export async function playWindowsXpStartupSound() {
  if (typeof window === "undefined") return;

  stopAudio(shutdownAudio);

  if (!startupAudio) {
    startupAudio = new Audio(STARTUP_SOUND_URL);
    startupAudio.preload = "auto";
  }

  try {
    startupAudio.pause();
    startupAudio.currentTime = 0;
    startupAudio.volume = 0.22;
    await startupAudio.play();
  } catch {
    // Autoplay may be blocked until a user gesture; caller already runs on open.
  }
}

/**
 * UI click from the bundled mouse-click WAV.
 */
export async function playWindowsXpClickSound() {
  if (typeof window === "undefined") return;

  const nowMs = performance.now();
  if (nowMs - lastClickAt < 50) return;
  lastClickAt = nowMs;

  if (!clickAudio) {
    clickAudio = new Audio(CLICK_SOUND_URL);
    clickAudio.preload = "auto";
  }

  try {
    clickAudio.pause();
    clickAudio.currentTime = 0;
    clickAudio.volume = 0.4;
    await clickAudio.play();
  } catch {
    // Ignore play failures (e.g. interrupted by another click).
  }
}

/**
 * Authentic Windows XP shutdown sound from the bundled WAV.
 */
export async function playWindowsXpShutdownSound() {
  if (typeof window === "undefined") return;

  stopAudio(startupAudio);

  if (!shutdownAudio) {
    shutdownAudio = new Audio(SHUTDOWN_SOUND_URL);
    shutdownAudio.preload = "auto";
  }

  try {
    shutdownAudio.pause();
    shutdownAudio.currentTime = 0;
    shutdownAudio.volume = 0.22;
    await shutdownAudio.play();
  } catch {
    // Ignore play failures.
  }
}
