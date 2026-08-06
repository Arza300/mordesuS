export type LogoShard = {
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

/** Clip-path shards that make up the brand mark explode / morph. */
export const LOGO_SHARDS: LogoShard[] = [
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

export const LOGO_SHARD_COUNT = LOGO_SHARDS.length;

export function morphProjectCount(projectCount: number) {
  return Math.min(LOGO_SHARD_COUNT, Math.max(0, projectCount));
}
