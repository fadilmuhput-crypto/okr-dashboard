import React, { useState, useEffect } from 'react';
import { Loader2, AlertCircle, ExternalLink, Eye } from 'lucide-react';
import { C, STATUS_META } from './theme.js';
import { calcKRProgress, confColor, confLabel, confEmoji, timeliness, fmtDate } from './utils.js';
import { Logo } from './Landing.jsx';
import { api } from './api.js';

function ReadOnlyKRCard({ kr }) {
  const progress = calcKRProgress(kr);
  const t = timeliness(kr);
  const status = STATUS_META[kr.status];

  return (
    <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 10, padding: 16 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10, marginBottom: 8 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: C.text, lineHeight: 1.3 }}>{kr.label}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: confColor(kr.confidence), display: 'inline-flex', alignItems: 'center', gap: 3 }}>
              {confEmoji(kr.confidence)} {kr.confidence.toFixed(2)} {confLabel(kr.confidence)}
            </span>
            {status && (
              <span style={{ fontSize: 10.5, fontWeight: 600, padding: '2px 7px', borderRadius: 4, background: status.bg, color: status.color, textTransform: 'capitalize' }}>
                {kr.status}
              </span>
            )}
            {t === 'delayed' && (
              <span style={{ fontSize: 10.5, fontWeight: 600, padding: '2px 7px', borderRadius: 4, background: C.redSoft, color: C.red }}>Delayed</span>
            )}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 20, fontWeight: 700, color: confColor(kr.confidence), fontVariantNumeric: 'tabular-nums' }}>{(progress * 100).toFixed(0)}%</div>
        </div>
      </div>

      <div style={{ width: '100%', height: 4, background: C.bg, borderRadius: 2, marginTop: 4, marginBottom: 8 }}>
        <div style={{ width: `${Math.min(progress * 100, 100)}%`, height: '100%', background: confColor(kr.confidence), borderRadius: 2, transition: 'width 0.3s' }} />
      </div>

      {kr.initiatives.length > 0 && (
        <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 8, marginTop: 4 }}>
          {kr.initiatives.map((ini) => {
            const iniStatus = STATUS_META[ini.status];
            const IniIcon = iniStatus?.icon;
            return (
              <div key={ini.id} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 0', fontSize: 12, color: C.text }}>
                {IniIcon && <IniIcon size={11} color={iniStatus.color} />}
                <span style={{ flex: 1, textDecoration: ini.status === 'done' ? 'line-through' : 'none', opacity: ini.status === 'done' || ini.status === 'cancelled' ? 0.6 : 1 }}>
                  {ini.title}
                </span>
                <span style={{ fontSize: 10, color: C.muted }}>{ini.driver}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function PublicShareView({ token }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const res = await api.getPublicProject(token);
        setData(res.project);
      } catch (e) {
        setError(e.message || 'Failed to load project');
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: C.bg }}>
        <Loader2 size={24} color={C.primary} className="animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: C.bg }}>
        <div style={{ textAlign: 'center', padding: 32 }}>
          <AlertCircle size={40} color={C.red} style={{ marginBottom: 12 }} />
          <div style={{ fontSize: 16, fontWeight: 600, color: C.text, marginBottom: 4 }}>Project not found</div>
          <div style={{ fontSize: 13, color: C.muted }}>{error}</div>
        </div>
      </div>
    );
  }

  const objective = data.objectives[0];
  const krs = objective?.krs || [];
  const overallConf = krs.length ? Math.round((krs.reduce((sum, k) => sum + k.confidence, 0) / krs.length + Number.EPSILON) * 100) / 100 : 0;

  return (
    <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', background: C.bg, minHeight: '100vh', color: C.text, fontSize: 14 }}>
      <div style={{ background: C.white, borderBottom: `1px solid ${C.border}`, padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Logo size={28} />
          <div>
            <div style={{ fontSize: 16, fontWeight: 800, lineHeight: 1.1 }}>Own<span style={{ color: C.primary }}>the</span>Way</div>
            <div style={{ fontSize: 11, color: C.muted }}>{data.name} — Read Only</div>
          </div>
        </div>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11.5, color: C.muted, background: C.bg, padding: '4px 10px', borderRadius: 6, border: `1px solid ${C.border}` }}>
          <Eye size={12} /> Public View
        </span>
      </div>

      <div style={{ padding: '24px', maxWidth: 800, margin: '0 auto' }}>
        {objective && (
          <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 10, padding: '18px 20px', marginBottom: 16 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: C.primary, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 4 }}>
              Objective
            </div>
            <div style={{ fontSize: 19, fontWeight: 600, color: C.text, marginBottom: 4 }}>{objective.objective}</div>
            {objective.whyNow && <div style={{ fontSize: 13, color: C.muted }}>{objective.whyNow}</div>}
            <div style={{ display: 'flex', gap: 12, marginTop: 12, alignItems: 'center' }}>
              <span style={{ fontSize: 28, fontWeight: 700, color: confColor(overallConf), fontVariantNumeric: 'tabular-nums' }}>{krs.length ? overallConf.toFixed(2) : '—'}</span>
              {krs.length > 0 && <span style={{ fontSize: 12, fontWeight: 600, color: confColor(overallConf) }}>{confLabel(overallConf)}</span>}
              <span style={{ fontSize: 11, color: C.muted }}>· {krs.length} KRs</span>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {krs.map((kr) => (
            <ReadOnlyKRCard key={kr.id} kr={kr} />
          ))}
        </div>

        {krs.length === 0 && (
          <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 10, padding: '32px 20px', textAlign: 'center', color: C.muted }}>
            No Key Results yet.
          </div>
        )}
      </div>
    </div>
  );
}
