"use client";

import { useEffect, useState } from "react";

import { motion, AnimatePresence } from "motion/react";

import { BrandMark } from "@/components/common/brand-mark";
import { siteConfig } from "@/config/site";

export function LoadingScreen() {
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let frame = 0;
    let raf = 0;
    const start = performance.now();

    const tick = (now: number) => {
      const elapsed = now - start;
      const next = Math.min(100, Math.floor((elapsed / 1600) * 100));
      setProgress(next);
      if (next < 100) {
        raf = requestAnimationFrame(tick);
      } else {
        frame = window.setTimeout(() => setDone(true), 280);
      }
    };

    raf = requestAnimationFrame(tick);
    document.body.style.overflow = "hidden";

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(frame);
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    if (done) document.body.style.overflow = "";
  }, [done]);

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          className="site-chrome fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#0a0a0a]"
          initial={{ opacity: 1 }}
          exit={{
            opacity: 0,
            filter: "blur(12px)",
            transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
          }}
          aria-live="polite"
          aria-label="Loading"
          role="status"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <BrandMark
              size={120}
              priority
              className="drop-shadow-[0_0_40px_rgba(255,255,255,0.15)]"
            />
          </motion.div>
          <motion.p
            className="mt-8 text-[10px] tracking-[0.4em] text-white/40 uppercase"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25 }}
          >
            {siteConfig.name}
          </motion.p>
          <div className="mt-10 h-px w-40 overflow-hidden bg-white/10 sm:w-52">
            <motion.div
              className="h-full bg-white/70"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="mt-4 font-mono text-[10px] tracking-widest text-white/35">
            {String(progress).padStart(2, "0")}
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
