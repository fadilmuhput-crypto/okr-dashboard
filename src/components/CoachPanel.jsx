import React, { memo } from 'react';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Lightbulb } from 'lucide-react';
import { C } from '../theme.js';
import { computeCoachInsights } from '../coach.js';

const COACH_STYLE = {
  warning: { icon: AlertTriangle, color: C.red, bg: C.redSoft },
  info: { icon: Lightbulb, color: C.secondary, bg: C.blueSoft },
  success: { icon: CheckCircle2, color: C.green, bg: C.greenSoft },
};

const CoachPanel = memo(function CoachPanel({ objective, krs, checkins, weekNumber }) {
  const insights = computeCoachInsights(objective, krs, checkins, weekNumber);
  if (insights.length === 0) return null;

  return (
    <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 10, padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: 0.5 }}>
        <Lightbulb size={13} /> Coach Insights
      </div>
      {insights.map((ins, i) => {
        const meta = COACH_STYLE[ins.severity] || COACH_STYLE.info;
        return (
          <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '8px 10px', background: meta.bg, borderRadius: 7 }}>
            <meta.icon size={14} color={meta.color} style={{ flexShrink: 0, marginTop: 1 }} />
            <span style={{ fontSize: 12.5, color: C.text, lineHeight: 1.5 }}>{ins.message}</span>
          </div>
        );
      })}
    </div>
  );
});

export default CoachPanel;
