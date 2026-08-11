import React, { memo, useMemo } from 'react';
import { TrendingUp, AlertTriangle } from 'lucide-react';
import { C, GRADES as GRADE_META } from '../theme.js';
import { calcKRProgress, confColor } from '../utils.js';

const GRADES = [
  { grade: 'A', label: GRADE_META.A.label, desc: 'Exceeded expectations — bold ambition achieved', color: GRADE_META.A.color, bg: GRADE_META.A.bg, threshold: 0.8 },
  { grade: 'B', label: GRADE_META.B.label, desc: 'Met most goals — solid progress with stretch', color: GRADE_META.B.color, bg: GRADE_META.B.bg, threshold: 0.6 },
  { grade: 'C', label: GRADE_META.C.label, desc: 'Made progress but fell short of key targets', color: GRADE_META.C.color, bg: GRADE_META.C.bg, threshold: 0.35 },
  { grade: 'D', label: GRADE_META.D.label, desc: 'Little meaningful progress — needs rethinking', color: GRADE_META.D.color, bg: GRADE_META.D.bg, threshold: 0 },
];

function calcAutoGrade(krs) {
  if (krs.length === 0) return 'C';
  const avgConf = krs.reduce((s, k) => s + k.confidence, 0) / krs.length;
  const avgProgress = krs.reduce((s, k) => s + calcKRProgress(k), 0) / krs.length;
  const score = (avgConf + avgProgress) / 2;

  if (score >= 0.8) return 'A';
  if (score >= 0.6) return 'B';
  if (score >= 0.35) return 'C';
  return 'D';
}

const GradePicker = memo(function GradePicker({ krs, selectedGrade, onSelect }) {
  const autoGrade = useMemo(() => calcAutoGrade(krs), [krs]);
  const avgConf = krs.length ? krs.reduce((s, k) => s + k.confidence, 0) / krs.length : 0;
  const avgProgress = krs.length ? krs.reduce((s, k) => s + calcKRProgress(k), 0) / krs.length : 0;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
        <TrendingUp size={14} color={C.primary} />
        <span style={{ fontSize: 12, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: 0.5 }}>Grade This Quarter</span>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <div style={{ flex: 1, padding: '8px 10px', background: C.bg, borderRadius: 6, textAlign: 'center' }}>
          <div style={{ fontSize: 10, color: C.muted, fontWeight: 600, textTransform: 'uppercase' }}>Avg Confidence</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: confColor(avgConf) }}>{avgConf.toFixed(2)}</div>
        </div>
        <div style={{ flex: 1, padding: '8px 10px', background: C.bg, borderRadius: 6, textAlign: 'center' }}>
          <div style={{ fontSize: 10, color: C.muted, fontWeight: 600, textTransform: 'uppercase' }}>Avg Progress</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: C.text }}>{(avgProgress * 100).toFixed(0)}%</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 6 }}>
        {GRADES.map((g) => (
          <button
            key={g.grade}
            onClick={() => onSelect(g.grade)}
            style={{
              flex: 1, padding: '10px 6px', borderRadius: 8, border: `2px solid ${selectedGrade === g.grade ? g.color : C.border}`,
              background: selectedGrade === g.grade ? g.bg : C.white, cursor: 'pointer', textAlign: 'center',
              transition: 'all 0.15s',
            }}
          >
            <div style={{ fontSize: 20, fontWeight: 800, color: g.color }}>{g.grade}</div>
            <div style={{ fontSize: 10, fontWeight: 600, color: g.color, marginTop: 2 }}>{g.label}</div>
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 10, padding: '8px 10px', background: C.bg, borderRadius: 6 }}>
        <AlertTriangle size={12} color={C.yellow} />
        <span style={{ fontSize: 11.5, color: C.muted }}>
          Auto-grade suggestion: <strong style={{ color: C.text }}>{autoGrade}</strong> based on final metrics
        </span>
        <button
          onClick={() => onSelect(autoGrade)}
          style={{ marginLeft: 'auto', fontSize: 11, fontWeight: 600, color: C.primary, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
        >
          Use
        </button>
      </div>
    </div>
  );
});

export { GradePicker, calcAutoGrade, GRADES };
export default GradePicker;
