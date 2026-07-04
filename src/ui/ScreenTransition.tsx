import type { ReactNode } from 'react';

interface ScreenTransitionProps {
  screenKey: string;
  children: ReactNode;
  className?: string;
}

export function ScreenTransition({ screenKey, children, className = '' }: ScreenTransitionProps) {
  return (
    <div key={screenKey} className={`so-animate-fade-in ${className}`.trim()}>
      {children}
    </div>
  );
}
