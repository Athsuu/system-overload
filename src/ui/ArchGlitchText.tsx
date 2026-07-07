import { useEffect, useState } from 'react';

const GLITCH_CHARS = '▓░▒│/\\_─';

type ArchGlitchIntensity = 'normal' | 'heavy';
type ArchGlitchVariant = 'dialogue' | 'title';

interface ArchGlitchLineProps {
  text: string;
  variant?: ArchGlitchVariant;
  className?: string;
  quote?: boolean;
  intensity?: ArchGlitchIntensity;
  glitchChance?: number;
}

function glitchSlice(source: string): string {
  if (source.length === 0) return source;

  const chars = [...source];
  const burstLen = 1 + Math.floor(Math.random() * 2);
  const start = Math.floor(Math.random() * Math.max(1, chars.length - burstLen));

  for (let i = start; i < start + burstLen && i < chars.length; i += 1) {
    if (chars[i] === ' ' || chars[i] === '\n') continue;
    chars[i] = GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)];
  }

  return chars.join('');
}

function splitTokens(value: string): string[] {
  return value.split(/(\s+)/);
}

function ArchGlitchWords({ original, display }: { original: string; display: string }) {
  const originalTokens = splitTokens(original);
  const displayTokens = splitTokens(display);

  return (
    <>
      {originalTokens.map((token, index) => {
        if (/^\s+$/.test(token)) {
          return <span key={`space-${index}`}>{token}</span>;
        }

        const visible = displayTokens[index] ?? token;

        return (
          <span key={`word-${index}-${token}`} className="so-arch-word">
            <span className="so-arch-word-ghost" aria-hidden="true">
              {token}
            </span>
            <span className="so-arch-word-layer">{visible}</span>
          </span>
        );
      })}
    </>
  );
}

export function ArchGlitchLine({
  text,
  variant = 'dialogue',
  className = '',
  quote,
  intensity = 'normal',
  glitchChance,
}: ArchGlitchLineProps) {
  const [display, setDisplay] = useState(text);
  const useQuotes = quote ?? variant === 'dialogue';
  const tickMs = intensity === 'heavy' ? 200 : 260;
  const defaultChance =
    variant === 'title' ? 0.11 : intensity === 'heavy' ? 0.3 : 0.22;
  const triggerChance = glitchChance ?? defaultChance;

  useEffect(() => {
    setDisplay(text);
  }, [text]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      if (Math.random() > triggerChance) return;

      setDisplay(glitchSlice(text));
      const restoreMs = intensity === 'heavy' ? 50 + Math.random() * 60 : 60 + Math.random() * 70;
      window.setTimeout(() => setDisplay(text), restoreMs);
    }, tickMs);

    return () => window.clearInterval(intervalId);
  }, [text, intensity, tickMs, triggerChance]);

  const variantClass = `so-arch-${variant}`;
  const intensityClass = intensity === 'heavy' ? 'so-arch-heavy' : '';

  return (
    <span
      className={`so-arch-glitch ${variantClass} ${intensityClass} ${className}`.trim()}
      aria-label={text}
    >
      {useQuotes ? '\u201C' : null}
      <span className="so-arch-glitch-inner">
        <ArchGlitchWords original={text} display={display} />
      </span>
      {useQuotes ? '\u201D' : null}
    </span>
  );
}

interface ArchGlitchTextProps {
  text: string;
  className?: string;
  quote?: boolean;
  intensity?: ArchGlitchIntensity;
}

export function ArchGlitchText({
  text,
  className = '',
  quote = true,
  intensity = 'normal',
}: ArchGlitchTextProps) {
  return (
    <ArchGlitchLine
      text={text}
      variant="dialogue"
      className={className}
      quote={quote}
      intensity={intensity}
    />
  );
}
