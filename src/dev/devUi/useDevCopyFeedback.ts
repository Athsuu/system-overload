import { useCallback, useState } from 'react';

const COPY_FEEDBACK_MS = 2500;

export function useDevCopyFeedback() {
  const [copied, setCopied] = useState(false);

  const runCopy = useCallback(async (copyFn: () => Promise<boolean>) => {
    const ok = await copyFn();
    if (!ok) return false;
    setCopied(true);
    window.setTimeout(() => setCopied(false), COPY_FEEDBACK_MS);
    return true;
  }, []);

  return { copied, runCopy };
}
