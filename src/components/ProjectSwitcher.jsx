import React, { useState, useEffect, useRef, memo } from 'react';
import { ChevronDown, Check, Plus, FolderKanban } from 'lucide-react';
import { C, PROJECT_COLORS } from '../theme.js';

const ProjectSwitcher = memo(function ProjectSwitcher({ projects, activeId, onSelect, onAdd, onManage }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const activeIdx = Math.max(0, projects.findIndex(p => p.id === activeId));
  const active = projects[activeIdx];

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    const onClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    window.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onClick);
    return () => { window.removeEventListener('keydown', onKey); document.removeEventListener('mousedown', onClick); };
  }, [open]);

  if (!active) return null;

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button onClick={() => setOpen(o => !o)} style={{
        display: 'inline-flex', alignItems: 'center', gap: 8, padding: '7px 10px 7px 12px', fontSize: 13, fontWeight: 600,
        border: `1px solid ${C.border}`, borderRadius: 8, cursor: 'pointer', background: C.white, color: C.text, maxWidth: 220,
      }}>
        <span style={{ width: 8, height: 8, borderRadius: 4, background: PROJECT_COLORS[activeIdx % PROJECT_COLORS.length], flexShrink: 0 }} />
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{active.name}</span>
        <ChevronDown size={14} color={C.muted} style={{ flexShrink: 0 }} />
      </button>
      {open && (
        <div style={{ position: 'absolute', top: 'calc(100% + 6px)', left: 0, minWidth: 240, background: C.white, border: `1px solid ${C.border}`, borderRadius: 8, boxShadow: '0 8px 24px rgba(0,0,0,0.12)', zIndex: 20, overflow: 'hidden' }}>
          <div style={{ maxHeight: 280, overflowY: 'auto', padding: 6 }}>
            {projects.map((p, idx) => {
              const isActive = p.id === activeId;
              return (
                <button key={p.id} onClick={() => { onSelect(p.id); setOpen(false); }} style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', fontSize: 13, fontWeight: isActive ? 700 : 500,
                  border: 'none', borderRadius: 6, cursor: 'pointer', background: isActive ? C.bg : 'transparent', color: C.text, textAlign: 'left',
                }}>
                  <span style={{ width: 8, height: 8, borderRadius: 4, background: PROJECT_COLORS[idx % PROJECT_COLORS.length], flexShrink: 0 }} />
                  <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</span>
                  {isActive && <Check size={13} color={C.green} />}
                </button>
              );
            })}
          </div>
          <div style={{ borderTop: `1px solid ${C.borderLight}`, padding: 6, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <button onClick={() => { setOpen(false); onAdd(); }} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', fontSize: 13, fontWeight: 600, border: 'none', borderRadius: 6, cursor: 'pointer', background: 'transparent', color: C.text, textAlign: 'left' }}>
              <Plus size={13} /> New Project
            </button>
            <button onClick={() => { setOpen(false); onManage(); }} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', fontSize: 13, fontWeight: 600, border: 'none', borderRadius: 6, cursor: 'pointer', background: 'transparent', color: C.muted, textAlign: 'left' }}>
              <FolderKanban size={13} /> Manage projects
            </button>
          </div>
        </div>
      )}
    </div>
  );
});

export default ProjectSwitcher;
