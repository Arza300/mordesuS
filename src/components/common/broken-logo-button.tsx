"use client";

import { useEffect, useRef, useState } from "react";

import {
  motion,
  useAnimationFrame,
  useMotionTemplate,
  useMotionValue,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react";

import { LOGO_SHARDS, type LogoShard } from "@/components/projects/logo-shards";
import { cn } from "@/lib/utils";
import { useIsTouchDevice } from "@/hooks/use-media-query";

type BrokenLogoButtonProps = {
  progress?: number;
  holding?: boolean;
  mouseX?: number;
  mouseY?: number;
  dispersed?: boolean;
  /** First N shards hide instantly when morph layer takes over */
  morphFadeCount?: number;
  /** First N shards stay put until morph targets are ready */
  morphHoldCount?: number;
  /** Gentler explode when opening projects (remaining shards only) */
  softMorphExplode?: boolean;
  className?: string;
};

const IDLE_FILTER = "drop-shadow(0 0 14px rgba(255,255,255,0.35))";

export function BrokenLogoButton({
  progress = 0,
  holding = false,
  mouseX = 0,
  mouseY = 0,
  dispersed = false,
  morphFadeCount = 0,
  morphHoldCount = 0,
  softMorphExplode = false,
  className,
}: BrokenLogoButtonProps) {
  const lite = useIsTouchDevice();
  const charge = progress * progress;
  const gap = 0.35 + progress * 1.15 + charge * 0.85;

  const mx = useSpring(0, { stiffness: 140, damping: 22, mass: 0.4 });
  const my = useSpring(0, { stiffness: 140, damping: 22, mass: 0.4 });
  const shakeX = useMotionValue(0);
  const shakeY = useMotionValue(0);
  const skewX = useMotionValue(0);

  const [glowEpoch, setGlowEpoch] = useState(0);
  const wasDispersed = useRef(false);
  const shakeSkip = useRef(0);

  useEffect(() => {
    mx.set(dispersed ? 0 : mouseX);
    my.set(dispersed ? 0 : mouseY);
  }, [mouseX, mouseY, dispersed, mx, my]);

  useEffect(() => {
    if (wasDispersed.current && !dispersed) {
      setGlowEpoch((n) => n + 1);
    }
    wasDispersed.current = dispersed;
  }, [dispersed]);

  useAnimationFrame((t) => {
    if (
      softMorphExplode ||
      (!holding && !dispersed) ||
      (progress < 0.02 && !dispersed)
    ) {
      shakeX.set(0);
      shakeY.set(0);
      skewX.set(0);
      return;
    }

    if (lite) {
      shakeSkip.current ^= 1;
      if (shakeSkip.current) return;
    }

    const amp = dispersed ? (lite ? 12 : 22) : charge * 14 + progress * 4;
    const tear =
      Math.sin(t * (dispersed ? 0.08 : 0.037)) > (dispersed ? 0.55 : 0.88) ||
      Math.random() < (dispersed ? 0.35 : 0.04 + charge * 0.08);
    const burst = tear ? (dispersed ? 3.4 : 2.8 + progress * 2) : 1;

    shakeX.set((Math.random() - 0.5) * amp * burst);
    shakeY.set((Math.random() - 0.5) * amp * 0.4 * burst);
    skewX.set(
      tear
        ? (Math.random() - 0.5) * (dispersed ? 18 : progress * 8)
        : (Math.random() - 0.5) * (dispersed ? 4 : progress * 1.5),
    );
  });

  const rotateY = useTransform(mx, [-1, 1], [-16, 16]);
  const rotateX = useTransform(my, [-1, 1], [14, -14]);
  const glowX = useTransform(mx, [-1, 1], ["28%", "72%"]);
  const glowY = useTransform(my, [-1, 1], ["28%", "72%"]);
  const glowBg = useMotionTemplate`radial-gradient(circle at ${glowX} ${glowY}, rgba(168,85,247,0.35) 0%, rgba(255,255,255,0.08) 40%, transparent 70%)`;

  const showGlitchFx = dispersed || (holding && progress > 0.04);

  return (
    <motion.div
      className={cn(
        "relative aspect-[1024/846] w-[min(78vw,360px)] sm:w-[min(62vw,440px)] md:w-[480px]",
        className,
      )}
      style={{
        rotateX: dispersed ? 0 : rotateX,
        rotateY: dispersed ? 0 : rotateY,
        x: holding || dispersed ? shakeX : 0,
        y: holding || dispersed ? shakeY : 0,
        skewX: holding || dispersed ? skewX : 0,
        transformStyle: "preserve-3d",
        transformPerspective: 1100,
        pointerEvents: dispersed ? "none" : undefined,
      }}
      aria-hidden
    >
      {showGlitchFx && !lite ? (
        <svg width="0" height="0" className="absolute" aria-hidden>
          <defs>
            <filter id="mordesu-glitch-red">
              <feColorMatrix
                type="matrix"
                values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0"
              />
            </filter>
            <filter id="mordesu-glitch-cyan">
              <feColorMatrix
                type="matrix"
                values="0 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1 0"
              />
            </filter>
          </defs>
        </svg>
      ) : null}

      <motion.div
        key={`glow-${glowEpoch}`}
        className="pointer-events-none absolute inset-[-25%] rounded-full blur-3xl"
        initial={{ opacity: 0.55, scale: 1 }}
        animate={{
          opacity: dispersed
            ? softMorphExplode
              ? [0.5, 0.2, 0]
              : [0.9, 0.4, 0]
            : 0.55 + (holding ? progress * 0.45 : 0),
          scale: dispersed
            ? softMorphExplode
              ? [1.1, 1.4, 1.6]
              : [1.4, 2.6, 3.2]
            : 1 + (holding ? progress * 0.55 + charge * 0.35 : 0),
        }}
        transition={
          dispersed
            ? {
                duration: softMorphExplode ? 0.9 : 0.7,
                times: [0, 0.35, 1],
                ease: "easeOut",
              }
            : { duration: 0.55, ease: [0.22, 1, 0.36, 1] }
        }
        style={{ background: glowBg }}
      />

      {/* Soften/suppress flash when projects morph owns the shards */}
      <motion.div
        className="pointer-events-none absolute inset-[-10%] z-[25] mix-blend-screen"
        initial={false}
        animate={
          dispersed && !softMorphExplode
            ? {
                opacity: [0, 0.85, 0.35, 0],
                scaleX: [1, 1.4, 1.8],
                scaleY: [1, 0.6, 1.2],
              }
            : { opacity: 0, scaleX: 1, scaleY: 1 }
        }
        transition={{
          duration: 0.45,
          times: [0, 0.12, 0.35, 1],
          ease: "easeOut",
        }}
        style={{
          background:
            "radial-gradient(circle at 50% 45%, rgba(255,255,255,0.9) 0%, rgba(168,85,247,0.45) 35%, transparent 70%)",
        }}
      />

      {showGlitchFx && !lite && !softMorphExplode ? (
        <>
          <ChromaticGhost
            progress={dispersed ? 1 : progress}
            charge={dispersed ? 1 : charge}
            channel="r"
            gap={gap}
            dispersed={dispersed}
          />
          <ChromaticGhost
            progress={dispersed ? 1 : progress}
            charge={dispersed ? 1 : charge}
            channel="c"
            gap={gap}
            dispersed={dispersed}
          />
        </>
      ) : null}

      {LOGO_SHARDS.map((shard, i) => (
        <ShardPiece
          key={shard.id}
          shard={shard}
          index={i}
          gap={gap}
          progress={progress}
          charge={charge}
          dispersed={dispersed && i >= morphHoldCount}
          holding={holding}
          lite={lite}
          morphHide={dispersed && i < morphFadeCount}
          softMorphExplode={softMorphExplode}
          mx={mx}
          my={my}
        />
      ))}

      {showGlitchFx &&
      !lite &&
      !softMorphExplode &&
      (dispersed || progress > 0.1) ? (
        <GlitchSlices
          progress={dispersed ? 1 : progress}
          charge={dispersed ? 1 : charge}
          dispersed={dispersed}
        />
      ) : null}
    </motion.div>
  );
}

function ChromaticGhost({
  progress,
  charge,
  channel,
  gap,
  dispersed,
}: {
  progress: number;
  charge: number;
  channel: "r" | "c";
  gap: number;
  dispersed: boolean;
}) {
  const dir = channel === "r" ? -1 : 1;
  const split = (6 + progress * 18 + charge * 22) * dir * (dispersed ? 2.4 : 1);

  return (
    <motion.div
      className="pointer-events-none absolute inset-0 z-[5] mix-blend-screen"
      style={{
        filter:
          channel === "r"
            ? "url(#mordesu-glitch-red)"
            : "url(#mordesu-glitch-cyan)",
      }}
      initial={false}
      animate={
        dispersed
          ? {
              x: [split * 0.4, split * 1.8, split * 3.2],
              y: [0, dir * 24, dir * 80],
              opacity: [0.55, 0.4, 0],
              skewX: [dir * 8, dir * -16, dir * 4],
            }
          : {
              x: split,
              y: dir * progress * 3,
              opacity: 0.14 + progress * 0.3 + charge * 0.22,
              skewX: 0,
            }
      }
      transition={
        dispersed
          ? { duration: 0.55, times: [0, 0.35, 1], ease: [0.2, 0.8, 0.2, 1] }
          : { duration: 0.15 }
      }
      aria-hidden
    >
      {LOGO_SHARDS.map((shard) => (
        <div
          key={`${channel}-${shard.id}`}
          className="absolute inset-0"
          style={{
            clipPath: shard.clip,
            WebkitClipPath: shard.clip,
            transform: `translate3d(${shard.x * gap * 0.85}px, ${shard.y * gap * 0.85}px, 0) rotate(${shard.rotate * (0.4 + progress)}deg)`,
          }}
        >
          <img
            src="/brand/logo.png"
            alt=""
            draggable={false}
            className="h-full w-full object-contain select-none"
            style={{
              mixBlendMode: "screen",
              opacity: channel === "r" ? 0.9 : 0.8,
            }}
          />
        </div>
      ))}
    </motion.div>
  );
}

function GlitchSlices({
  progress,
  charge,
  dispersed,
}: {
  progress: number;
  charge: number;
  dispersed: boolean;
}) {
  const [slices, setSlices] = useState<
    { key: number; top: number; height: number; x: number; opacity: number }[]
  >([]);

  useAnimationFrame((t) => {
    const shouldBurst = dispersed
      ? Math.random() < 0.45
      : Math.sin(t * 0.028) > 0.82 || Math.random() < 0.025 + charge * 0.09;
    if (!shouldBurst) return;

    const count = dispersed
      ? 5 + Math.floor(Math.random() * 4)
      : 2 + Math.floor(progress * 4);
    setSlices(
      Array.from({ length: count }, (_, i) => ({
        key: Math.floor(t) * 10 + i,
        top: 8 + Math.random() * 84,
        height: 3 + Math.random() * (5 + charge * (dispersed ? 18 : 12)),
        x: (Math.random() - 0.5) * (20 + progress * (dispersed ? 140 : 72)),
        opacity: 0.35 + Math.random() * 0.55 * progress,
      })),
    );
  });

  return (
    <motion.div
      className="pointer-events-none absolute inset-0 z-20 overflow-hidden"
      animate={dispersed ? { opacity: [1, 0.7, 0] } : { opacity: 1 }}
      transition={dispersed ? { duration: 0.55, ease: "easeOut" } : undefined}
      aria-hidden
    >
      {slices.map((s) => (
        <div
          key={s.key}
          className="absolute left-[-8%] w-[116%] overflow-hidden"
          style={{
            top: `${s.top}%`,
            height: s.height,
            transform: `translateX(${s.x}px)`,
            opacity: s.opacity,
          }}
        >
          <div
            className="absolute inset-x-0"
            style={{
              top: 0,
              height: `${10000 / Math.max(s.height, 1)}%`,
              transform: `translateY(-${s.top}%)`,
            }}
          >
            <img
              src="/brand/logo.png"
              alt=""
              draggable={false}
              className="h-full w-full object-contain mix-blend-screen select-none"
            />
          </div>
        </div>
      ))}
    </motion.div>
  );
}

function ShardPiece({
  shard,
  index,
  gap,
  progress,
  charge,
  dispersed,
  holding,
  lite = false,
  morphHide = false,
  softMorphExplode = false,
  mx,
  my,
}: {
  shard: LogoShard;
  index: number;
  gap: number;
  progress: number;
  charge: number;
  dispersed: boolean;
  holding: boolean;
  lite?: boolean;
  morphHide?: boolean;
  softMorphExplode?: boolean;
  mx: MotionValue<number>;
  my: MotionValue<number>;
}) {
  const strength = 22 * shard.depth;
  const jitterX = useMotionValue(0);
  const jitterY = useMotionValue(0);
  const glitchSkew = useMotionValue(0);
  const frameSkip = useRef(0);

  useAnimationFrame((t) => {
    if (
      morphHide ||
      (!holding && !dispersed) ||
      (!dispersed && progress < 0.03)
    ) {
      jitterX.set(0);
      jitterY.set(0);
      glitchSkew.set(0);
      return;
    }

    if (lite) {
      frameSkip.current ^= 1;
      if (frameSkip.current) return;
    }

    if (dispersed) {
      if (softMorphExplode) {
        jitterX.set(0);
        jitterY.set(0);
        glitchSkew.set(0);
        return;
      }
      const amp = (lite ? 5 : 10) * shard.depth;
      jitterX.set((Math.random() - 0.5) * amp);
      jitterY.set((Math.random() - 0.5) * amp * 0.4);
      glitchSkew.set((Math.random() - 0.5) * (lite ? 4 : 10));
      return;
    }

    const phase = t * 0.001 + index * 1.7;
    const amp = (4 + charge * 22) * shard.depth;
    const tear = Math.sin(phase * 9 + t * 0.02) > 0.9;
    const spike = tear || Math.random() < 0.035 + charge * 0.09;

    jitterX.set(
      Math.sin(phase * 13) * amp * 0.35 +
        (spike
          ? (Math.random() - 0.5) * amp * 2.4
          : (Math.random() - 0.5) * amp * 0.5),
    );
    jitterY.set(
      Math.cos(phase * 11) * amp * 0.2 +
        (spike
          ? (Math.random() - 0.5) * amp * 1.2
          : (Math.random() - 0.5) * amp * 0.25),
    );
    glitchSkew.set(
      spike ? (Math.random() - 0.5) * progress * 12 * shard.depth : 0,
    );
  });

  const idleX = useTransform(
    [mx, jitterX],
    ([v, j]) => shard.x * gap + (v as number) * strength + (j as number),
  );
  const idleY = useTransform(
    [my, jitterY],
    ([v, j]) => shard.y * gap + (v as number) * strength * 0.85 + (j as number),
  );
  const idleRot = useTransform(
    [mx, my],
    ([vx, vy]) =>
      shard.rotate * (0.5 + progress * 1.35) +
      (vx as number) * shard.depth * 6 +
      (vy as number) * shard.depth * 2,
  );

  const stagger = index * 0.028;

  // Morphing shards vanish instantly â€” morph layer continues the same visual
  if (morphHide) {
    return (
      <motion.div
        className="absolute inset-0 z-10"
        style={{
          clipPath: shard.clip,
          WebkitClipPath: shard.clip,
        }}
        initial={false}
        animate={{ opacity: 0 }}
        transition={{ duration: 0 }}
        aria-hidden
      />
    );
  }

  const soft = softMorphExplode;
  const flyMul = soft ? 0.55 : 1;
  const explodeOpacity = soft
    ? ([1, 1, 0.85, 0.4, 0] as number[])
    : ([1, 1, 1, 0.55, 0] as number[]);
  const explodeOpacityTimes = soft
    ? ([0, 0.15, 0.4, 0.7, 1] as number[])
    : ([0, 0.12, 0.35, 0.7, 1] as number[]);

  return (
    <motion.div
      className="absolute inset-0 z-10 will-change-transform"
      style={{
        clipPath: shard.clip,
        WebkitClipPath: shard.clip,
        filter: IDLE_FILTER,
        x: dispersed ? undefined : idleX,
        y: dispersed ? undefined : idleY,
        rotate: dispersed ? undefined : idleRot,
        skewX: dispersed ? undefined : glitchSkew,
        transformStyle: "preserve-3d",
      }}
      animate={
        dispersed
          ? {
              x: [
                shard.x * gap,
                soft ? shard.x * gap * 0.5 : shard.tearX,
                soft ? shard.flyX * 0.12 * flyMul : -shard.tearX * 0.35,
                shard.flyX * 0.55 * flyMul,
                shard.flyX * flyMul,
              ],
              y: [
                shard.y * gap,
                shard.y * gap * 0.4,
                shard.flyY * 0.15 * flyMul,
                shard.flyY * 0.55 * flyMul,
                shard.flyY * flyMul,
              ],
              rotate: [
                shard.rotate,
                shard.flyRotate * (soft ? 0.06 : 0.15),
                -shard.flyRotate * (soft ? 0.03 : 0.08),
                shard.flyRotate * (soft ? 0.25 : 0.6),
                shard.flyRotate * (soft ? 0.4 : 1),
              ],
              skewX: soft
                ? [0, 4, -3, 1, 0]
                : [
                    0,
                    22 * Math.sign(shard.tearX),
                    -28 * Math.sign(shard.tearX),
                    10,
                    0,
                  ],
              scale: soft
                ? [1, 1.04, 1.02, 1.08, 1.12]
                : [
                    1 + progress * 0.1,
                    1.2,
                    0.92,
                    shard.flyScale * 0.85,
                    shard.flyScale,
                  ],
              opacity: explodeOpacity,
              filter: soft
                ? [
                    IDLE_FILTER,
                    IDLE_FILTER,
                    `drop-shadow(0 0 12px rgba(255,255,255,0.3))`,
                    `blur(2px) drop-shadow(0 0 10px rgba(255,255,255,0.2))`,
                    `blur(8px)`,
                  ]
                : [
                    `contrast(1.5) drop-shadow(0 0 18px rgba(255,255,255,0.5))`,
                    `contrast(2) hue-rotate(${index % 2 === 0 ? 40 : -50}deg) drop-shadow(0 0 22px rgba(168,85,247,0.7))`,
                    `contrast(1.8) drop-shadow(0 0 16px rgba(0,220,255,0.5))`,
                    `blur(4px) contrast(1.4) drop-shadow(0 0 28px rgba(168,85,247,0.55))`,
                    `blur(16px) drop-shadow(0 0 32px rgba(168,85,247,0.35))`,
                  ],
            }
          : {
              scale: 1 + progress * 0.08 + charge * 0.06,
              opacity: 1,
              filter:
                holding && progress > 0.5
                  ? `contrast(${1 + progress * 0.4}) drop-shadow(0 0 ${10 + progress * 18}px rgba(255,255,255,${0.22 + progress * 0.4}))`
                  : IDLE_FILTER,
            }
      }
      transition={
        dispersed
          ? {
              duration: soft ? 0.85 : 0.72,
              times: [0, 0.12, 0.22, 0.55, 1],
              ease: soft ? [0.22, 0.8, 0.28, 1] : [0.15, 0.85, 0.2, 1],
              delay: stagger,
              opacity: {
                duration: soft ? 0.85 : 0.72,
                times: explodeOpacityTimes,
                delay: stagger,
              },
              filter: { duration: soft ? 0.85 : 0.72, delay: stagger },
            }
          : {
              type: "spring",
              stiffness: 160,
              damping: 20,
              mass: 0.55,
              delay: (LOGO_SHARDS.length - index) * 0.03,
              opacity: { duration: 0.35 },
              filter: { duration: 0.2 },
            }
      }
    >
      <motion.img
        src="/brand/logo.png"
        alt=""
        draggable={false}
        className="pointer-events-none h-full w-full object-contain mix-blend-screen select-none"
        style={{ opacity: dispersed ? undefined : 1 }}
        animate={
          dispersed
            ? soft
              ? { x: 0, opacity: 1 }
              : {
                  x: [0, shard.tearX * 0.15, -shard.tearX * 0.1, 0],
                  opacity: [1, 0.7, 1, 0.4],
                }
            : {
                x: 0,
                y: holding
                  ? [
                      0,
                      index % 2 === 0 ? -4 - progress * 4 : 4 + progress * 4,
                      0,
                    ]
                  : 0,
                opacity: 1,
              }
        }
        transition={
          dispersed
            ? soft
              ? { duration: 0.3 }
              : {
                  duration: 0.45,
                  times: [0, 0.2, 0.4, 1],
                  delay: stagger,
                  ease: "easeOut",
                }
            : holding && !lite
              ? {
                  duration: Math.max(0.35, 2.4 - progress * 1.6) + index * 0.12,
                  repeat: Infinity,
                  ease: "easeInOut",
                }
              : { duration: 0.25, ease: "easeOut" }
        }
      />
    </motion.div>
  );
}
