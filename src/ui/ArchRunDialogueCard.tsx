import { ArchTypewriterGlitchText } from './ArchTypewriterGlitchText';
import { useGameStrings } from '../i18n/useGameStrings';

const ARCH_CYAN = '#38bdf8';

interface ArchRunDialogueCardProps {
  text: string;
  lineKey: string;
  /** Ambient run lines cycle out; run-end lines stay visible. */
  animate?: boolean;
}

export function ArchRunDialogueCard({ text, lineKey, animate = false }: ArchRunDialogueCardProps) {
  const strings = useGameStrings();

  return (
    <div
      key={lineKey}
      className={`so-arch-run-dialogue w-full max-w-3xl text-center ${
        animate ? 'so-animate-arch-run-dialogue' : 'so-animate-fade-in-slow'
      }`}
    >
      <p className="so-arch-run-dialogue-label text-[16px] tracking-[0.32em] text-white/35 uppercase">
        {strings.arch.runRelayLabel}
      </p>
      <p
        className="mt-1.5 text-[21px] font-semibold tracking-[0.22em] uppercase"
        style={{ color: ARCH_CYAN }}
      >
        {strings.arch.name}
      </p>
      <p className="so-arch-run-dialogue-body mt-3 text-[24px] leading-relaxed">
        <ArchTypewriterGlitchText text={text} />
      </p>
    </div>
  );
}
