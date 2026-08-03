import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";

import {
  playNeuralActivationSound,
  playNeuralPulseSound,
} from "@/lib/neural-synapse-sound";

const VERTEX_SHADER = /* glsl */ `
attribute float aIsInput;
varying vec2 vUv;
varying vec3 vWorldPos;
varying vec3 vNormal;
varying float vIsInput;
varying float vDist;

void main() {
  vUv = uv;
  vIsInput = aIsInput;
  vec4 worldPos = modelMatrix * vec4(position, 1.0);
  vWorldPos = worldPos.xyz;
  vDist = length(worldPos.xyz);
  vNormal = normalize(normalMatrix * normal);
  gl_Position = projectionMatrix * viewMatrix * worldPos;
}
`;

const FRAGMENT_SHADER = /* glsl */ `
uniform float uTime;
uniform float uPulseProgress;
uniform float uActivation;
uniform vec3 uCameraPos;

varying vec2 vUv;
varying vec3 vWorldPos;
varying vec3 vNormal;
varying float vIsInput;
varying float vDist;

float hash(vec3 p) {
  p = fract(p * 0.3183099 + .1);
  p *= 17.0;
  return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
}
float noise(vec3 x) {
  vec3 i = floor(x);
  vec3 f = fract(x);
  f = f*f*(3.0-2.0*f);
  return mix(
    mix(mix(hash(i+vec3(0,0,0)),hash(i+vec3(1,0,0)),f.x),
        mix(hash(i+vec3(0,1,0)),hash(i+vec3(1,1,0)),f.x),f.y),
    mix(mix(hash(i+vec3(0,0,1)),hash(i+vec3(1,0,1)),f.x),
        mix(hash(i+vec3(0,1,1)),hash(i+vec3(1,1,1)),f.x),f.y),f.z);
}
vec3 palette(float t, vec3 a, vec3 b, vec3 c, vec3 d) {
  return a + b * cos(6.28318*(c*t+d));
}

void main() {
  vec3 viewDir = normalize(uCameraPos - vWorldPos);
  float fresnel = pow(1.0 - max(dot(vNormal, viewDir), 0.0), 3.0);
  float n1 = noise(vWorldPos * 0.5 + uTime * 0.2);
  float n2 = noise(vWorldPos * 2.0 - uTime * 0.5);

  vec3 baseColor = vec3(0.01, 0.018, 0.03) + (vec3(0.08, 0.22, 0.28) * fresnel * n1);
  baseColor *= (0.5 + 0.5 * n2);

  vec3 pulseColor = vec3(0.0);
  if (vIsInput > 0.5 && uPulseProgress > -5.0) {
    float pDist  = abs(vDist - uPulseProgress);
    float core   = exp(-pDist * pDist * 3.0);
    float trail  = smoothstep(6.0, 0.0, vDist - uPulseProgress) * smoothstep(-2.0, 0.0, uPulseProgress - vDist);
    float pi     = max(core * 3.0, trail * 1.5);
    pulseColor   = vec3(3.5, 1.0, 0.1) * pi * (0.8 + 0.2*n2);
  }

  vec3 actColor = vec3(0.0);
  if (uActivation > 0.0) {
    float distFromWave = vDist - uActivation;
    float waveFront    = exp(-pow(distFromWave, 2.0) * 0.2) * step(0.0, -distFromWave);
    float residual     = smoothstep(uActivation, uActivation - 25.0, vDist);
    float actIntensity = waveFront * 4.0 + residual * 1.5;
    actIntensity      *= (0.6 + 0.4 * noise(vWorldPos * 1.5 - uTime * 2.0));

    vec3 dir    = normalize(vWorldPos);
    float angle = atan(dir.z, dir.x);
    vec3 rainbow = palette(
      angle * 0.15 + vDist * 0.05 - uTime * 0.5,
      vec3(0.5,0.5,0.5), vec3(0.5,0.5,0.5),
      vec3(1.0,1.0,1.0), vec3(0.00,0.33,0.67)
    );
    actColor = rainbow * actIntensity * 1.5;
    if (vDist < 4.0) {
      float somaFlash = exp(-pow(uActivation * 0.2, 2.0)) * 2.5;
      actColor += vec3(1.0, 0.9, 0.8) * somaFlash;
    }
  }

  gl_FragColor = vec4(baseColor + pulseColor + actColor, 1.0);
}
`;

