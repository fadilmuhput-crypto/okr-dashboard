import React, { memo } from 'react';
import { Plus, X } from 'lucide-react';
import { C } from '../theme.js';

const ObjectiveTabs = memo(function ObjectiveTabs({ objectives, activeId, onSelect, onAdd, onDelete, accentColor }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
      {objectives.map((o, idx) => {
        const active = o.id === activeId;
        const title = o.objective.trim() || `Objective ${idx + 1} (untitled)`;
        return (
          <div key={o.id} style={{ position: 'relative', display: 'inline-flex' }}>
            <button onClick={() => onSelect(o.id)} title={title} style={{
              maxWidth: 220, padding: '7px 28px 7px 14px', fontSize: 12.5, fontWeight: 600,
              border: `1px solid ${active ? accentColor : C.border}`, borderRadius: 16, cursor: 'pointer',
              background: active ? accentColor : C.white, color: active ? C.white : C.text,
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
            }}>
              {title}
            </button>
            {objectives.length > 1 && (
              <button onClick={(e) => { e.stopPropagation(); onDelete(o.id); }} title="Delete objective" style={{
                position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', cursor: 'pointer', color: active ? C.white : C.muted,
                display: 'flex', padding: 0, opacity: 0.8
              }}>
                <X size={12} />
              </button>
            )}
          </div>
        );
      })}
      <button onClick={onAdd} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '7px 12px', fontSize: 12.5, fontWeight: 600, border: `1px dashed ${accentColor}`, borderRadius: 16, cursor: 'pointer', background: 'transparent', color: accentColor }}>
        <Plus size={12} /> New Objective
      </button>
    </div>
  );
});

export default ObjectiveTabs;
