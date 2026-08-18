"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import Lenis from "lenis";
import { usePathname } from "next/navigation";

import {
  registerGsapPlugins,
  ScrollTrigger,
  gsap,
} from "@/animations/gsap-setup";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

type LenisContextValue = {
  lenis: Lenis | null;
  scrollLocked: boolean;
  setScrollLocked: (locked: boolean) => void;
  scrollTo: (target: string | number | HTMLElement, options?: object) => void;
};

const LenisContext = createContext<LenisContextValue | null>(null);

export function useLenis() {
  const ctx = useContext(LenisContext);
  if (!ctx) {
    throw new Error("useLenis must be used within SmoothScrollProvider");
  }
  return ctx;
}

export function SmoothScrollProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isJoyExhibition = pathname === "/";
  const reducedMotion = useReducedMotion();
  const lenisRef = useRef<Lenis | null>(null);
  const [lenis, setLenis] = useState<Lenis | null>(null);
  const [scrollLocked, setScrollLockedState] = useState(false);

  const setScrollLocked = useCallback((locked: boolean) => {
    setScrollLockedState(locked);
    const instance = lenisRef.current;
    if (!instance) return;
    if (locked) instance.stop();
    else instance.start();
  }, []);

  const scrollTo = useCallback(
    (target: string | number | HTMLElement, options?: object) => {
      const instance = lenisRef.current;
      if (instance) {
        instance.start();
        instance.scrollTo(target, { offset: 0, duration: 1.4, ...options });
        return;
      }
      if (typeof target === "string") {
        document.querySelector(target)?.scrollIntoView({ behavior: "smooth" });
      }
    },
    [],
  );

  useEffect(() => {
    if (isJoyExhibition || reducedMotion) {
      setScrollLockedState(false);
      return;
    }

    // Touch / phone: prefer native scroll — Lenis + gsap.ticker is idle cost
    const coarse =
      typeof window !== "undefined" &&
      (window.matchMedia("(hover: none), (pointer: coarse)").matches ||
        window.matchMedia("(max-width: 768px)").matches);
    if (coarse) {
      setScrollLockedState(false);
      return;
    }

    registerGsapPlugins();

    const instance = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    lenisRef.current = instance;
    setLenis(instance);

    instance.on("scroll", ScrollTrigger.update);

    const ticker = (time: number) => {
      instance.raf(time * 1000);
    };

    gsap.ticker.add(ticker);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(ticker);
      instance.destroy();
      lenisRef.current = null;
      setLenis(null);
    };
  }, [isJoyExhibition, reducedMotion]);

  useEffect(() => {
    if (!lenisRef.current || reducedMotion) return;
    if (scrollLocked) lenisRef.current.stop();
    else lenisRef.current.start();
  }, [scrollLocked, reducedMotion]);

  const value = useMemo(
    () => ({ lenis, scrollLocked, setScrollLocked, scrollTo }),
    [lenis, scrollLocked, setScrollLocked, scrollTo],
  );

  return (
    <LenisContext.Provider value={value}>{children}</LenisContext.Provider>
  );
}
