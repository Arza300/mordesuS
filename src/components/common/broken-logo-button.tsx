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

import { cn } from "@/lib/utils";

type Shard = {
  id: string;
  clip: string;
  x: number;
  y: number;
  rotate: number;
  depth: number;
  flyX: number;
  flyY: number;
  flyRotate: number;
  flyScale: number;
  /** horizontal glitch tear bias during explode */
  tearX: number;
};

const SHARDS: Shard[] = [
  {
    id: "tl",
    clip: "polygon(0% 0%, 48% 0%, 42% 52%, 0% 48%)",
    x: -34,
    y: -26,
    rotate: -8,
    depth: 1.1,
    flyX: -420,
    flyY: -260,
    flyRotate: -78,
    flyScale: 1.7,
    tearX: -90,
  },
  {
    id: "tr",
    clip: "polygon(52% 0%, 100% 0%, 100% 48%, 58% 52%)",
    x: 34,
    y: -24,
    rotate: 8,
    depth: 1.25,
    flyX: 440,
    flyY: -240,
    flyRotate: 82,
    flyScale: 1.75,
    tearX: 110,
  },
  {
    id: "ml",
    clip: "polygon(0% 42%, 44% 46%, 48% 62%, 0% 68%)",
    x: -38,
    y: 6,
    rotate: -5,
    depth: 0.85,
    flyX: -520,
    flyY: 20,
    flyRotate: -110,
    flyScale: 1.55,
    tearX: -140,
  },
  {
    id: "mc",
    clip: "polygon(40% 40%, 60% 40%, 58% 70%, 42% 70%)",
    x: 0,
    y: -12,
    rotate: 3,
    depth: 0.55,
    flyX: 40,
    flyY: -280,
    flyRotate: 48,
    flyScale: 1.4,
    tearX: 60,
  },
  {
    id: "mr",
    clip: "polygon(56% 46%, 100% 42%, 100% 68%, 52% 62%)",
    x: 38,
    y: 8,
    rotate: 6,
    depth: 0.95,
    flyX: 540,
    flyY: 40,
    flyRotate: 105,
    flyScale: 1.6,
    tearX: 150,
  },
  {
    id: "bl",
    clip: "polygon(0% 62%, 46% 66%, 40% 100%, 0% 100%)",
    x: -30,
    y: 32,
    rotate: -6,
    depth: 1.15,
    flyX: -400,
    flyY: 360,
    flyRotate: -88,
    flyScale: 1.8,
    tearX: -100,
  },
  {
    id: "br",
    clip: "polygon(54% 66%, 100% 62%, 100% 100%, 60% 100%)",
    x: 32,
    y: 34,
    rotate: 7,
    depth: 1.2,
    flyX: 420,
    flyY: 380,
    flyRotate: 96,
    flyScale: 1.75,
    tearX: 120,
  },
  {
    id: "star",
    clip: "polygon(68% 8%, 100% 0%, 100% 35%, 72% 42%)",
    x: 42,
    y: -40,
    rotate: 14,
    depth: 1.55,
    flyX: 620,
    flyY: -420,
    flyRotate: 210,
    flyScale: 2.1,
    tearX: 180,
  },
];

type BrokenLogoButtonProps = {
  progress?: number;
  holding?: boolean;
  mouseX?: number;
  mouseY?: number;
  dispersed?: boolean;
  className?: string;
};

const IDLE_FILTER = "drop-shadow(0 0 14px rgba(255,255,255,0.35))";

