import { createNoise2D } from "simplex-noise";

import {
  playLightningEndSound,
  playLightningStrikeSound,
} from "@/lib/lightning-strike-sound";

type Vec2 = { x: number; y: number };

type ComputedNode = {
  index: number;
  targeted: boolean;
  x: number;
  y: number;
  size: number;
  sourceProgress: number;
  yProgress: number;
};

type Strike = {
  progress: number;
  from: Vec2 & { index?: number; size?: number };
  to: ComputedNode;
};

type StormParticle = {
  x: number;
  y: number;
  length: number;
  speed: number;
};

const {
  min,
  max,
  abs,
  sqrt,
  pow,
  random,
  round,
  ceil,
  floor,
  sin,
  cos,
  PI: π,
} = Math;

const rad = (deg: number) => (deg * π) / 180;
const clamp = (minV: number, maxV: number, value: number) =>
  min(maxV, max(minV, value));
const calcProgress = (ratio: number) => clamp(0, 1, ratio);
const calcDistance = (a: Vec2, b: Vec2) =>
  sqrt(pow(abs(a.x - b.x), 2) + pow(abs(a.y - b.y), 2));
const makeArray = (length: number) => Array.from({ length }, (_, i) => i);

function luckySelect<T>(array: T[], chance: number, minItems: number): T[] {
  if (minItems >= array.length) return [...array];

  const weighted = array.map((item) => ({
    item,
    luck: random(),
    passed: random() < chance,
  }));

  const passedItems = weighted.filter((w) => w.passed).map((w) => w.item);
  if (passedItems.length >= minItems) return passedItems;

  const failedItems = weighted
    .filter((w) => !w.passed)
    .sort((a, b) => a.luck - b.luck)
    .map((w) => w.item);

  const needed = minItems - passedItems.length;
  return [...passedItems, ...failedItems.slice(0, needed)];
}

