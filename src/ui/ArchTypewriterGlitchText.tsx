import { useEffect, useState } from 'react';
import { ArchGlitchWords, glitchSlice } from './archGlitchCore';

const DEFAULT_CHAR_MS = 28;
const GLITCH_TICK_MS = 260;
const GLITCH_CHANCE = 0.14;

interface ArchTypewriterGlitchTextProps {
  text: string;
  charMs?: number;
  quote?: boolean;
  className?: string;
}

export function ArchTypewriterGlitchText({
  text,
  charMs = DEFAULT_CHAR_MS,
  quote = false,
  className = '',
}: ArchTypewriterGlitchTextProps) {
  const [visibleCount, setVisibleCount] = useState(0);
  const [typingDone, setTypingDone] = useState(false);
  const [display, setDisplay] = useState(text);

  useEffect(() => {
    setVisibleCount(0);
    setTypingDone(false);
    setDisplay(text);
  }, [text]);

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

    const intervalId = window.setInterval(() => {
      if (Math.random() > GLITCH_CHANCE) return;

      setDisplay(glitchSlice(text));
      const restoreMs = 60 + Math.random() * 70;
      window.setTimeout(() => setDisplay(text), restoreMs);
    }, GLITCH_TICK_MS);

    return () => window.clearInterval(intervalId);
  }, [text, typingDone]);

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
