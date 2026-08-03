import { EXPERIENCE_VERTEX_SHADER } from "@/experiences/shared/vertex.shader";

type UniformLocations = {
  resolution: WebGLUniformLocation | null;
  time: WebGLUniformLocation | null;
  move: WebGLUniformLocation | null;
  wheel: WebGLUniformLocation | null;
};

export class ShaderExperienceRenderer {
  canvas: HTMLCanvasElement;
  gl: WebGL2RenderingContext;
  scale: number;
  fragmentSource: string;
  program: WebGLProgram | null = null;
  vs: WebGLShader | null = null;
  fs: WebGLShader | null = null;
  buffer: WebGLBuffer | null = null;
  uniforms: UniformLocations = {
    resolution: null,
    time: null,
    move: null,
    wheel: null,
  };
  mouseMove: [number, number] = [0, 0];
  wheel: [number, number] = [0, 0];
  private vertices = new Float32Array([-1, 1, -1, -1, 1, 1, 1, -1]);
  private startTime = performance.now();

  constructor(canvas: HTMLCanvasElement, fragmentSource: string, scale = 0.5) {
    this.canvas = canvas;
    this.fragmentSource = fragmentSource;
    this.scale = scale;
    const gl = canvas.getContext("webgl2", {
      alpha: false,
      antialias: false,
      powerPreference: "high-performance",
    });
    if (!gl) throw new Error("WebGL2 not available");
    this.gl = gl;
  }

  updateScale(scale: number) {
    this.scale = scale;
    this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
  }

  updateMove(deltas: [number, number]) {
    this.mouseMove = deltas;
  }

  updateWheel(wheel: [number, number]) {
    this.wheel = wheel;
  }

  private compile(shader: WebGLShader, source: string, label: string) {
    const { gl } = this;
    if (gl.isContextLost()) {
      throw new Error(`WebGL context lost before compiling ${label}`);
    }
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      const info = gl.getShaderInfoLog(shader) || "(no info log)";
      throw new Error(`${label} compile failed: ${info}`);
    }
  }

  updateFragment(source: string) {
    this.fragmentSource = source;
    this.setup();
  }

  setup() {
    const { gl } = this;
    if (gl.isContextLost()) {
      throw new Error("WebGL context is lost");
    }
    this.disposeProgram();

    this.vs = gl.createShader(gl.VERTEX_SHADER);
    this.fs = gl.createShader(gl.FRAGMENT_SHADER);
    if (!this.vs || !this.fs) throw new Error("Failed to create shaders");

    this.compile(this.vs, EXPERIENCE_VERTEX_SHADER, "Vertex shader");
    this.compile(this.fs, this.fragmentSource, "Fragment shader");

    this.program = gl.createProgram();
    if (!this.program) throw new Error("Failed to create program");

    gl.attachShader(this.program, this.vs);
    gl.attachShader(this.program, this.fs);
    gl.linkProgram(this.program);

    if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
      throw new Error(
        `Program link failed: ${gl.getProgramInfoLog(this.program)}`,
      );
    }

    this.buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.vertices, gl.STATIC_DRAW);

    const position = gl.getAttribLocation(this.program, "position");
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

    this.uniforms.resolution = gl.getUniformLocation(
      this.program,
      "resolution",
    );
    this.uniforms.time = gl.getUniformLocation(this.program, "time");
    this.uniforms.move = gl.getUniformLocation(this.program, "move");
    this.uniforms.wheel = gl.getUniformLocation(this.program, "wheel");
  }

  resize(cssWidth: number, cssHeight: number) {
    const w = Math.max(1, Math.floor(cssWidth * this.scale));
    const h = Math.max(1, Math.floor(cssHeight * this.scale));
    if (this.canvas.width !== w || this.canvas.height !== h) {
      this.canvas.width = w;
      this.canvas.height = h;
    }
    this.gl.viewport(0, 0, w, h);
  }

  render(now = performance.now()) {
    const { gl, program, buffer, canvas, mouseMove, wheel, uniforms } = this;
    if (!program || !buffer) return;

    const time = (now - this.startTime) * 1e-3;

    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(program);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

    gl.uniform2f(uniforms.resolution, canvas.width, canvas.height);
    gl.uniform1f(uniforms.time, time);
    gl.uniform2f(uniforms.move, mouseMove[0], mouseMove[1]);
    gl.uniform2f(uniforms.wheel, wheel[0], wheel[1]);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }

  resetClock() {
    this.startTime = performance.now();
  }

  private disposeProgram() {
    const { gl, program, vs, fs, buffer } = this;
    if (program) {
      if (vs) {
        gl.detachShader(program, vs);
        gl.deleteShader(vs);
      }
      if (fs) {
        gl.detachShader(program, fs);
        gl.deleteShader(fs);
      }
      gl.deleteProgram(program);
    } else {
      if (vs) gl.deleteShader(vs);
      if (fs) gl.deleteShader(fs);
    }
    if (buffer) gl.deleteBuffer(buffer);
    this.program = null;
    this.vs = null;
    this.fs = null;
    this.buffer = null;
  }

  dispose() {
    // Do not call WEBGL_lose_context — it poisons the canvas for React Strict Mode remounts
    // and experience swaps (getContext then fails compile with a null info log).
    this.disposeProgram();
  }
}

export class ExperiencePointerTracker {
  moves: [number, number] = [0, 0];
  wheel: [number, number] = [0, 0];
  private lastX = 0;
  private lastY = 0;
  private active = false;
  private wheelOffset = 0;

  onPointerDown(x: number, y: number) {
    this.active = true;
    this.lastX = x;
    this.lastY = y;
  }

  onPointerMove(x: number, y: number) {
    if (!this.active) {
      this.lastX = x;
      this.lastY = y;
      return;
    }
    this.moves[0] += x - this.lastX;
    this.moves[1] += this.lastY - y;
    this.lastX = x;
    this.lastY = y;
  }

  onPointerUp() {
    this.active = false;
  }

  onWheel(deltaY: number) {
    this.wheelOffset += deltaY;
    this.wheel = [deltaY, this.wheelOffset];
  }

  reset() {
    this.moves = [0, 0];
    this.wheel = [0, 0];
    this.wheelOffset = 0;
    this.active = false;
  }
}
