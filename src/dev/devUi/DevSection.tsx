import type { ReactNode } from 'react';
import { DEV_SECTION_DESC_CLASS, DEV_SECTION_TITLE_CLASS } from './devStyles';

interface DevSectionProps {
  title: string;
  description?: string;
  children: ReactNode;
}

export function DevSection({ title, description, children }: DevSectionProps) {
  return (
    <div>
      <p className={DEV_SECTION_TITLE_CLASS}>{title}</p>
      {description && <p className={DEV_SECTION_DESC_CLASS}>{description}</p>}
      {children}
    </div>
  );
}
