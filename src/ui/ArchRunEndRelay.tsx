import { ArchTypewriterGlitchText } from './ArchTypewriterGlitchText';
import { useGameStrings } from '../i18n/useGameStrings';

const ARCH_CYAN = '#38bdf8';

interface ArchRunEndRelayProps {
  text: string;
  lineKey: string;
  compact?: boolean;
}

export function ArchRunEndRelay({ text, lineKey, compact = false }: ArchRunEndRelayProps) {
  const strings = useGameStrings();

  return (
    <div
      key={lineKey}
      className={`so-arch-run-end-relay text-center ${compact ? 'mt-3' : 'mt-4'}`}
    >
      {!compact && (
        <>
          <p className="so-arch-run-dialogue-label text-[10px] tracking-[0.32em] text-white/35 uppercase">
            {strings.arch.runRelayLabel}
          </p>
          <p
            className="mt-1 text-[13px] font-semibold tracking-[0.22em] uppercase"
            style={{ color: ARCH_CYAN }}
          >
            {strings.arch.name}
          </p>
        </>
      )}
      <p
        className={`so-arch-run-dialogue-body leading-relaxed ${
          compact ? 'text-[13px]' : 'mt-2 text-[15px]'
        }`}
      >
        <ArchTypewriterGlitchText text={text} />
      </p>
    </div>
  );
}