const INPUT_LENGTH = 45;

function createWanderingPath(
  start: THREE.Vector3,
  dir: THREE.Vector3,
  length: number,
  segments: number,
  jitterScale: number,
  endPoint?: THREE.Vector3,
) {
  const pts = [start.clone()];
  let curr = start.clone();
  const cDir = dir.clone().normalize();
  for (let i = 0; i < segments; i++) {
    cDir.x += (Math.random() - 0.5) * jitterScale;
    cDir.y += (Math.random() - 0.5) * jitterScale;
    cDir.z += (Math.random() - 0.5) * jitterScale;
    cDir.normalize();
    curr = curr.clone().add(cDir.clone().multiplyScalar(length / segments));
    pts.push(curr);
  }
  if (endPoint) {
    const approach = endPoint.clone().add(new THREE.Vector3(-1.5, 0, 0));
    pts[pts.length - 1] = approach;
    pts.push(endPoint.clone());
  }
  return new THREE.CatmullRomCurve3(pts);
}

function taperGeometry(
  geo: THREE.BufferGeometry,
  baseRadius: number,
  isInput: boolean,
) {
  const pos = geo.attributes.position as THREE.BufferAttribute;
  const norm = geo.attributes.normal as THREE.BufferAttribute;
  const uv = geo.attributes.uv as THREE.BufferAttribute;
  for (let i = 0; i < pos.count; i++) {
    const u = uv.getX(i);
    const t = isInput ? 1.0 : 1.0 - u;
    const taper = Math.pow(t, 0.6);
    const shrink = baseRadius * (1.0 - taper);
    pos.setXYZ(
      i,
      pos.getX(i) - norm.getX(i) * shrink,
      pos.getY(i) - norm.getY(i) * shrink,
      pos.getZ(i) - norm.getZ(i) * shrink,
    );
  }
  geo.computeVertexNormals();
}

