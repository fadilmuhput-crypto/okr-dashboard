import React, { useState } from 'react';
import { Plus, Check, Trash2 } from 'lucide-react';
import { C } from '../theme.js';
import { calcKRProgress, confColor, confLabel, timeliness, fmtDate } from '../utils.js';
import { InlineEdit, NumericEdit, ConfidenceSlider, DateEdit, TimelinessBadge } from './UIComponents.jsx';

export function InitiativeRow({ ini, kr, onUpdateKR }) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const toggle = () => {
    const done = ini.status === 'done';
    onUpdateKR({ ...kr, status: done ? 'active' : 'done', initiatives: kr.initiatives.map(i => i.id === ini.id ? { ...i, status: done ? 'active' : 'done', completed_at: done ? null : new Date().toISOString() } : i) });
  };
  const remove = () => { onUpdateKR({ ...kr, initiatives: kr.initiatives.filter(i => i.id !== ini.id) }); };
  const isDone = ini.status === 'done';
  const t = timeliness(ini);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 8px', borderRadius: 6, background: isDone ? C.greenSoft : C.white, opacity: isDone ? 0.75 : 1, border: `1px solid ${isDone ? C.greenSoft : C.borderLight}` }}>
      <button onClick={toggle} style={{ border: `2px solid ${isDone ? C.green : C.border}`, borderRadius: 6, width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', background: isDone ? C.green : 'transparent', flexShrink: 0, padding: 0 }}>
        {isDone && <Check size={11} color={C.white} strokeWidth={3} />}
      </button>
      <div style={{ flex: 1, minWidth: 0 }}>
        <InlineEdit value={ini.title} onChange={(val) => onUpdateKR({ ...kr, initiatives: kr.initiatives.map(i => i.id === ini.id ? { ...i, title: val } : i) })} placeholder="Write an initiative / action item" fontSize={12.5} />
      </div>
      <TimelinessBadge ini={ini} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
        <DateEdit value={ini.targetDate} onChange={(val) => onUpdateKR({ ...kr, initiatives: kr.initiatives.map(i => i.id === ini.id ? { ...i, targetDate: val } : i) })} label="Due" />
        {confirmDelete ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <button onClick={remove} style={{ fontSize: 10, fontWeight: 600, padding: '2px 6px', borderRadius: 4, border: 'none', background: C.red, color: C.white, cursor: 'pointer' }}>Yes</button>
            <button onClick={() => setConfirmDelete(false)} style={{ fontSize: 10, fontWeight: 600, padding: '2px 6px', borderRadius: 4, border: `1px solid ${C.border}`, background: C.white, color: C.muted, cursor: 'pointer' }}>No</button>
          </div>
        ) : (
          <button onClick={() => setConfirmDelete(true)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: C.muted, padding: 2, display: 'flex', borderRadius: 4 }}
            onMouseEnter={(e) => { e.currentTarget.style.background = C.redSoft; e.currentTarget.style.color = C.red; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = C.muted; }}>
            <Trash2 size={12} />
          </button>
        )}
      </div>
    </div>
  );
}

export function AddInitiativeForm({ kr, onUpdateKR }) {
  const [title, setTitle] = useState('');
  const add = () => { const t = title.trim(); if (!t) return; onUpdateKR({ ...kr, initiatives: [...kr.initiatives, { id: `ini_${Date.now()}`, title: t, status: 'active', targetDate: null, created_at: new Date().toISOString() }] }); setTitle(''); };
  return (
    <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
      <input value={title} onChange={(e) => setTitle(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') add(); }} placeholder="Add initiative" style={{ flex: 1, padding: '6px 10px', fontSize: 12.5, border: `1px solid ${C.border}`, borderRadius: 6, fontFamily: 'inherit', outline: 'none', background: C.bg, color: C.text }} />
      <button onClick={add} disabled={!title.trim()} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '6px 10px', fontSize: 12, fontWeight: 600, border: `1px solid ${C.border}`, borderRadius: 6, cursor: title.trim() ? 'pointer' : 'not-allowed', background: title.trim() ? C.bg : C.bg, color: title.trim() ? C.text : C.muted }}>
        <Plus size={12} /> Add
      </button>
    </div>
  );
}
