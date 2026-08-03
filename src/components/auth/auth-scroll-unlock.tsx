"use client";

import { useEffect } from "react";

import { useLenis } from "@/providers/smooth-scroll-provider";

/**
 * Auth pages must not inherit the hero scroll lock.
 */
export function AuthScrollUnlock() {
  const { setScrollLocked } = useLenis();

  useEffect(() => {
    document.documentElement.dataset.scrollGate = "open";
    document.body.style.overflow = "";
    setScrollLocked(false);
  }, [setScrollLocked]);

  return null;
}