export class NeuralSynapseEngine {
  private canvas: HTMLCanvasElement;
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private composer: EffectComposer;
  private bloomPass: UnrealBloomPass;
  private material: THREE.ShaderMaterial;
  private dustA: THREE.Points;
  private dustB: THREE.Points;
  private dustC: THREE.Points;
  private clock = new THREE.Clock();
  private raf = 0;
  private active = false;
  private state = 0;
  private pulseProg = -10;
  private actProg = 0;
  private disposed = false;
  private readonly target = new THREE.Vector3(0, 0, 0);
  private readonly spherical = new THREE.Spherical();
  private readonly offset = new THREE.Vector3();
  private lastPointerX = 0;
  private lastPointerY = 0;
  private hasPointer = false;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x00000a);
    this.scene.fog = new THREE.FogExp2(0x00000f, 0.022);

    this.camera = new THREE.PerspectiveCamera(52, 1, 0.1, 1000);
    this.camera.position.set(0, 8, 45);
    this.spherical.setFromVector3(
      this.camera.position.clone().sub(this.target),
    );

    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: false,
      powerPreference: "high-performance",
      alpha: false,
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));

    const renderScene = new RenderPass(this.scene, this.camera);
    this.bloomPass = new UnrealBloomPass(
      new THREE.Vector2(1, 1),
      1.5,
      0.4,
      0.85,
    );
    this.bloomPass.threshold = 1.0;
    this.bloomPass.strength = 1.5;
    this.bloomPass.radius = 0.8;

    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass(renderScene);
    this.composer.addPass(this.bloomPass);

    this.material = new THREE.ShaderMaterial({
      vertexShader: VERTEX_SHADER,
      fragmentShader: FRAGMENT_SHADER,
      uniforms: {
        uTime: { value: 0 },
        uPulseProgress: { value: -10 },
        uActivation: { value: 0 },
        uCameraPos: { value: new THREE.Vector3() },
      },
      transparent: false,
      depthWrite: true,
      side: THREE.FrontSide,
    });

    this.buildNeuron();
    this.dustA = this.makeParticles(900, 120, 0x224466, 0.08, 0.25);
    this.dustB = this.makeParticles(280, 90, 0x003355, 0.16, 0.18);
    this.dustC = this.makeParticles(90, 60, 0x00aacc, 0.3, 0.12);
    this.scene.add(this.dustA, this.dustB, this.dustC);

    this.applyCameraFromSpherical();
    this.resize();
    this.loop = this.loop.bind(this);
    this.raf = requestAnimationFrame(this.loop);
  }

  private addBranch(
    group: THREE.Group,
    curve: THREE.CatmullRomCurve3,
    radius: number,
    isInput: boolean,
  ) {
    const geo = new THREE.TubeGeometry(
      curve,
      Math.max(8, Math.floor(curve.getLength() * 2.5)),
      radius,
      10,
      false,
    );
    taperGeometry(geo, radius, isInput);
    const arr = new Float32Array(geo.attributes.position.count).fill(
      isInput ? 1 : 0,
    );
    geo.setAttribute("aIsInput", new THREE.BufferAttribute(arr, 1));
    group.add(new THREE.Mesh(geo, this.material));
    return curve;
  }

  private buildNeuron() {
    const structureGroup = new THREE.Group();
    this.scene.add(structureGroup);

    const somaRadius = 3.3;
    const somaGeo = new THREE.IcosahedronGeometry(somaRadius, 12);
    const pos = somaGeo.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < pos.count; i++) {
      const v = new THREE.Vector3().fromBufferAttribute(pos, i);
      const n =
        Math.sin(v.x * 2) * Math.cos(v.y * 2) * Math.sin(v.z * 2) * 0.5 +
        Math.sin(v.x * 5 + v.y * 3) * 0.2;
      v.add(v.clone().normalize().multiplyScalar(n));
      pos.setXYZ(i, v.x, v.y, v.z);
    }
    somaGeo.computeVertexNormals();
    somaGeo.setAttribute(
      "aIsInput",
      new THREE.BufferAttribute(new Float32Array(pos.count).fill(0), 1),
    );
    structureGroup.add(new THREE.Mesh(somaGeo, this.material));

    const inputCurve = createWanderingPath(
      new THREE.Vector3(-45, 0, 0),
      new THREE.Vector3(1, 0, 0),
      46,
      24,
      0.05,
      new THREE.Vector3(-somaRadius * 0.1, 0, 0),
    );
    this.addBranch(structureGroup, inputCurve, 0.6, true);

    for (let i = 0; i < 14; i++) {
      let phi = Math.random() * Math.PI * 2;
      const theta = Math.acos(Math.random() * 2 - 1);
      if (Math.cos(phi) * Math.sin(theta) < -0.3) {
        phi = phi > Math.PI ? phi - Math.PI : phi + Math.PI;
      }

      const startDir = new THREE.Vector3(
        Math.cos(phi) * Math.sin(theta),
        Math.sin(phi) * Math.sin(theta),
        Math.cos(theta),
      );
      const start = startDir.clone().multiplyScalar(somaRadius * 0.8);
      const length = 20 + Math.random() * 30;
      const mainRadius = 0.4 + Math.random() * 0.3;
      const mainCurve = this.addBranch(
        structureGroup,
        createWanderingPath(start, startDir, length, 20, 0.4),
        mainRadius,
        false,
      );

      const numSec = Math.floor(Math.random() * 3) + 1;
      for (let j = 0; j < numSec; j++) {
        const t = 0.2 + Math.random() * 0.6;
        const bStart = mainCurve.getPoint(t);
        const tangent = mainCurve.getTangent(t);
        const rv = new THREE.Vector3(
          Math.random() - 0.5,
          Math.random() - 0.5,
          Math.random() - 0.5,
        ).normalize();
        const bDir = tangent
          .clone()
          .cross(rv)
          .normalize()
          .add(tangent.multiplyScalar(0.5))
          .normalize();
        this.addBranch(
          structureGroup,
          createWanderingPath(
            bStart,
            bDir,
            (1 - t) * length * (0.4 + Math.random() * 0.4),
            12,
            0.6,
          ),
          mainRadius * (1 - t) * 0.8,
          false,
        );
      }
    }
  }

  private makeParticles(
    count: number,
    spread: number,
    colorHex: number,
    size: number,
    opacity: number,
  ) {
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i++) {
      positions[i] = (Math.random() - 0.5) * spread;
    }
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const mat = new THREE.PointsMaterial({
      color: colorHex,
      size,
      transparent: true,
      opacity,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true,
    });
    return new THREE.Points(geo, mat);
  }

  setActive(active: boolean) {
    if (active === this.active) return;
    this.active = active;
    if (active) {
      this.clock.getDelta();
      this.camera.position.set(0, 8, 45);
      this.target.set(0, 0, 0);
      this.spherical.setFromVector3(
        this.camera.position.clone().sub(this.target),
      );
      this.hasPointer = false;
      this.applyCameraFromSpherical();
      this.triggerPulse();
    } else {
      this.resetPulse();
      this.hasPointer = false;
    }
  }

  /** Drive orbit from hero pointer (client coordinates). */
  setPointer(x: number, y: number) {
    if (!this.hasPointer) {
      this.lastPointerX = x;
      this.lastPointerY = y;
      this.hasPointer = true;
      return;
    }

    const dx = x - this.lastPointerX;
    const dy = y - this.lastPointerY;
    this.lastPointerX = x;
    this.lastPointerY = y;

    if (!this.active) return;
    if (dx === 0 && dy === 0) return;

    this.spherical.theta -= dx * 0.006;
    this.spherical.phi -= dy * 0.0045;
    this.applyCameraFromSpherical();
  }

  private applyCameraFromSpherical() {
    this.spherical.phi = THREE.MathUtils.clamp(
      this.spherical.phi,
      0.25,
      Math.PI - 0.25,
    );
    this.spherical.radius = THREE.MathUtils.clamp(
      this.spherical.radius,
      18,
      80,
    );
    this.offset.setFromSpherical(this.spherical);
    this.camera.position.copy(this.target).add(this.offset);
    this.camera.lookAt(this.target);
  }

  private triggerPulse() {
    this.state = 1;
    this.pulseProg = INPUT_LENGTH;
    this.actProg = 0;
    this.material.uniforms.uActivation.value = 0;
    this.material.uniforms.uPulseProgress.value = this.pulseProg;
    void playNeuralPulseSound();
  }

  private resetPulse() {
    this.state = 0;
    this.pulseProg = -10;
    this.actProg = 0;
    this.material.uniforms.uPulseProgress.value = -10;
    this.material.uniforms.uActivation.value = 0;
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
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h, false);
    this.composer.setSize(w, h);
    this.bloomPass.resolution.set(w, h);
  }

  private loop() {
    if (this.disposed) return;
    this.raf = requestAnimationFrame(this.loop);

    if (!this.active) return;

    const delta = this.clock.getDelta();

    // Slow auto-orbit; mouse deltas apply immediately in setPointer
    this.spherical.theta += delta * 0.35;
    this.applyCameraFromSpherical();

    this.dustA.rotation.y += delta * 0.008;
    this.dustA.rotation.x += delta * 0.003;
    this.dustB.rotation.y -= delta * 0.005;
    this.dustB.rotation.z += delta * 0.002;
    this.dustC.rotation.y += delta * 0.015;

    this.material.uniforms.uTime.value += delta;
    this.material.uniforms.uCameraPos.value.copy(this.camera.position);

    if (this.state === 1) {
      this.pulseProg -= delta * 35;
      this.material.uniforms.uPulseProgress.value = this.pulseProg;
      if (this.pulseProg <= 2) {
        this.state = 2;
        this.pulseProg = -10;
        this.material.uniforms.uPulseProgress.value = -10;
        this.actProg = 0;
        void playNeuralActivationSound();
      }
    } else if (this.state === 2) {
      this.actProg += delta * 20;
      this.material.uniforms.uActivation.value = this.actProg;
      if (this.actProg > 75) {
        this.triggerPulse();
      }
    } else if (this.state === 0) {
      this.triggerPulse();
    }

    this.composer.render();
  }

  dispose() {
    this.disposed = true;
    cancelAnimationFrame(this.raf);
    this.composer.dispose();
    this.scene.traverse((obj) => {
      if (obj instanceof THREE.Mesh || obj instanceof THREE.Points) {
        obj.geometry.dispose();
        const mat = obj.material;
        if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
        else mat.dispose();
      }
    });
    this.material.dispose();
    this.renderer.dispose();
  }
}
