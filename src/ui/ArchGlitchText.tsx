import { useEffect, useState } from 'react';
import { ArchGlitchWords, glitchSlice } from './archGlitchCore';

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

export function ArchGlitchLine({
  text,
  variant = 'dialogue',
  className = '',
  quote,
  intensity = 'normal',
  glitchChance,
}: ArchGlitchLineProps) {
  const [display, setDisplay] = useState(text);
  const useQuotes = quote ?? false;
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
  glitchChance?: number;
}

export function ArchGlitchText({
  text,
  className = '',
  quote = false,
  intensity = 'normal',
  glitchChance,
}: ArchGlitchTextProps) {
  return (
    <ArchGlitchLine
      text={text}
      variant="dialogue"
      className={className}
      quote={quote}
      intensity={intensity}
      glitchChance={glitchChance}
    />
  );
}
