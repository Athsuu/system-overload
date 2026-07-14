import { Filter, GlProgram } from 'pixi.js';

/** Durée du glitch critique — extrêmement court, retour instantané à la normale. */
export const CRITICAL_ABERRATION_DURATION_MS = 80;

const vertex = `
in vec2 aPosition;
out vec2 vTextureCoord;

uniform vec4 uInputSize;
uniform vec4 uOutputFrame;
uniform vec4 uOutputTexture;

vec4 filterVertexPosition(void)
{
    vec2 position = aPosition * uOutputFrame.zw + uOutputFrame.xy;
    position.x = position.x * (2.0 / uOutputTexture.x) - 1.0;
    position.y = position.y * (2.0 * uOutputTexture.z / uOutputTexture.y) - uOutputTexture.z;
    return vec4(position, 0.0, 1.0);
}

vec2 filterTextureCoord(void)
{
    return aPosition * (uOutputFrame.zw * uInputSize.zw);
}

void main(void)
{
    gl_Position = filterVertexPosition();
    vTextureCoord = filterTextureCoord();
}
`;

const fragment = `
in vec2 vTextureCoord;
out vec4 finalColor;

uniform sampler2D uTexture;
uniform float uOffset;

void main(void)
{
    float r = texture(uTexture, vTextureCoord + vec2(uOffset, 0.0)).r;
    vec4 base = texture(uTexture, vTextureCoord);
    float b = texture(uTexture, vTextureCoord - vec2(uOffset, 0.0)).b;
    finalColor = vec4(r, base.g, b, base.a);
}
`;

/** Séparation RGB brutale — réservée aux coups critiques, 50-100 ms max. */
export function createChromaticAberrationFilter(offset = 0.0015): Filter {
  return new Filter({
    glProgram: new GlProgram({ vertex, fragment, name: 'critical-chromatic-aberration' }),
    resources: {
      chromaticUniforms: {
        uOffset: { value: offset, type: 'f32' },
      },
    },
  });
}

export interface ChromaticAberrationState {
  remainingMs: number;
}

export function createChromaticAberrationState(): ChromaticAberrationState {
  return { remainingMs: 0 };
}

export function triggerChromaticAberration(state: ChromaticAberrationState): void {
  state.remainingMs = CRITICAL_ABERRATION_DURATION_MS;
}

export function tickChromaticAberration(state: ChromaticAberrationState, deltaMs: number): void {
  state.remainingMs = Math.max(0, state.remainingMs - deltaMs);
}

export function isChromaticAberrationActive(state: ChromaticAberrationState): boolean {
  return state.remainingMs > 0;
}
