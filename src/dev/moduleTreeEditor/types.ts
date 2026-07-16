export type { DevModuleTreeEditorMode } from './devModuleTreeEditor';

export interface ModuleTreeEditorDragHover {
  q: number;
  r: number;
  valid: boolean;
}

export interface ModuleTreeEditorDragState {
  draggingId: string | null;
  hover: ModuleTreeEditorDragHover | null;
}

/** Entrée minimale pour la grille hex (brouillon local ou plan global). */
export interface ModuleTreePlanEntry {
  id: string;
  parentIds: readonly string[];
  q: number;
  r: number;
}

export type ResolvePlanPosition = (id: string) => { x: number; y: number };
export type ResolveParentAxial = (parentId: string) => { q: number; r: number };
