/** Shared WebGL2 vertex shader for fullscreen experience quads. */
export const EXPERIENCE_VERTEX_SHADER = `#version 300 es
precision highp float;
in vec4 position;
void main(){gl_Position=position;}`;