export function BrokenLogoButton({
  progress = 0,
  holding = false,
  mouseX = 0,
  mouseY = 0,
  dispersed = false,
  className,
}: BrokenLogoButtonProps) {
  const charge = progress * progress;
  const gap = 0.35 + progress * 1.15 + charge * 0.85;

  const mx = useSpring(0, { stiffness: 140, damping: 22, mass: 0.4 });
  const my = useSpring(0, { stiffness: 140, damping: 22, mass: 0.4 });
  const shakeX = useMotionValue(0);
  const shakeY = useMotionValue(0);
  const skewX = useMotionValue(0);

  const [glowEpoch, setGlowEpoch] = useState(0);
  const wasDispersed = useRef(false);

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
    if ((!holding && !dispersed) || (progress < 0.02 && !dispersed)) {
      shakeX.set(0);
      shakeY.set(0);
      skewX.set(0);
      return;
    }

    const amp = dispersed ? 22 : charge * 14 + progress * 4;
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
      {showGlitchFx ? (
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
            ? [0.9, 0.4, 0]
            : 0.55 + (holding ? progress * 0.45 : 0),
          scale: dispersed
            ? [1.4, 2.6, 3.2]
            : 1 + (holding ? progress * 0.55 + charge * 0.35 : 0),
        }}
        transition={
          dispersed
            ? { duration: 0.7, times: [0, 0.35, 1], ease: "easeOut" }
            : { duration: 0.55, ease: [0.22, 1, 0.36, 1] }
        }
        style={{ background: glowBg }}
      />

      {/* White/violet flash at explode */}
      <motion.div
        className="pointer-events-none absolute inset-[-10%] z-[25] mix-blend-screen"
        initial={false}
        animate={
          dispersed
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

      {showGlitchFx ? (
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

      {SHARDS.map((shard, i) => (
        <ShardPiece
          key={shard.id}
          shard={shard}
          index={i}
          gap={gap}
          progress={progress}
          charge={charge}
          dispersed={dispersed}
          holding={holding}
          mx={mx}
          my={my}
        />
      ))}

      {showGlitchFx && (dispersed || progress > 0.1) ? (
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
      {SHARDS.map((shard) => (
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
  mx,
  my,
}: {
  shard: Shard;
  index: number;
  gap: number;
  progress: number;
  charge: number;
  dispersed: boolean;
  holding: boolean;
  mx: MotionValue<number>;
  my: MotionValue<number>;
}) {
  const strength = 22 * shard.depth;
  const jitterX = useMotionValue(0);
  const jitterY = useMotionValue(0);
  const glitchSkew = useMotionValue(0);

  useAnimationFrame((t) => {
    if ((!holding && !dispersed) || (!dispersed && progress < 0.03)) {
      jitterX.set(0);
      jitterY.set(0);
      glitchSkew.set(0);
      return;
    }
    if (dispersed) {
      // Micro digital stutter while flying out
      const amp = 10 * shard.depth;
      jitterX.set((Math.random() - 0.5) * amp);
      jitterY.set((Math.random() - 0.5) * amp * 0.4);
      glitchSkew.set((Math.random() - 0.5) * 10);
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
              // Glitch stutter → reverse tear → explode
              x: [
                shard.x * gap,
                shard.tearX,
                -shard.tearX * 0.35,
                shard.flyX * 0.55,
                shard.flyX,
              ],
              y: [
                shard.y * gap,
                shard.y * gap * 0.4,
                shard.flyY * 0.15,
                shard.flyY * 0.55,
                shard.flyY,
              ],
              rotate: [
                shard.rotate,
                shard.flyRotate * 0.15,
                -shard.flyRotate * 0.08,
                shard.flyRotate * 0.6,
                shard.flyRotate,
              ],
              skewX: [
                0,
                22 * Math.sign(shard.tearX),
                -28 * Math.sign(shard.tearX),
                10,
                0,
              ],
              scale: [
                1 + progress * 0.1,
                1.2,
                0.92,
                shard.flyScale * 0.85,
                shard.flyScale,
              ],
              opacity: [1, 1, 1, 0.55, 0],
              filter: [
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
              duration: 0.72,
              times: [0, 0.12, 0.22, 0.55, 1],
              ease: [0.15, 0.85, 0.2, 1],
              delay: stagger,
              opacity: {
                duration: 0.72,
                times: [0, 0.12, 0.35, 0.7, 1],
                delay: stagger,
              },
              filter: { duration: 0.72, delay: stagger },
            }
          : {
              type: "spring",
              stiffness: 160,
              damping: 20,
              mass: 0.55,
              delay: (SHARDS.length - index) * 0.03,
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
            ? {
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
            ? {
                duration: 0.45,
                times: [0, 0.2, 0.4, 1],
                delay: stagger,
                ease: "easeOut",
              }
            : holding
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
