import React, { useState, useMemo } from 'react';
import { X, Check, ChevronDown, ChevronRight } from 'lucide-react';
import { api } from './api.js';
import { trackEvent } from './analytics.js';
import { C } from './theme.js';
import { confColor, confLabel } from './utils.js';

const labelStyle = {
  display: 'block', fontSize: 11, fontWeight: 700, color: C.muted,
  textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6,
};
const textareaStyle = {
  width: '100%', padding: '10px 12px', fontSize: 13.5, border: `1px solid ${C.border}`,
  borderRadius: 7, fontFamily: 'inherit', outline: 'none', color: C.text,
  resize: 'vertical', minHeight: 64, boxSizing: 'border-box', lineHeight: 1.5,
};

function Backdrop({ onClose, children }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,15,15,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: 16 }} onClick={onClose}>
      <div style={{ background: C.white, borderRadius: 14, maxWidth: 560, width: '100%', maxHeight: '90vh', overflow: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.25)', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }} onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}

function HistoryItem({ entry, krs }) {
  const [open, setOpen] = useState(false);
  const confidences = Object.values(entry.confidenceSnapshot || {});
  const avg = confidences.length ? confidences.reduce((a, b) => a + b, 0) / confidences.length : 0;

  return (
    <div style={{ border: `1px solid ${C.border}`, borderRadius: 8, overflow: 'hidden' }}>
      <button onClick={() => setOpen(!open)} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', background: C.bg, border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {open ? <ChevronDown size={13} color={C.muted} /> : <ChevronRight size={13} color={C.muted} />}
          <span style={{ fontSize: 12.5, fontWeight: 700, color: C.text }}>Week {entry.weekNumber}</span>
        </span>
        <span style={{ fontSize: 11, fontWeight: 700, color: confColor(avg) }}>{confLabel(avg)} · {avg.toFixed(2)}</span>
      </button>
      {open && (
        <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {entry.accomplished && (
            <div>
              <div style={{ fontSize: 10.5, fontWeight: 700, color: C.muted, textTransform: 'uppercase', marginBottom: 3 }}>Accomplished</div>
              <div style={{ fontSize: 12.5, color: C.text, lineHeight: 1.5 }}>{entry.accomplished}</div>
            </div>
          )}
          {entry.challenges && (
            <div>
              <div style={{ fontSize: 10.5, fontWeight: 700, color: C.muted, textTransform: 'uppercase', marginBottom: 3 }}>Challenges</div>
              <div style={{ fontSize: 12.5, color: C.text, lineHeight: 1.5 }}>{entry.challenges}</div>
            </div>
          )}
          {entry.nextPriorities && (
            <div>
              <div style={{ fontSize: 10.5, fontWeight: 700, color: C.muted, textTransform: 'uppercase', marginBottom: 3 }}>Next priorities</div>
              <div style={{ fontSize: 12.5, color: C.text, lineHeight: 1.5 }}>{entry.nextPriorities}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function WeeklyCheckIn({ objective, krs, scope, weekNumber, checkins, onClose, onSubmitted }) {
  const [accomplished, setAccomplished] = useState('');
  const [challenges, setChallenges] = useState('');
  const [nextPriorities, setNextPriorities] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const objectiveCheckins = useMemo(
    () => (checkins || []).filter((c) => c.objectiveId === objective.id).sort((a, b) => b.weekNumber - a.weekNumber),
    [checkins, objective.id]
  );
  const alreadyThisWeek = objectiveCheckins.some((c) => c.weekNumber === weekNumber);
  const pastCheckins = objectiveCheckins.filter((c) => c.weekNumber !== weekNumber);

  const overallConf = krs.length ? krs.reduce((s, k) => s + k.confidence, 0) / krs.length : 0;

  const submit = async () => {
    setError('');
    if (!accomplished.trim() && !challenges.trim() && !nextPriorities.trim()) {
      setError('Please fill in at least one field before submitting.');
      return;
    }
    setSubmitting(true);
    try {
      const confidenceSnapshot = Object.fromEntries(krs.map((k) => [k.id, k.confidence]));
      await api.postCheckin({
        weekNumber, scope, objectiveId: objective.id,
        confidenceSnapshot, accomplished, challenges, nextPriorities,
      });
      trackEvent('weekly_checkin_completed', { week_number: weekNumber, scope });
      setDone(true);
      onSubmitted();
    } catch (e) {
      setError(e.message || 'Could not save your check-in.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Backdrop onClose={onClose}>
      <div style={{ padding: '20px 24px 0', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.primary, textTransform: 'uppercase', letterSpacing: 0.5 }}>Week {weekNumber} Check-in</div>
          <h2 style={{ fontSize: 18, fontWeight: 800, margin: '4px 0 0', color: C.text }}>{objective.objective || 'Untitled objective'}</h2>
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted, padding: 4 }}><X size={18} /></button>
      </div>

      <div style={{ padding: '18px 24px 24px' }}>
        {done ? (
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            <div style={{ width: 48, height: 48, borderRadius: 24, background: C.greenSoft, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
              <Check size={24} color={C.green} />
            </div>
            <div style={{ fontSize: 16, fontWeight: 700, color: C.text, marginBottom: 4 }}>Check-in complete</div>
            <div style={{ fontSize: 13, color: C.muted, marginBottom: 18 }}>Nice — Week {weekNumber} is logged.</div>
            <button onClick={onClose} style={{ padding: '9px 18px', fontSize: 13.5, fontWeight: 700, border: 'none', background: C.primary, color: C.white, borderRadius: 7, cursor: 'pointer', fontFamily: 'inherit' }}>Close</button>
          </div>
        ) : (
          <>
            {alreadyThisWeek && (
              <div style={{ fontSize: 12, color: '#1E7A47', background: C.greenSoft, borderRadius: 7, padding: '8px 12px', marginBottom: 14 }}>
                ✓ You already checked in for Week {weekNumber}. Submitting again will log an additional entry.
              </div>
            )}

            <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 10, padding: 14, marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: krs.length ? 10 : 0 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase' }}>Confidence snapshot</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: confColor(overallConf) }}>{confLabel(overallConf)} · {overallConf.toFixed(2)}</span>
              </div>
              {krs.map((k) => (
                <div key={k.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px 0', fontSize: 12.5 }}>
                  <span style={{ color: C.text }}>{k.label}</span>
                  <span style={{ fontWeight: 700, color: confColor(k.confidence) }}>{k.confidence.toFixed(2)}</span>
                </div>
              ))}
              {krs.length === 0 && <div style={{ fontSize: 12, color: C.muted }}>No Key Results yet.</div>}
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>What did you accomplish this week?</label>
              <textarea value={accomplished} onChange={(e) => setAccomplished(e.target.value)} placeholder="Shipped the onboarding redesign…" style={textareaStyle} />
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>What challenges did you face?</label>
              <textarea value={challenges} onChange={(e) => setChallenges(e.target.value)} placeholder="Blocked on design review for 2 days…" style={textareaStyle} />
            </div>
            <div style={{ marginBottom: 18 }}>
              <label style={labelStyle}>What should you prioritize next week?</label>
              <textarea value={nextPriorities} onChange={(e) => setNextPriorities(e.target.value)} placeholder="Finish the KR#2 initiative, start user testing…" style={textareaStyle} />
            </div>

            {error && (
              <div style={{ marginBottom: 14, padding: '9px 12px', background: '#FBEAEA', color: C.red, fontSize: 12.5, borderRadius: 6 }}>{error}</div>
            )}

            <button onClick={submit} disabled={submitting} style={{
              width: '100%', padding: '11px 16px', fontSize: 14, fontWeight: 700,
              background: C.primary, color: C.white, border: 'none', borderRadius: 7,
              cursor: submitting ? 'default' : 'pointer', opacity: submitting ? 0.7 : 1, fontFamily: 'inherit',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}>
              {submitting ? 'Saving…' : <><Check size={15} /> Complete Week {weekNumber} Check-in</>}
            </button>

            {pastCheckins.length > 0 && (
              <div style={{ marginTop: 22 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>
                  Past check-ins ({pastCheckins.length})
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {pastCheckins.map((entry) => (
                    <HistoryItem key={entry.id} entry={entry} krs={krs} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </Backdrop>
  );
}
