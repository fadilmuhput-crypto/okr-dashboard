import React, { useState, memo } from 'react';
import { GitBranch, ChevronDown, ChevronRight, Trash2 } from 'lucide-react';
import { C } from '../theme.js';
import { calcKRProgress, confColor, timeliness } from '../utils.js';
import { InlineEdit, ConfidenceSlider, TimelinessBadge } from './UIComponents.jsx';

function TreeInitiativeRow({ ini }) {
  const m = ini.status === 'done' ? { color: C.green, icon: CheckCircle2 } : ini.status === 'cancelled' ? { color: C.muted, icon: XCircle } : ini.status === 'in_progress' ? { color: C.secondary, icon: PauseCircle } : ini.status === 'hold' ? { color: C.yellow, icon: PauseOctagon } : { color: C.muted, icon: Circle };
  return (
    <div style={{ marginLeft: 24, display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', fontSize: 12, borderLeft: `2px solid ${C.borderLight}` }}>
      <span style={{ flex: 1, color: C.text, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ini.title || 'Untitled initiative'}</span>
      <TimelinessBadge ini={ini} />
    </div>
  );
}

function TreeKRRow({ kr, onUpdate, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  const progress = Math.round(calcKRProgress(kr));
  const color = confColor(kr.confidence);

  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', background: C.bg, border: `1px solid ${C.border}`, borderRadius: 7, flexWrap: 'wrap' }}>
        <button onClick={() => setExpanded(e => !e)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted, display: 'flex', padding: 0, flexShrink: 0 }}>
          {expanded ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
        </button>
        <div style={{ flex: '1 1 160px', minWidth: 0 }}>
          <InlineEdit value={kr.label} onChange={(v) => onUpdate({ label: v })} placeholder="Key Result…" fontSize={13} fontWeight={600} />
        </div>
        <span style={{ fontSize: 11, fontWeight: 700, color, minWidth: 36, textAlign: 'right', flexShrink: 0 }}>{progress}%</span>
        <div style={{ flexShrink: 0 }}>
          <ConfidenceSlider value={kr.confidence} onChange={(v) => onUpdate({ confidence: v })} />
        </div>
        <button onClick={onDelete} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted, display: 'flex', flexShrink: 0 }} title="Delete KR"><Trash2 size={13} /></button>
      </div>
      {expanded && (
        <div style={{ marginTop: 6 }}>
          {kr.initiatives.length === 0 ? (
            <div style={{ marginLeft: 24, fontSize: 11.5, color: C.muted, padding: '4px 0' }}>No initiatives yet — add one from Cards view.</div>
          ) : (
            kr.initiatives.map((ini) => <TreeInitiativeRow key={ini.id} ini={ini} />)
          )}
        </div>
      )}
    </div>
  );
}

const TreeView = memo(function TreeView({ krs, onUpdateKR, onDeleteKR }) {
  return (
    <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 10, padding: 16 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
        <GitBranch size={12} /> Key Results
      </div>
      {krs.length === 0 ? (
        <div style={{ fontSize: 12.5, color: C.muted, textAlign: 'center', padding: '12px 0' }}>No Key Results yet — switch to Cards to add one.</div>
      ) : (
        krs.map((kr) => (
          <TreeKRRow key={kr.id} kr={kr} onUpdate={(u) => onUpdateKR(kr.id, u)} onDelete={() => onDeleteKR(kr.id)} />
        ))
      )}
    </div>
  );
});

export default TreeView;
