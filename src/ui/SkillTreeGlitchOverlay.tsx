export function SkillTreeGlitchOverlay() {
  return (
    <div
      className="so-skill-tree-glitch-overlay pointer-events-none absolute inset-0 z-[5] overflow-hidden"
      aria-hidden
    >
      <div className="so-skill-tree-glitch-slice" />
      <div className="so-skill-tree-glitch-slice so-skill-tree-glitch-slice--alt" />
      <div className="so-skill-tree-glitch-chroma" />
      <div className="so-skill-tree-glitch-scan" />
    </div>
  );
}
