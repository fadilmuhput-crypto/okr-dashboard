import React, { memo, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { C } from '../theme.js';
import { calcKRProgress, confColor } from '../utils.js';
import { InlineEdit, NumericEdit, ConfidenceSlider, DateEdit } from './UIComponents.jsx';

const KRCard = memo(function KRCard({ kr, onChange, onRemove, accentColor }) {
  const progress = calcKRProgress(kr);
  const conf = kr.confidence;
  const color = confColor(conf);

  return (
    <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 9, padding: '12px 14px', borderLeft: `4px solid ${color}`, display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 22, height: 22, borderRadius: 6, background: C.bg, fontSize: 11, fontWeight: 700, color: C.muted }}>KR</span>
        <div style={{ flex: 1 }}>
          <InlineEdit value={kr.label} onChange={(val) => onChange({ ...kr, label: val })} placeholder="Write a key result" fontSize={13.5} fontWeight={600} />
        </div>
        <button onClick={onRemove} style={{ border: 'none', background: 'none', cursor: 'pointer', color: C.muted, padding: 4, display: 'flex', borderRadius: 4 }}
          onMouseEnter={(e) => { e.currentTarget.style.background = C.redSoft; e.currentTarget.style.color = C.red; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = C.muted; }}>
          <Trash2 size={14} />
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, fontSize: 12.5, color: C.muted }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <label style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>Current / Target</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <NumericEdit value={kr.current} onChange={(val) => onChange({ ...kr, current: val })} />
            <span style={{ color: C.muted }}>/</span>
            <NumericEdit value={kr.target} onChange={(val) => onChange({ ...kr, target: val })} />
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <label style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>Confidence</label>
          <ConfidenceSlider value={kr.confidence} onChange={(val) => onChange({ ...kr, confidence: val })} />
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ flex: 1, height: 6, background: C.borderLight, borderRadius: 3, overflow: 'hidden' }}>
          <div style={{ width: `${progress}%`, height: '100%', background: color, borderRadius: 3 }} />
        </div>
        <span style={{ fontSize: 11, fontWeight: 700, color: C.muted, fontVariantNumeric: 'tabular-nums', minWidth: 32, textAlign: 'right' }}>{Math.round(progress)}%</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <DateEdit value={kr.startDate} onChange={(val) => onChange({ ...kr, startDate: val })} label="Start" />
        <DateEdit value={kr.endDate} onChange={(val) => onChange({ ...kr, endDate: val })} label="End" />
      </div>

      <div style={{ borderTop: `1px solid ${C.borderLight}`, paddingTop: 6 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>How to achieve?</div>
        <InlineEdit value={kr.howToAchieve} onChange={(val) => onChange({ ...kr, howToAchieve: val })} placeholder="Optional: strategy or plan to achieve this KR" multiline={true} fontSize={12} color={C.text} />
      </div>
    </div>
  );
});

export default KRCard;
