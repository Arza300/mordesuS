"use client";

import { useEffect, useState } from "react";

export type MousePosition = {
  x: number;
  y: number;
  normalizedX: number;
  normalizedY: number;
};

export function useMousePosition(): MousePosition {
  const [pos, setPos] = useState<MousePosition>({
    x: 0,
    y: 0,
    normalizedX: 0,
    normalizedY: 0,
  });

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const w = window.innerWidth || 1;
      const h = window.innerHeight || 1;
      setPos({
        x: e.clientX,
        y: e.clientY,
        normalizedX: (e.clientX / w) * 2 - 1,
        normalizedY: (e.clientY / h) * 2 - 1,
      });
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  return pos;
}
