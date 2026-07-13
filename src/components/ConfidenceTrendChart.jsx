import React, { memo, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, ReferenceArea } from 'recharts';
import { C } from '../theme.js';
import { confColor } from '../utils.js';

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;
  const val = payload[0].value;
  const color = confColor(val);
  const status = val >= 0.7 ? 'On Track' : val >= 0.5 ? 'Watch' : 'At Risk';
  return (
    <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 6, padding: '8px 12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
      <div style={{ fontSize: 11, color: C.muted, marginBottom: 2 }}>Week {label}</div>
      <div style={{ fontSize: 14, fontWeight: 700, color }}>{val.toFixed(2)}</div>
      <div style={{ fontSize: 10, fontWeight: 600, color, textTransform: 'uppercase' }}>{status}</div>
    </div>
  );
}

const ConfidenceTrendChart = memo(function ConfidenceTrendChart({ krLabel, checkins, krId }) {
  const data = useMemo(() => {
    if (!checkins || !checkins.length || !krId) return [];

    const weekMap = {};
    for (const c of checkins) {
      if (c.confidenceSnapshot && typeof c.confidenceSnapshot[krId] === 'number') {
        const week = c.weekNumber;
        if (!weekMap[week] || new Date(c.createdAt) > new Date(weekMap[week].date)) {
          weekMap[week] = { week, confidence: c.confidenceSnapshot[krId], date: c.createdAt };
        }
      }
    }

    return Object.values(weekMap)
      .sort((a, b) => a.week - b.week)
      .map(({ week, confidence }) => ({ week, confidence }));
  }, [checkins, krId]);

  if (data.length < 2) {
    return (
      <div style={{ padding: '16px', textAlign: 'center', color: C.muted, fontSize: 12 }}>
        {data.length === 0 ? 'No confidence data yet — submit a weekly check-in to start tracking trends.' : 'Need at least 2 check-ins to show a trend.'}
      </div>
    );
  }

  const minConf = Math.min(...data.map(d => d.confidence));
  const maxConf = Math.max(...data.map(d => d.confidence));
  const yMin = Math.max(0, Math.floor(minConf * 10) / 10 - 0.1);
  const yMax = Math.min(1, Math.ceil(maxConf * 10) / 10 + 0.1);
  const latest = data[data.length - 1].confidence;
  const lineColor = confColor(latest);

  return (
    <div style={{ width: '100%', height: 180 }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 12, left: -8, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={C.borderLight} />
          <XAxis
            dataKey="week"
            tickFormatter={(w) => `W${w}`}
            tick={{ fontSize: 10, fill: C.muted }}
            axisLine={{ stroke: C.border }}
            tickLine={false}
          />
          <YAxis
            domain={[yMin, yMax]}
            tick={{ fontSize: 10, fill: C.muted }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => v.toFixed(1)}
          />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceArea y1={0.7} y2={1} fill={C.greenSoft} fillOpacity={0.5} />
          <ReferenceArea y1={0.5} y2={0.7} fill={C.yellowSoft} fillOpacity={0.5} />
          <ReferenceArea y1={0} y2={0.5} fill={C.redSoft} fillOpacity={0.5} />
          <ReferenceLine y={0.7} stroke={C.green} strokeDasharray="4 4" strokeOpacity={0.4} />
          <ReferenceLine y={0.5} stroke={C.yellow} strokeDasharray="4 4" strokeOpacity={0.4} />
          <Line
            type="monotone"
            dataKey="confidence"
            stroke={lineColor}
            strokeWidth={2.5}
            dot={{ r: 4, fill: lineColor, strokeWidth: 0 }}
            activeDot={{ r: 6, fill: lineColor, strokeWidth: 2, stroke: C.white }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
});

export default ConfidenceTrendChart;
