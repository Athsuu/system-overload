export function ModuleTreeGlitchOverlay() {
  return (
    <div
      className="so-module-tree-glitch-overlay pointer-events-none absolute inset-0 z-[5] overflow-hidden"
      aria-hidden
    >
      <div className="so-module-tree-glitch-slice" />
      <div className="so-module-tree-glitch-slice so-module-tree-glitch-slice--alt" />
      <div className="so-module-tree-glitch-chroma" />
      <div className="so-module-tree-glitch-scan" />
    </div>
  );
}
