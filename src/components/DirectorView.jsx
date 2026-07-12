import React, { memo } from 'react';
import { Clock, ArrowRight } from 'lucide-react';
import { C, PROJECT_COLORS } from '../theme.js';
import { calcKRProgress, confColor, confLabel, timeliness } from '../utils.js';

function StatCard({ label, value, color, sub }) {
  return (
    <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 10, padding: '14px 16px', flex: '1 1 130px', minWidth: 130 }}>
      <div style={{ fontSize: 10.5, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 700, color: color || C.text, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

const DirectorView = memo(function DirectorView({ state, onJump }) {
  const allObjs = state.projects.flatMap(p => p.objectives.map(o => ({ ...o, projectId: p.id })));
  const allKRs = allObjs.flatMap(o => o.krs);
  const allInis = allKRs.flatMap(k => k.initiatives);

  const onTrack = allKRs.filter(k => k.confidence >= 0.7).length;
  const watch = allKRs.filter(k => k.confidence >= 0.5 && k.confidence < 0.7).length;
  const atRisk = allKRs.filter(k => k.confidence < 0.5).length;
  const delayed = allInis.filter(i => timeliness(i) === 'delayed').length;
  const avgConf = allKRs.length ? allKRs.reduce((s, k) => s + k.confidence, 0) / allKRs.length : 0;
  const total = allKRs.length || 1;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <StatCard label="Avg Confidence" value={allKRs.length ? avgConf.toFixed(2) : '—'} color={allKRs.length ? confColor(avgConf) : C.text} sub={allKRs.length ? confLabel(avgConf) : 'No KRs yet'} />
        <StatCard label="On Track KRs" value={onTrack} color={C.green} sub={`${Math.round((onTrack / total) * 100)}% of ${allKRs.length}`} />
        <StatCard label="Watch KRs" value={watch} color={C.yellow} sub={`${Math.round((watch / total) * 100)}% of ${allKRs.length}`} />
        <StatCard label="At-Risk KRs" value={atRisk} color={C.red} sub={`${Math.round((atRisk / total) * 100)}% of ${allKRs.length}`} />
        <StatCard label="Delayed Initiatives" value={delayed} color={delayed > 0 ? C.red : C.green} sub={`of ${allInis.length} total`} />
      </div>

      {allKRs.length > 0 && (
        <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 10, padding: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 }}>Portfolio Health — All Key Results</div>
          <div style={{ display: 'flex', height: 14, borderRadius: 7, overflow: 'hidden' }}>
            {onTrack > 0 && <div style={{ width: `${(onTrack / total) * 100}%`, background: C.green }} title={`${onTrack} on track`} />}
            {watch > 0 && <div style={{ width: `${(watch / total) * 100}%`, background: C.yellow }} title={`${watch} watch`} />}
            {atRisk > 0 && <div style={{ width: `${(atRisk / total) * 100}%`, background: C.red }} title={`${atRisk} at risk`} />}
          </div>
          <div style={{ display: 'flex', gap: 16, marginTop: 10, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 11, color: C.muted, display: 'inline-flex', alignItems: 'center', gap: 5 }}><span style={{ width: 8, height: 8, borderRadius: 4, background: C.green, display: 'inline-block' }} /> On Track ({onTrack})</span>
            <span style={{ fontSize: 11, color: C.muted, display: 'inline-flex', alignItems: 'center', gap: 5 }}><span style={{ width: 8, height: 8, borderRadius: 4, background: C.yellow, display: 'inline-block' }} /> Watch ({watch})</span>
            <span style={{ fontSize: 11, color: C.muted, display: 'inline-flex', alignItems: 'center', gap: 5 }}><span style={{ width: 8, height: 8, borderRadius: 4, background: C.red, display: 'inline-block' }} /> At Risk ({atRisk})</span>
          </div>
        </div>
      )}

      {state.projects.map((proj, idx) => {
        const color = PROJECT_COLORS[idx % PROJECT_COLORS.length];
        const objs = allObjs.filter(o => o.projectId === proj.id);
        const hasContent = objs.some(o => o.objective || o.krs.length);
        if (!hasContent) return null;
        return (
          <div key={proj.id}>
            <div style={{ fontSize: 12, fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 8 }}>{proj.name}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {objs.filter(o => o.objective || o.krs.length).map(o => {
                const krs = o.krs;
                const conf = krs.length ? krs.reduce((s, k) => s + k.confidence, 0) / krs.length : 0;
                const objDelayed = krs.flatMap(k => k.initiatives).filter(i => timeliness(i) === 'delayed').length;
                return (
                  <div key={o.id} onClick={() => onJump(proj.id, o.id)} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 10, padding: '14px 16px', cursor: 'pointer', borderLeft: `4px solid ${krs.length ? confColor(conf) : C.border}` }}
                    onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.06)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'none'; }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: krs.length ? 10 : 0 }}>
                      <div style={{ fontSize: 14.5, fontWeight: 600, color: C.text, flex: 1 }}>{o.objective || 'Untitled Objective'}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                        {krs.length > 0 && (
                          <span style={{ fontSize: 13, fontWeight: 700, color: confColor(conf), fontVariantNumeric: 'tabular-nums' }}>{conf.toFixed(2)}</span>
                        )}
                        {objDelayed > 0 && (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 10, fontWeight: 700, color: C.red, background: C.redSoft, padding: '2px 7px', borderRadius: 10 }}><Clock size={9} /> {objDelayed}</span>
                        )}
                        <ArrowRight size={14} color={C.muted} />
                      </div>
                    </div>
                    {krs.length > 0 && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {krs.map(k => {
                          const p = Math.max(0, Math.min(100, calcKRProgress(k)));
                          return (
                            <div key={k.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <span style={{ width: 7, height: 7, borderRadius: 4, background: confColor(k.confidence), flexShrink: 0 }} />
                              <span style={{ fontSize: 12, color: C.text, flex: '0 1 auto', maxWidth: '38%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{k.label || 'Untitled KR'}</span>
                              <div style={{ flex: 1, height: 5, background: C.borderLight, borderRadius: 3, overflow: 'hidden', minWidth: 40 }}>
                                <div style={{ width: `${p}%`, height: '100%', background: confColor(k.confidence) }} />
                              </div>
                              <span style={{ fontSize: 10.5, color: C.muted, fontVariantNumeric: 'tabular-nums', width: 32, textAlign: 'right' }}>{Math.round(p)}%</span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {allKRs.length === 0 && (
        <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 10, padding: '32px 16px', textAlign: 'center', color: C.muted, fontSize: 13 }}>
          No Key Results yet. Switch to Working View to add Objectives and Key Results.
        </div>
      )}
    </div>
  );
});

export default DirectorView;
