import { useEffect, useRef, useState } from 'react';
import { triggerSfx } from '../../audio/sfxApi';
import { ArchGlitchWords, glitchSlice } from './archGlitchCore';

const DEFAULT_CHAR_MS = 28;
const GLITCH_TICK_MS = 260;
const GLITCH_CHANCE = 0.14;

interface ArchTypewriterGlitchTextProps {
  text: string;
  charMs?: number;
  quote?: boolean;
  className?: string;
  /** Terminal keystroke on each non-space character. */
  typingSound?: boolean;
  glitchIntensity?: 'normal' | 'heavy';
  glitchChance?: number;
}

export function ArchTypewriterGlitchText({
  text,
  charMs = DEFAULT_CHAR_MS,
  quote = false,
  className = '',
  typingSound = true,
  glitchIntensity = 'normal',
  glitchChance,
}: ArchTypewriterGlitchTextProps) {
  const [visibleCount, setVisibleCount] = useState(0);
  const [typingDone, setTypingDone] = useState(false);
  const [display, setDisplay] = useState(text);
  const prevVisibleCountRef = useRef(0);

  useEffect(() => {
    setVisibleCount(0);
    setTypingDone(false);
    setDisplay(text);
    prevVisibleCountRef.current = 0;
  }, [text]);

  useEffect(() => {
    if (!typingSound || visibleCount <= prevVisibleCountRef.current) {
      prevVisibleCountRef.current = visibleCount;
      return;
    }

    const char = text[visibleCount - 1];
    if (char && !/\s/.test(char)) {
      triggerSfx('archTyping');
    }
    prevVisibleCountRef.current = visibleCount;
  }, [text, typingSound, visibleCount]);

  useEffect(() => {
    if (typingDone) return;
    if (visibleCount >= text.length) {
      setTypingDone(true);
      return;
    }
    const timeoutId = window.setTimeout(() => {
      setVisibleCount((count) => count + 1);
    }, charMs);
    return () => window.clearTimeout(timeoutId);
  }, [text, visibleCount, charMs, typingDone]);

  useEffect(() => {
    if (!typingDone) return;

    const tickMs = glitchIntensity === 'heavy' ? 200 : GLITCH_TICK_MS;
    const triggerChance = glitchChance ?? GLITCH_CHANCE;

    const intervalId = window.setInterval(() => {
      if (Math.random() > triggerChance) return;

      setDisplay(glitchSlice(text));
      const restoreMs = glitchIntensity === 'heavy' ? 50 + Math.random() * 60 : 60 + Math.random() * 70;
      window.setTimeout(() => setDisplay(text), restoreMs);
    }, tickMs);

    return () => window.clearInterval(intervalId);
  }, [text, typingDone, glitchIntensity, glitchChance]);

  const partial = text.slice(0, visibleCount);

  return (
    <span
      className={`so-arch-glitch so-arch-dialogue ${className}`.trim()}
      aria-label={text}
    >
      {quote ? '\u201C' : null}
      <span className="so-arch-glitch-inner">
        {typingDone ? (
          <ArchGlitchWords original={text} display={display} />
        ) : (
          <>
            {partial}
            <span className="so-arch-typewriter-cursor" aria-hidden="true">
              ▌
            </span>
          </>
        )}
      </span>
      {quote && typingDone ? '\u201D' : null}
    </span>
  );
}
