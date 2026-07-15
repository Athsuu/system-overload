import { useLayoutEffect, useState } from 'react';
import { fitHexButtonLabel, type HexButtonLayout } from './hexButtonLabelFit';
import { MODULE_TREE_VISUAL } from '../module-tree/moduleTreeTheme';

interface HexButtonLabelProps {
  label: string;
  layout: HexButtonLayout;
  disabled?: boolean;
}

export function HexButtonLabel({ label, layout, disabled = false }: HexButtonLabelProps) {
  const [fit, setFit] = useState(() => fitHexButtonLabel(label, layout));

  useLayoutEffect(() => {
    let cancelled = false;

    const measure = () => {
      if (cancelled) return;
      setFit(fitHexButtonLabel(label, layout));
    };

    if (typeof document !== 'undefined' && document.fonts?.ready) {
      void document.fonts.ready.then(measure);
    } else {
      measure();
    }

    return () => {
      cancelled = true;
    };
  }, [label, layout.width, layout.height, layout.innerR, layout.baseFontPx, layout.cx, layout.cy]);

  return (
    <span
      className="relative block max-w-full text-center font-bold text-white uppercase"
      style={{
        fontSize: `${fit.fontSizePx}px`,
        letterSpacing: `${fit.letterSpacingEm}em`,
        lineHeight: fit.lineHeightRatio,
        textShadow: disabled ? 'none' : `0 0 12px ${MODULE_TREE_VISUAL.edgeActive}66`,
      }}
    >
      {fit.lines.map((line, index) => (
        <span key={`${index}-${line}`} className="block whitespace-nowrap">
          {line}
        </span>
      ))}
    </span>
  );
}
