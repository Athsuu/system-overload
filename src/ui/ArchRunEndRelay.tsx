import { ArchRunDialogueCard } from './ArchRunDialogueCard';

interface ArchRunEndRelayProps {
  text: string;
  lineKey: string;
}

/** ARCH relay line on run-end — same card as in-run dialogue, anchored by parent. */
export function ArchRunEndRelay({ text, lineKey }: ArchRunEndRelayProps) {
  return <ArchRunDialogueCard lineKey={lineKey} text={text} />;
}
