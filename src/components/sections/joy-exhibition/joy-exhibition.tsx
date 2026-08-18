"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { XpDesktop } from "@/experiences/xp-files/xp-desktop";
import {
  playWindowsXpShutdownSound,
  playWindowsXpStartupSound,
} from "@/lib/windows-xp-startup-sound";
import { useUiStore } from "@/stores/ui-store";
import type { XpFileData } from "@/types/xp-file";

const OPEN_XP_MESSAGE = "mordesu:open-xp";

export function JoyExhibition({ xpFiles }: { xpFiles: XpFileData[] }) {
  const [xpOpen, setXpOpen] = useState(false);
  const xpOpenRef = useRef(false);
  const setXpDesktopOpen = useUiStore((s) => s.setXpDesktopOpen);

  useEffect(() => {
    document.body.dataset.joyExhibition = "true";
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";

    return () => {
      delete document.body.dataset.joyExhibition;
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    xpOpenRef.current = xpOpen;
  }, [xpOpen]);

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type !== OPEN_XP_MESSAGE) return;
      if (xpOpenRef.current) return;

      setXpOpen(true);
      setXpDesktopOpen(true);
      void playWindowsXpStartupSound();
    };

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [setXpDesktopOpen]);

  const handleCloseXp = useCallback(() => {
    void playWindowsXpShutdownSound();
    setXpOpen(false);
    setXpDesktopOpen(false);
  }, [setXpDesktopOpen]);

  return (
    <>
      <iframe
        src="/joy-exhibition/index.html"
        title="The Architecture of Joy"
        className="fixed inset-0 z-[1] block h-dvh w-full border-0 bg-[#F2EFE9]"
      />
      <XpDesktop active={xpOpen} onClose={handleCloseXp} files={xpFiles} />
    </>
  );
}
