import React, { useEffect, useState, memo } from 'react';
import { GitFork, Loader2 } from 'lucide-react';
import { C } from '../theme.js';
import { confColor, confLabel, fmtDate } from '../utils.js';
import { api } from '../api.js';

const AlignedProjects = memo(function AlignedProjects({ projectId }) {
  const [children, setChildren] = useState(null);

  useEffect(() => {
    let alive = true;
    setChildren(null);
    api.getChildren(projectId)
      .then((res) => { if (alive) setChildren(res.children || []); })
      .catch(() => { if (alive) setChildren([]); });
    return () => { alive = false; };
  }, [projectId]);

  return (
    <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 10, padding: '14px 16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
        <GitFork size={14} color={C.secondary} />
        <span style={{ fontSize: 12, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: 0.5 }}>
          Aligned Teams & Projects
        </span>
      </div>

      {children === null ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: C.muted, fontSize: 12 }}>
          <Loader2 size={14} className="animate-spin" /> Loading aligned projects...
        </div>
      ) : children.length === 0 ? (
        <div style={{ fontSize: 12.5, color: C.muted, lineHeight: 1.5 }}>
          Belum ada project yang align ke sini. Member project lain bisa mengarahkan project mereka ke objective di project ini.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {children.map((c) => (
            <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', background: C.bg, borderRadius: 6, border: `1px solid ${C.borderLight}`, flexWrap: 'wrap' }}>
              <div style={{ flex: '1 1 120px', minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.name}</div>
                <div style={{ fontSize: 11, color: C.muted }}>{c.objectiveCount} objective · {c.krCount} KR{c.ownerName ? ` · ${c.ownerName}` : ''}{c.updatedAt ? ` · ${fmtDate(new Date(c.updatedAt).toISOString().slice(0, 10))}` : ''}</div>
              </div>
              {c.avgConfidence !== null && (
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 8px', borderRadius: 10, fontSize: 11, fontWeight: 600, background: confColor(c.avgConfidence) + '22', color: confColor(c.avgConfidence) }}>
                  <span>{c.avgConfidence >= 0.7 ? '🟢' : c.avgConfidence >= 0.5 ? '🟡' : '🔴'}</span>
                  {confLabel(c.avgConfidence)} · {c.avgConfidence.toFixed(2)}
                </div>
              )}
              {c.avgProgress !== null && (
                <div style={{ minWidth: 90, flex: '1 1 90px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10.5, color: C.muted, marginBottom: 2 }}>
                    <span>Progress</span>
                    <span style={{ fontWeight: 700, color: C.text }}>{c.avgProgress.toFixed(0)}%</span>
                  </div>
                  <div style={{ height: 5, background: C.borderLight, borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ width: `${Math.min(100, Math.max(0, c.avgProgress))}%`, height: '100%', background: c.avgConfidence !== null ? confColor(c.avgConfidence) : C.primary, borderRadius: 3 }} />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
});

export default AlignedProjects;
