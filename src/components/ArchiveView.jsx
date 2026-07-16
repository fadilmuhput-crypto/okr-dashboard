import React, { useState, useEffect, useCallback, memo } from 'react';
import { Archive, Clock, TrendingUp, ChevronDown, ChevronRight, Eye, ArrowLeft, Loader2, Star, Plus } from 'lucide-react';
import { C, STATUS_META } from '../theme.js';
import { calcKRProgress, confColor, confLabel, confEmoji, timeliness, fmtDate } from '../utils.js';
import { api } from '../api.js';
import { Modal } from './UIComponents.jsx';
import GradePicker from './GradePicker.jsx';

const GRADE_META = {
  A: { label: 'Exceptional', color: '#16a34a', bg: '#dcfce7' },
  B: { label: 'Successful', color: '#2563eb', bg: '#dbeafe' },
  C: { label: 'Partial', color: '#d97706', bg: '#fef3c7' },
  D: { label: 'Missed', color: '#dc2626', bg: '#fee2e2' },
};

function ArchiveDetail({ archive, onBack }) {
  const objective = archive.objectives[0];
  const krs = objective?.krs || [];
  const grade = archive.grade ? GRADE_META[archive.grade] : null;

  return (
    <div>
      <button onClick={onBack} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 13, color: C.primary, background: 'none', border: 'none', cursor: 'pointer', marginBottom: 16, padding: 0 }}>
        <ArrowLeft size={14} /> Back to archives
      </button>

      <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 10, padding: 20, marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 }}>Quarter</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: C.text }}>{archive.quarter}</div>
          </div>
          {grade && (
            <div style={{ textAlign: 'center', padding: '8px 16px', borderRadius: 8, background: grade.bg }}>
              <div style={{ fontSize: 24, fontWeight: 800, color: grade.color }}>{archive.grade}</div>
              <div style={{ fontSize: 11, fontWeight: 600, color: grade.color }}>{grade.label}</div>
            </div>
          )}
        </div>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: 10, color: C.muted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>Final Week</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{archive.weekNumber}/13</div>
          </div>
          <div>
            <div style={{ fontSize: 10, color: C.muted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>Overall Confidence</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: confColor(archive.overallConfidence) }}>
              {archive.overallConfidence?.toFixed(2) || '—'} {confLabel(archive.overallConfidence)}
            </div>
          </div>
        </div>
        {archive.notes && (
          <div style={{ marginTop: 12, padding: '10px 12px', background: C.bg, borderRadius: 6, fontSize: 13, color: C.text }}>
            {archive.notes}
          </div>
        )}
      </div>

      {objective && (
        <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 10, padding: 16, marginBottom: 16 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: C.primary, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 4 }}>Objective</div>
          <div style={{ fontSize: 16, fontWeight: 600, color: C.text, marginBottom: 4 }}>{objective.objective}</div>
          {objective.whyNow && <div style={{ fontSize: 12.5, color: C.muted }}>{objective.whyNow}</div>}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {krs.map((kr) => {
          const progress = calcKRProgress(kr);
          const status = STATUS_META[kr.status];
          const t = timeliness(kr);
          return (
            <div key={kr.id} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 10, padding: 14 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10, marginBottom: 6 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{kr.label}</div>
                  <div style={{ display: 'flex', gap: 6, marginTop: 4, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 11, fontWeight: 600, color: confColor(kr.confidence) }}>
                      {confEmoji(kr.confidence)} {kr.confidence.toFixed(2)}
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
                <div style={{ fontSize: 18, fontWeight: 700, color: confColor(kr.confidence), fontVariantNumeric: 'tabular-nums' }}>
                  {(progress * 100).toFixed(0)}%
                </div>
              </div>
              <div style={{ width: '100%', height: 4, background: C.bg, borderRadius: 2 }}>
                <div style={{ width: `${Math.min(progress * 100, 100)}%`, height: '100%', background: confColor(kr.confidence), borderRadius: 2 }} />
              </div>
              {kr.initiatives.length > 0 && (
                <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 6, marginTop: 8 }}>
                  {kr.initiatives.map((ini) => {
                    const IniIcon = STATUS_META[ini.status]?.icon;
                    return (
                      <div key={ini.id} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '3px 0', fontSize: 12, color: C.text }}>
                        {IniIcon && <IniIcon size={11} color={STATUS_META[ini.status].color} />}
                        <span style={{ textDecoration: ini.status === 'done' ? 'line-through' : 'none', opacity: ini.status === 'done' || ini.status === 'cancelled' ? 0.6 : 1 }}>
                          {ini.title}
                        </span>
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
}

export default function ArchiveView({ projectId, krs, onClose }) {
  const [archives, setArchives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedArchive, setSelectedArchive] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState(null);
  const [notes, setNotes] = useState('');
  const [archiving, setArchiving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.listArchives(projectId);
        setArchives(res.archives);
      } catch (e) {
        console.error('Failed to load archives:', e);
      } finally {
        setLoading(false);
      }
    })();
  }, [projectId]);

  const handleViewDetail = useCallback(async (archiveId) => {
    setDetailLoading(true);
    try {
      const res = await api.getArchive(archiveId);
      setSelectedArchive(res.archive);
    } catch (e) {
      console.error('Failed to load archive:', e);
    } finally {
      setDetailLoading(false);
    }
  }, []);

  const handleArchive = useCallback(async () => {
    setArchiving(true);
    try {
      await api.archiveProject(projectId, notes, selectedGrade);
      const res = await api.listArchives(projectId);
      setArchives(res.archives);
      setShowCreateForm(false);
      setSelectedGrade(null);
      setNotes('');
    } catch (e) {
      console.error('Failed to archive:', e);
    } finally {
      setArchiving(false);
    }
  }, [projectId, notes, selectedGrade]);

  if (selectedArchive) {
    return (
      <Modal onClose={onClose} maxWidth={700}>
        <ArchiveDetail archive={selectedArchive} onBack={() => setSelectedArchive(null)} />
      </Modal>
    );
  }

  return (
    <Modal onClose={onClose} maxWidth={600}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Archive size={18} color={C.primary} />
          <span style={{ fontSize: 16, fontWeight: 700, color: C.text }}>OKR Archive</span>
        </div>
        {!showCreateForm && (
          <button
            onClick={() => setShowCreateForm(true)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '7px 12px', fontSize: 12.5, fontWeight: 600, border: 'none', borderRadius: 6, background: C.primary, color: C.white, cursor: 'pointer' }}
          >
            <Plus size={13} /> Archive Current
          </button>
        )}
      </div>

      {showCreateForm && (
        <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: 16, marginBottom: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 12 }}>Archive Current Quarter</div>
          <GradePicker krs={krs || []} selectedGrade={selectedGrade} onSelect={setSelectedGrade} />
          <div style={{ marginTop: 12 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: C.muted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>Notes (optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Key learnings, highlights, or context for this quarter..."
              style={{ width: '100%', minHeight: 60, padding: 8, fontSize: 12.5, border: `1px solid ${C.border}`, borderRadius: 6, fontFamily: 'inherit', outline: 'none', resize: 'vertical', color: C.text, background: C.white, boxSizing: 'border-box' }}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 12 }}>
            <button onClick={() => { setShowCreateForm(false); setSelectedGrade(null); setNotes(''); }} style={{ padding: '7px 12px', fontSize: 12.5, fontWeight: 500, border: `1px solid ${C.border}`, borderRadius: 6, background: C.white, color: C.text, cursor: 'pointer' }}>Cancel</button>
            <button
              onClick={handleArchive}
              disabled={archiving}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '7px 14px', fontSize: 12.5, fontWeight: 600, border: 'none', borderRadius: 6, background: archiving ? C.border : C.primary, color: archiving ? C.muted : C.white, cursor: archiving ? 'not-allowed' : 'pointer' }}
            >
              {archiving ? <Loader2 size={13} className="animate-spin" /> : <Archive size={13} />}
              {archiving ? 'Archiving...' : 'Save Archive'}
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 32 }}>
          <Loader2 size={20} color={C.primary} className="animate-spin" />
        </div>
      ) : archives.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '32px 16px' }}>
          <Archive size={32} color={C.border} style={{ marginBottom: 10 }} />
          <div style={{ fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 4 }}>No archives yet</div>
          <div style={{ fontSize: 12.5, color: C.muted, maxWidth: 300, margin: '0 auto' }}>
            Archive your OKR when a quarter ends to build a history of your progress over time.
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {archives.map((a) => {
            const grade = a.grade ? GRADE_META[a.grade] : null;
            return (
              <div
                key={a.id}
                onClick={() => handleViewDetail(a.id)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
                  padding: '12px 14px', background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8,
                  cursor: 'pointer', transition: 'border-color 0.15s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = C.primary}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = C.border}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 15, fontWeight: 700, color: C.text }}>{a.quarter}</span>
                    {grade && (
                      <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 4, background: grade.bg, color: grade.color }}>
                        {a.grade}
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                    <span style={{ fontSize: 11.5, color: C.muted }}>
                      Confidence: <strong style={{ color: confColor(a.overallConfidence) }}>{a.overallConfidence?.toFixed(2) || '—'}</strong>
                    </span>
                    <span style={{ fontSize: 11.5, color: C.muted }}>
                      Week {a.weekNumber}/13
                    </span>
                  </div>
                  {a.notes && <div style={{ fontSize: 11.5, color: C.muted, marginTop: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.notes}</div>}
                </div>
                <Eye size={16} color={C.muted} />
              </div>
            );
          })}
        </div>
      )}
    </Modal>
  );
}