export class RadioStormEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private noise2D = createNoise2D();
  private raf = 0;
  private active = false;
  private disposed = false;
  private frame = 0;
  private width = 1;
  private height = 1;
  private pointer: Vec2 = { x: 0, y: 0 };
  private strikeState: Strike[][] = [];
  private winnerSets: Strike[][] = [];
  private glowState = 1;
  private endState = 0;
  private drawingState = 0;
  private stormParticles: StormParticle[] = [];
  private stormAngle = 50;
  private strikeInterval: ReturnType<typeof setInterval> | null = null;
  private readonly intervalMs = 3000;
  private endSoundPlayed = false;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("2D context unavailable");
    this.ctx = ctx;
    this.resize();
    this.pointer = {
      x: this.width / 3,
      y: this.height / 3,
    };
    this.loop = this.loop.bind(this);
    this.raf = requestAnimationFrame(this.loop);
  }

  private get nodeSize() {
    return max(3, this.width / 1000);
  }

  private get nodeGapConstant() {
    return 8;
  }

  private get nodeGap() {
    return this.nodeSize * this.nodeGapConstant;
  }

  private get nodeCount() {
    // Slightly denser-cap for hero perf vs standalone fullscreen demo
    const raw = floor(
      (this.width * this.height) /
        (this.nodeSize * this.nodeGap) /
        this.nodeGapConstant,
    );
    return min(raw, 4200);
  }

  private get glowStyle() {
    return {
      flashMultiplier: this.nodeSize * 20,
      flashUntil: 0.05,
      flashEase: 1 / 3,
      finalEase: 1 / 20,
    };
  }

  private get stormStyle() {
    return {
      minWindAngle: 50,
      maxWindAngle: 70,
      windVariation: 15,
      windSpeedFactor: 1 / 50,
      windGlowSpeedFactor: 1 / max(1, this.glowState * 3),
      minParticles: 220,
      maxParticles: 380,
      minParticleLength: this.height / 25,
      maxParticleLength: this.height / 7,
      maxParticleWidth: this.width / 500,
      particleColor: {
        h: 280 + 140 * this.glowState,
        s: 100,
        l: 40,
      },
    };
  }

  private get strokeStyle() {
    return {
      width: this.nodeSize * 4,
      cap: "round" as CanvasLineCap,
    };
  }

  private get limits() {
    return {
      strikeSetLimit: 35,
      firstSetMaxStrikes: 2,
      otherSetMaxStrikes: 2,
      dieOff: 0.9,
      winChance: 0.15,
      minWinners: ceil(random() * 4),
      stopY: this.height - this.height / 100,
    };
  }

  private get sizeMultipliers() {
    return {
      y: this.width / 25,
      source: this.width / 25,
      noise: this.width / 70,
    };
  }

  private get source() {
    return {
      pos: this.pointer,
      treshold: this.nodeSize * 35,
      exponent: 1,
    };
  }

  setActive(active: boolean) {
    if (active === this.active) return;
    this.active = active;
    if (active) {
      this.triggerStrike();
      this.startInterval();
    } else {
      this.stopInterval();
      this.resetVisualState();
    }
  }

  setPointer(clientX: number, clientY: number) {
    const rect = this.canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    this.pointer = {
      x,
      y: y - y / 3,
    };
  }

  resize(cssWidth?: number, cssHeight?: number) {
    const parent = this.canvas.parentElement;
    const w = Math.max(
      1,
      Math.floor(cssWidth ?? parent?.clientWidth ?? window.innerWidth),
    );
    const h = Math.max(
      1,
      Math.floor(cssHeight ?? parent?.clientHeight ?? window.innerHeight),
    );
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    this.width = w;
    this.height = h;
    this.canvas.width = Math.floor(w * dpr);
    this.canvas.height = Math.floor(h * dpr);
    this.canvas.style.width = `${w}px`;
    this.canvas.style.height = `${h}px`;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  private startInterval() {
    this.stopInterval();
    this.strikeInterval = setInterval(() => {
      if (this.active) this.triggerStrike();
    }, this.intervalMs);
  }

  private stopInterval() {
    if (this.strikeInterval) {
      clearInterval(this.strikeInterval);
      this.strikeInterval = null;
    }
  }

  private resetVisualState() {
    this.strikeState = [];
    this.winnerSets = [];
    this.glowState = 1;
    this.endState = 0;
    this.drawingState = 0;
    this.endSoundPlayed = false;
  }

  triggerStrike() {
    this.strikeState = [];
    this.winnerSets = [];
    this.glowState = 1;
    this.endState = 0;
    this.drawingState = 0;
    this.endSoundPlayed = false;
    void playLightningStrikeSound();
  }

  private calcNodePos(nodeIndex: number) {
    const size = this.nodeSize;
    const gap = this.nodeGap;
    const x = (nodeIndex * (size + gap)) % this.width;
    const y = floor((nodeIndex * (size + gap)) / this.width) * gap;
    return { x, y };
  }

  private computeNode(sourceNode: Vec2) {
    return (node: number | ComputedNode): ComputedNode => {
      const { nodeSize, sizeMultipliers, source } = this;
      const pos =
        typeof node === "number"
          ? this.calcNodePos(node)
          : { x: node.x, y: node.y };
      const index = typeof node === "number" ? node : node.index;
      const targeted = typeof node === "number" ? false : node.targeted;
      const yProgress = calcProgress(pos.y / this.height);
      const sourceDistance = calcDistance(sourceNode, pos);
      const sourceProgress = calcProgress(source.treshold / sourceDistance);
      const sizeFactorY = sizeMultipliers.y * yProgress;
      const sizeFactorSource =
        pow(sourceProgress, source.exponent) * sizeMultipliers.source;
      const sizeFactorNoise =
        this.noise2D(pos.x, pos.y) * sizeMultipliers.noise;
      return {
        index,
        targeted,
        x: pos.x,
        y: pos.y,
        size:
          sourceProgress *
          (nodeSize + sizeFactorY + sizeFactorSource + sizeFactorNoise),
        sourceProgress,
        yProgress,
      };
    };
  }

  private computeStrikeState(
    rawNodes: number[],
    computedNodes: ComputedNode[],
  ) {
    const {
      strikeSetLimit,
      firstSetMaxStrikes,
      otherSetMaxStrikes,
      dieOff,
      stopY,
    } = this.limits;

    const result: Strike[][] = [];
    const firstSet = [...computedNodes]
      .sort((a, b) => b.size - a.size)
      .slice(0, ceil(random() * firstSetMaxStrikes))
      .map((target) => ({
        progress: 0,
        from: this.source.pos,
        to: target,
      }));

    firstSet.forEach((strike) => {
      computedNodes[strike.to.index].targeted = true;
    });
    result.push(firstSet);

    let limit = strikeSetLimit;
    while (limit-- > 0) {
      const newSet: Strike[] = [];
      const lastSet = result[result.length - 1];
      const sources = lastSet.map((s) => s.to);
      if (sources.some((s) => s.y >= stopY)) break;

      sources.forEach((src) => {
        const strikes = rawNodes
          .map((node, i) => ({
            ...this.computeNode(src)(node),
            targeted: computedNodes[i].targeted,
          }))
          .filter((node) => !node.targeted)
          .filter((node) => node.size > src.size * dieOff)
          .sort((a, b) => b.size - a.size)
          .slice(0, ceil(random() * otherSetMaxStrikes))
          .map((newTarget) => ({
            progress: 0,
            from: src,
            to: newTarget,
          }));

        strikes.forEach((strike) => {
          computedNodes[strike.to.index].targeted = true;
        });
        newSet.push(...strikes);
      });
      result.push(newSet);
    }

    return result;
  }

  private makeStormParticles(amount: number) {
    const { minParticleLength, maxParticleLength, windSpeedFactor } =
      this.stormStyle;
    return makeArray(round(random() * amount)).map(() => {
      const length = max(minParticleLength, random() * maxParticleLength);
      return {
        x: random() * this.width,
        y: random() * this.height,
        length,
        speed: length * windSpeedFactor,
      };
    });
  }

  private prepareEndStates() {
    if (!this.endSoundPlayed) {
      this.endSoundPlayed = true;
      void playLightningEndSound();
    }
    const { flashUntil, flashEase, finalEase } = this.glowStyle;
    this.strikeState = this.winnerSets;
    if (this.glowState >= flashUntil) {
      this.glowState -= this.glowState * flashEase;
    } else {
      this.glowState -= this.glowState * finalEase;
    }
    this.endState += (1 - this.endState) / 200;
  }

  private prepareWinnerSets(endSet: Strike[]) {
    const { winChance, minWinners, stopY, strikeSetLimit } = this.limits;
    const result: Strike[][] = [];
    const finishedStrikes = endSet.filter((strike) => strike.to.y >= stopY);
    const luckyStrikes = luckySelect(finishedStrikes, winChance, minWinners);
    result.push(luckyStrikes);

    let limit = strikeSetLimit;
    while (limit-- > 0) {
      const strikeSet = this.strikeState.slice(0, -1)[limit];
      if (!strikeSet) continue;
      const winningStrikes: Strike[] = [];
      for (let i = 0; i < strikeSet.length; i++) {
        const candidateStrike = strikeSet[i];
        for (let j = 0; j < result[0].length; j++) {
          const alreadyWonStrike = result[0][j];
          if (candidateStrike.to.index === alreadyWonStrike.from.index) {
            winningStrikes.push(candidateStrike);
          }
        }
      }
      result.unshift(winningStrikes);
    }

    return result;
  }

  private drawBackground() {
    const bgGlowFactor = this.endState > 0 ? max(1, this.glowState * 4) : 1;
    this.ctx.fillStyle = `hsl(240, 60%, ${15 * bgGlowFactor}%)`;
    this.ctx.fillRect(0, 0, this.width, this.height);
  }

  private drawNodeMap(nodes: ComputedNode[]) {
    const { ctx, drawingState, frame } = this;
    nodes.forEach((node) => {
      const { sourceProgress } = node;
      const hue = 200 + 220 * sourceProgress - drawingState * (frame % 30);
      const saturation = 90 + drawingState * 10;
      const lightness = 50 + 25 * sourceProgress - drawingState * 2.5;
      ctx.fillStyle = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
      const visualWidth = node.size + drawingState * (node.size / 8);
      const visualHeight = node.size * 4 + drawingState * (node.size / 2);
      ctx.fillRect(
        node.x - visualWidth / 2 + (drawingState * (frame % 12)) / 3,
        node.y - visualHeight / 2 + (drawingState * (frame % 24)) / 3,
        visualWidth,
        visualHeight,
      );
    });
  }

  private drawStormParticles(particles: StormParticle[]) {
    const {
      windVariation,
      windGlowSpeedFactor,
      maxParticleWidth,
      particleColor,
    } = this.stormStyle;
    const { ctx, width, height, stormAngle } = this;

    particles.forEach((p, i) => {
      const angle = rad(
        stormAngle +
          (p.x / width) * windVariation -
          (p.y / height) * windVariation * 2,
      );
      const dirX = sin(angle);
      const dirY = cos(angle);
      ctx.lineCap = "butt";
      ctx.lineWidth = min(maxParticleWidth, random() * width);
      ctx.strokeStyle = `hsl(${particleColor.h}, ${particleColor.s}%, ${particleColor.l}%)`;
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(p.x + p.length * dirX, p.y + p.length * dirY);
      ctx.stroke();
      particles[i].x += p.length * dirX * p.speed * windGlowSpeedFactor;
      particles[i].y += p.length * dirY * p.speed * windGlowSpeedFactor;
      if (particles[i].x >= width) {
        particles[i].x = -p.length;
        particles[i].y = height / -2 + random() * height * 2;
      }
      if (particles[i].y >= height) {
        particles[i].y = random() * -height;
      }
    });
  }

  private drawStrikes() {
    const { ctx, endState, glowState, strokeStyle, glowStyle } = this;
    ctx.lineCap = strokeStyle.cap;

    const endGlow = endState > 0 ? glowState * glowStyle.flashMultiplier : 1;
    const endDisplacement = endState * 25;

    this.strikeState.forEach((strikeSet, i) => {
      const hue = 20 - 180 * (i / 15);
      const lightness = 50 + 40 * (i / 30);
      ctx.strokeStyle = `hsl(${hue}, 100%, ${lightness}%)`;
      const lineWidth = endGlow * (0.5 + strokeStyle.width * ((i + 1) / 10));
      ctx.lineWidth = lineWidth;
      strikeSet.forEach((strike) => {
        if (strike.progress < 1) return;
        ctx.beginPath();
        ctx.moveTo(strike.from.x - lineWidth, strike.from.y + endDisplacement);
        ctx.lineTo(strike.to.x - lineWidth, strike.to.y + endDisplacement);
        ctx.stroke();
      });

      const hue2 = 420 - 40 * (i / 30);
      const lightness2 = 80 + 40 * (i / 30);
      ctx.strokeStyle = `hsl(${hue2}, 100%, ${lightness2}%)`;
      ctx.lineWidth = endGlow * (1 + strokeStyle.width * ((i + 1) / 12));
      strikeSet.forEach((strike) => {
        if (strike.progress < 1) return;
        ctx.beginPath();
        ctx.moveTo(strike.from.x, strike.from.y + endDisplacement);
        ctx.lineTo(strike.to.x, strike.to.y + endDisplacement);
        ctx.stroke();
      });
    });
  }

  private drawActiveStrikes(activeStrikes: Strike[]) {
    const { ctx } = this;
    activeStrikes.forEach((strike) => {
      const diffX = strike.to.x - strike.from.x;
      const diffY = strike.to.y - strike.from.y;
      ctx.beginPath();
      ctx.moveTo(strike.from.x, strike.from.y);
      ctx.lineTo(
        strike.from.x + diffX * strike.progress,
        strike.from.y + diffY * strike.progress,
      );
      ctx.stroke();
      strike.progress += 0.15;
    });
  }

  private draw() {
    this.frame++;
    const rawNodes = makeArray(this.nodeCount);
    const computedNodes = rawNodes.map(this.computeNode(this.source.pos));

    if (!this.stormParticles.length) {
      const { minParticles, maxParticles } = this.stormStyle;
      this.stormParticles = this.makeStormParticles(
        minParticles + ceil(random() * (maxParticles - minParticles)),
      );
    }

    if (!this.strikeState.length) {
      this.strikeState = this.computeStrikeState(rawNodes, computedNodes);
    }

    const activeStrikes = this.strikeState.find((strikeSet) =>
      strikeSet.some((strike) => strike.progress < 1),
    );

    const endSet = this.strikeState.find((strikeSet) =>
      strikeSet.some((strike) => strike.to.y >= this.limits.stopY),
    );

    if (endSet && !this.winnerSets.length) {
      this.winnerSets = this.prepareWinnerSets(endSet);
    }

    if (!activeStrikes && endSet) {
      this.prepareEndStates();
    }

    this.drawBackground();
    this.drawNodeMap(computedNodes);
    this.drawStrikes();

    if (activeStrikes) {
      this.drawingState = min(
        1,
        this.drawingState + max(0.01, this.drawingState / 5),
      );
      this.drawActiveStrikes(activeStrikes);
    } else {
      this.drawingState -= this.drawingState / 10;
    }

    const { minWindAngle, maxWindAngle } = this.stormStyle;
    this.stormAngle += this.noise2D(this.frame / 300, 0);
    this.stormAngle = clamp(minWindAngle, maxWindAngle, this.stormAngle);
    this.drawStormParticles(this.stormParticles);
  }

  private loop() {
    if (this.disposed) return;
    this.raf = requestAnimationFrame(this.loop);
    if (!this.active) return;
    this.draw();
  }

  dispose() {
    this.disposed = true;
    this.stopInterval();
    cancelAnimationFrame(this.raf);
  }
}
