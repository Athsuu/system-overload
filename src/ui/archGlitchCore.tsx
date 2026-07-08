const GLITCH_CHARS = '▓░▒│/\\_─';

export function glitchSlice(source: string): string {
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

export function ArchGlitchWords({ original, display }: { original: string; display: string }) {
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
