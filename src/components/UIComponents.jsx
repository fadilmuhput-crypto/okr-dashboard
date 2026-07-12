import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { C } from '../theme.js';
import { timeliness } from '../utils.js';

export function Modal({ open, onClose, title, children, maxWidth = 560 }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(15,15,15,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 16 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: C.white, borderRadius: 10, maxWidth, width: '100%', maxHeight: '90vh', overflow: 'auto', boxShadow: '0 16px 48px rgba(0,0,0,0.18)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: `1px solid ${C.borderLight}` }}>
          <div style={{ fontSize: 16, fontWeight: 600, color: C.text }}>{title}</div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted, padding: 4, display: 'flex' }} aria-label="Close"><X size={18} /></button>
        </div>
        <div style={{ padding: 20 }}>{children}</div>
      </div>
    </div>
  );
}

export function InlineEdit({ value, onChange, placeholder, multiline = false, fontSize = 14, fontWeight = 400, color = C.text }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value || '');
  useEffect(() => { setDraft(value || ''); }, [value]);
  const commit = () => { onChange(draft); setEditing(false); };
  if (editing) {
    const Tag = multiline ? 'textarea' : 'input';
    return (
      <Tag autoFocus value={draft} onChange={(e) => setDraft(e.target.value)} onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !multiline) commit();
          if (e.key === 'Enter' && multiline && (e.metaKey || e.ctrlKey)) commit();
          if (e.key === 'Escape') { setDraft(value || ''); setEditing(false); }
        }}
        placeholder={placeholder} rows={multiline ? 2 : undefined}
        style={{ width: '100%', padding: '6px 8px', fontSize, fontWeight, color, border: `1px solid ${C.primary}`, borderRadius: 4, fontFamily: 'inherit', background: C.white, outline: 'none', resize: multiline ? 'vertical' : 'none', lineHeight: 1.4 }} />
    );
  }
  return (
    <div onClick={() => setEditing(true)} style={{ cursor: 'text', fontSize, fontWeight, color: value ? color : C.muted, padding: '6px 8px', borderRadius: 4, border: '1px solid transparent', minHeight: 24, lineHeight: 1.4, whiteSpace: multiline ? 'pre-wrap' : 'normal' }}
      onMouseEnter={(e) => { e.currentTarget.style.background = C.borderLight; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
      title="Click to edit">
      {value || placeholder}
    </div>
  );
}

export function NumericEdit({ value, onChange, width = 64 }) {
  const [draft, setDraft] = useState(String(value ?? 0));
  useEffect(() => { setDraft(String(value ?? 0)); }, [value]);
  const commit = () => { const n = parseFloat(draft); onChange(Number.isFinite(n) ? n : 0); };
  return (
    <input type="number" value={draft} onChange={(e) => setDraft(e.target.value)} onBlur={commit}
      onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur(); }}
      style={{ width, padding: '4px 6px', fontSize: 13, color: C.text, border: `1px solid ${C.border}`, borderRadius: 4, fontFamily: 'inherit', background: C.white, textAlign: 'right', outline: 'none' }} />
  );
}

export function ConfidenceSlider({ value, onChange }) {
  const color = value >= 0.7 ? C.green : value >= 0.5 ? C.yellow : C.red;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 160 }}>
      <input type="range" min={0} max={1} step={0.05} value={value} onChange={(e) => onChange(parseFloat(e.target.value))} style={{ flex: 1, accentColor: color, cursor: 'pointer' }} aria-label="Confidence" />
      <span style={{ fontSize: 12, fontWeight: 600, color, fontVariantNumeric: 'tabular-nums', minWidth: 34, textAlign: 'right' }}>{value.toFixed(2)}</span>
    </div>
  );
}

export function DateEdit({ value, onChange, label }) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
      <span style={{ fontSize: 9.5, color: C.muted, fontWeight: 600, textTransform: 'uppercase' }}>{label}</span>
      <input type="date" value={value || ''} onChange={(e) => onChange(e.target.value)}
        style={{ fontSize: 11, padding: '3px 5px', border: `1px solid ${C.border}`, borderRadius: 4, color: C.text, fontFamily: 'inherit', outline: 'none', background: C.white }} />
    </div>
  );
}

export function TimelinessBadge({ ini }) {
  const t = timeliness(ini);
  if (!t) return null;
  const isDelayed = t === 'delayed';
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 9.5, fontWeight: 700, padding: '2px 7px', borderRadius: 12, background: isDelayed ? C.redSoft : C.greenSoft, color: isDelayed ? C.red : C.green, textTransform: 'uppercase', letterSpacing: 0.3 }}>
      {isDelayed ? 'Delayed' : 'On Track'}
    </span>
  );
}
