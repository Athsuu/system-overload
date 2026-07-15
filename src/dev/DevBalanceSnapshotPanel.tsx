import { useState } from 'react';
import { buildBalanceSnapshot, copyBalanceSnapshotToClipboard, formatBalanceSnapshot } from './balanceSnapshot';
import { DevButton } from './DevButton';
import {
  DevCopyButton,
  DEV_SNAPSHOT_COPY_HINT,
  DEV_SNAPSHOT_COPY_LABEL,
  DEV_SNAPSHOT_COPIED_LABEL,
} from './devUi';

export function DevBalanceSnapshotPanel() {
  const [showPreview, setShowPreview] = useState(false);
  const preview = showPreview ? formatBalanceSnapshot(buildBalanceSnapshot()) : '';

  const handleCopy = async () => {
    const ok = await copyBalanceSnapshotToClipboard();
    if (!ok) setShowPreview(true);
    return ok;
  };

  return (
    <div className="space-y-2">
      <p className="text-[13px] leading-relaxed text-white/45">{DEV_SNAPSHOT_COPY_HINT}</p>
      <div className="flex flex-wrap gap-1.5">
        <DevCopyButton
          label={DEV_SNAPSHOT_COPY_LABEL}
          copiedLabel={DEV_SNAPSHOT_COPIED_LABEL}
          onCopy={handleCopy}
        />
        <DevButton onClick={() => setShowPreview((open) => !open)}>
          {showPreview ? 'Masquer aperçu' : 'Aperçu'}
        </DevButton>
      </div>
      {showPreview && (
        <textarea
          readOnly
          value={preview}
          className="so-dev-scroll h-48 w-full resize-y rounded-lg border border-white/10 bg-black/50 p-2 font-mono text-[11px] leading-relaxed text-white/70 outline-none focus:border-cyan-500/40"
          onFocus={(event) => event.target.select()}
        />
      )}
    </div>
  );
}
