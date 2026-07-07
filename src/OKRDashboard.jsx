import React, { useState, useEffect, useRef } from 'react';
import { Target, AlertTriangle, Calendar, Trash2, Plus, X, Copy, RotateCcw, Sparkles, FileText, Check, Users, Flag, CheckCircle2, Circle, PauseCircle, ChevronDown, ChevronRight, XCircle, PauseOctagon, Clock, LayoutDashboard, ListChecks, ArrowRight } from 'lucide-react';
import OnboardingWizard from './OnboardingWizard.jsx';
import { Logo } from './Landing.jsx';
import { api } from './api.js';
import WeeklyCheckIn from './WeeklyCheckIn.jsx';
import { computeCoachInsights } from './coach.js';
import { Lightbulb, Pencil } from 'lucide-react';

const STORAGE_KEY = 'okr-dashboard-state-v4';

const C = {
  primary: '#E72D33',
  secondary: '#2E4DA0',
  green: '#1E8449',
  yellow: '#D68910',
  red: '#C0392B',
  text: '#1F1F1F',
  muted: '#7A7A7A',
  border: '#E0E0E0',
  borderLight: '#F0F0F0',
  bg: '#FAFAFA',
  white: '#FFFFFF',
  greenSoft: '#EAF5EE',
  yellowSoft: '#FDF6E3',
  redSoft: '#FBEAEA',
  blueSoft: '#E8F0FE',
  grayPill: '#EDEDED'
};

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const CURRENT_YEAR = new Date().getFullYear();

const STATUS_META = {
  todo: { label: 'To Do', color: C.muted, bg: C.grayPill, icon: Circle },
  in_progress: { label: 'In Progress', color: C.secondary, bg: C.blueSoft, icon: PauseCircle },
  hold: { label: 'On Hold', color: C.yellow, bg: C.yellowSoft, icon: PauseOctagon },
  cancelled: { label: 'Cancelled', color: C.muted, bg: C.grayPill, icon: XCircle },
  done: { label: 'Done', color: C.green, bg: C.greenSoft, icon: CheckCircle2 }
};
const STATUS_ORDER = ['todo', 'in_progress', 'hold', 'cancelled', 'done'];

const PROJECT_COLORS = [C.primary, C.secondary, '#7C3AED', '#059669', '#D97706', '#DB2777'];
const FREE_PROJECT_LIMIT = 2;
const newProjectId = () => `proj_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

const DEFAULT_STATE = {
  activeProjectId: 'personal',
  weekNumber: 1,
  viewMode: 'working',
  projects: [
    { id: 'personal', name: 'Personal', objectives: [{ id: 'po1', objective: '', whyNow: '', krs: [] }], activeObjectiveId: 'po1' },
    { id: 'team', name: 'Team', objectives: [{ id: 'to1', objective: '', whyNow: '', krs: [] }], activeObjectiveId: 'to1' }
  ]
};

// Converts pre-Projects state ({ activeScope, personal: {...}, team: {...} })
// into the projects[] shape. Anything already on the new shape passes through.
function migrateState(raw) {
  if (!raw) return DEFAULT_STATE;
  if (Array.isArray(raw.projects)) {
    return {
      weekNumber: raw.weekNumber || 1,
      viewMode: raw.viewMode || 'working',
      activeProjectId: raw.activeProjectId || raw.projects[0]?.id,
      projects: raw.projects.length ? raw.projects : DEFAULT_STATE.projects,
    };
  }
  if (raw.personal || raw.team) {
    const projects = [];
    if (raw.personal) projects.push({ id: 'personal', name: 'Personal', objectives: raw.personal.objectives || [], activeObjectiveId: raw.personal.activeObjectiveId });
    if (raw.team) projects.push({ id: 'team', name: 'Team', objectives: raw.team.objectives || [], activeObjectiveId: raw.team.activeObjectiveId });
    return {
      weekNumber: raw.weekNumber || 1,
      viewMode: raw.viewMode || 'working',
      activeProjectId: raw.activeScope === 'team' ? 'team' : 'personal',
      projects: projects.length ? projects : DEFAULT_STATE.projects,
    };
  }
  return DEFAULT_STATE;
}

const SAMPLE_PERSONAL_OBJECTIVES = [
  {
    id: 'po1',
    objective: 'Become the trusted voice that helps your audience make sense of your industry',
    whyNow: 'This quarter is the window to convert content velocity into strategic influence.',
    krs: [
      {
        id: 'po1k1', label: 'Grow newsletter / following', type: 'percent', baseline: 1200, target: 1500, current: 1280, unit: 'followers', confidence: 0.45,
        initiatives: [
          { id: 'po1k1i1', title: 'Outreach to 10 voices for engagement', driver: 'Me', contributors: [], status: 'in_progress', startDate: '', endDate: '' },
          { id: 'po1k1i2', title: 'Cross-post highlights to other channels', driver: 'Me', contributors: [], status: 'todo', startDate: '', endDate: '' }
        ]
      },
      {
        id: 'po1k2', label: 'Publish weekly content series', type: 'percent', baseline: 0, target: 5, current: 2, unit: 'posts', confidence: 0.65,
        initiatives: [
          { id: 'po1k2i1', title: 'Weekly writing block (90 min)', driver: 'Me', contributors: ['Editor (review)'], status: 'in_progress', startDate: '', endDate: '' }
        ]
      }
    ]
  }
];
const SAMPLE_TEAM_OBJECTIVES = [
  {
    id: 'to1',
    objective: 'Make the product the most trusted touchpoint for our customers',
    whyNow: 'Churn signals trace to friction; close window before competitor launches.',
    krs: [
      {
        id: 'to1k1', label: 'Increase NPS', type: 'percent', baseline: 32, target: 48, current: 38, unit: 'NPS pts', confidence: 0.60,
        initiatives: [
          { id: 'to1k1i1', title: 'In-app survey at key moments', driver: 'Growth', contributors: ['Eng', 'Design'], status: 'done', startDate: '', endDate: '' }
        ]
      }
    ]
  }
];

const calcKRProgress = (kr) => {
  if (kr.type === 'deadline') {
    const c = Number(kr.current);
    return Number.isFinite(c) ? Math.max(0, Math.min(100, c)) : 0;
  }
  const baseline = Number(kr.baseline), target = Number(kr.target), current = Number(kr.current);
  if (!Number.isFinite(baseline) || !Number.isFinite(target) || !Number.isFinite(current)) return 0;
  if (baseline === target) return current >= target ? 100 : 0;
  const raw = target > baseline
    ? ((current - baseline) / (target - baseline)) * 100
    : ((baseline - current) / (baseline - target)) * 100;
  return raw;
};

const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' && window.innerWidth < 640);
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  return isMobile;
};

const confColor = (c) => c >= 0.7 ? C.green : c >= 0.5 ? C.yellow : C.red;
const confLabel = (c) => c >= 0.7 ? 'On Track' : c >= 0.5 ? 'Watch' : 'At Risk';
const confEmoji = (c) => c >= 0.7 ? '🟢' : c >= 0.5 ? '🟡' : '🔴';

const timeliness = (ini) => {
  if (ini.status === 'done' || ini.status === 'cancelled') return null;
  if (!ini.endDate) return null;
  const end = new Date(ini.endDate + 'T00:00:00');
  if (isNaN(end.getTime())) return null;
  return end < new Date() ? 'delayed' : 'on_track';
};

const fmtDate = (d) => {
  if (!d) return null;
  const dt = new Date(d + 'T00:00:00');
  if (isNaN(dt.getTime())) return null;
  return `${MONTHS[dt.getMonth()]} ${dt.getDate()}`;
};

const newId = (prefix, items) => {
  const nums = items.map(it => parseInt(String(it.id).replace(prefix, ''), 10)).filter(n => !isNaN(n));
  return prefix + (Math.max(0, ...nums) + 1);
};

function Modal({ open, onClose, title, children, maxWidth = 560 }) {
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

function InlineEdit({ value, onChange, placeholder, multiline = false, fontSize = 14, fontWeight = 400, color = C.text }) {
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

function NumericEdit({ value, onChange, width = 64 }) {
  const [draft, setDraft] = useState(String(value ?? 0));
  useEffect(() => { setDraft(String(value ?? 0)); }, [value]);
  const commit = () => { const n = parseFloat(draft); onChange(Number.isFinite(n) ? n : 0); };
  return (
    <input type="number" value={draft} onChange={(e) => setDraft(e.target.value)} onBlur={commit}
      onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur(); }}
      style={{ width, padding: '4px 6px', fontSize: 13, color: C.text, border: `1px solid ${C.border}`, borderRadius: 4, fontFamily: 'inherit', background: C.white, textAlign: 'right', outline: 'none' }} />
  );
}

function ConfidenceSlider({ value, onChange }) {
  const color = confColor(value);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 160 }}>
      <input type="range" min={0} max={1} step={0.05} value={value} onChange={(e) => onChange(parseFloat(e.target.value))} style={{ flex: 1, accentColor: color, cursor: 'pointer' }} aria-label="Confidence" />
      <span style={{ fontSize: 12, fontWeight: 600, color, fontVariantNumeric: 'tabular-nums', minWidth: 34, textAlign: 'right' }}>{value.toFixed(2)}</span>
    </div>
  );
}

function DateEdit({ value, onChange, label }) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
      <span style={{ fontSize: 9.5, color: C.muted, fontWeight: 600, textTransform: 'uppercase' }}>{label}</span>
      <input type="date" value={value || ''} onChange={(e) => onChange(e.target.value)}
        style={{ fontSize: 11, padding: '3px 5px', border: `1px solid ${C.border}`, borderRadius: 4, color: C.text, fontFamily: 'inherit', outline: 'none', background: C.white }} />
    </div>
  );
}

function TimelinessBadge({ ini }) {
  const t = timeliness(ini);
  if (!t) return null;
  const isDelayed = t === 'delayed';
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 9.5, fontWeight: 700, padding: '2px 7px', borderRadius: 12, background: isDelayed ? C.redSoft : C.greenSoft, color: isDelayed ? C.red : C.green, textTransform: 'uppercase', letterSpacing: 0.3 }}>
      <Clock size={9} /> {isDelayed ? 'Delayed' : 'On Track'}
    </span>
  );
}

function InitiativeRow({ ini, onUpdate, onDelete }) {
  const [addingContributor, setAddingContributor] = useState(false);
  const [newContributor, setNewContributor] = useState('');

  const addContributor = () => {
    const v = newContributor.trim();
    if (v) onUpdate({ contributors: [...ini.contributors, v] });
    setNewContributor('');
    setAddingContributor(false);
  };

  return (
    <div style={{ padding: '10px 12px', borderBottom: `1px solid ${C.borderLight}`, background: C.bg }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <InlineEdit value={ini.title} onChange={(v) => onUpdate({ title: v })} placeholder="Key Initiative…" fontSize={13} fontWeight={500} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 4, flexWrap: 'wrap' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
              <Flag size={10} color={C.primary} />
              <span style={{ fontSize: 9.5, color: C.muted, fontWeight: 600, textTransform: 'uppercase' }}>Driver</span>
              <input value={ini.driver} onChange={(e) => onUpdate({ driver: e.target.value })} placeholder="team/person"
                style={{ fontSize: 11.5, fontWeight: 600, color: C.primary, border: 'none', borderBottom: `1px dashed ${C.border}`, background: 'transparent', outline: 'none', width: Math.max(56, ini.driver.length * 6.5 + 10), fontFamily: 'inherit' }} />
            </div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, flexWrap: 'wrap' }}>
              <Users size={10} color={C.secondary} />
              <span style={{ fontSize: 9.5, color: C.muted, fontWeight: 600, textTransform: 'uppercase' }}>With</span>
              {ini.contributors.map((c, i) => (
                <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 10.5, fontWeight: 500, color: C.secondary, background: C.blueSoft, padding: '2px 6px', borderRadius: 10 }}>
                  {c}
                  <X size={9} style={{ cursor: 'pointer' }} onClick={() => onUpdate({ contributors: ini.contributors.filter((_, idx) => idx !== i) })} />
                </span>
              ))}
              {addingContributor ? (
                <input autoFocus value={newContributor} onChange={(e) => setNewContributor(e.target.value)} onBlur={addContributor}
                  onKeyDown={(e) => { if (e.key === 'Enter') addContributor(); if (e.key === 'Escape') { setNewContributor(''); setAddingContributor(false); } }}
                  placeholder="team name" style={{ fontSize: 10.5, padding: '2px 6px', border: `1px solid ${C.border}`, borderRadius: 10, width: 84, outline: 'none', fontFamily: 'inherit' }} />
              ) : (
                <button onClick={() => setAddingContributor(true)} style={{ fontSize: 10.5, color: C.muted, background: 'none', border: `1px dashed ${C.border}`, borderRadius: 10, padding: '2px 6px', cursor: 'pointer' }}>+ add</button>
              )}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 6, flexWrap: 'wrap' }}>
            <DateEdit label="Start" value={ini.startDate} onChange={(v) => onUpdate({ startDate: v })} />
            <DateEdit label="End" value={ini.endDate} onChange={(v) => onUpdate({ endDate: v })} />
            <TimelinessBadge ini={ini} />
          </div>
        </div>
        <button onClick={onDelete} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted, padding: 3, borderRadius: 4, display: 'flex' }}
          onMouseEnter={(e) => { e.currentTarget.style.background = C.redSoft; e.currentTarget.style.color = C.red; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = C.muted; }}
          title="Delete initiative" aria-label="Delete initiative">
          <Trash2 size={12} />
        </button>
      </div>
      <div style={{ marginTop: 6, display: 'inline-flex', gap: 4, flexWrap: 'wrap' }}>
        {STATUS_ORDER.map((key) => {
          const m = STATUS_META[key];
          const Icon = m.icon;
          const active = ini.status === key;
          return (
            <button key={key} onClick={() => onUpdate({ status: key })} style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 9.5, fontWeight: 600, padding: '2px 7px', borderRadius: 12, cursor: 'pointer', border: `1px solid ${active ? m.color : C.border}`, background: active ? m.bg : C.white, color: active ? m.color : C.muted }}>
              <Icon size={9} /> {m.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function AddInitiativeForm({ onCancel, onAdd }) {
  const [title, setTitle] = useState('');
  const [driver, setDriver] = useState('');
  const [contributorsRaw, setContributorsRaw] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [err, setErr] = useState('');
  const inputStyle = { width: '100%', padding: '8px 10px', fontSize: 13, border: `1px solid ${C.border}`, borderRadius: 5, fontFamily: 'inherit', outline: 'none', background: C.white, color: C.text, boxSizing: 'border-box' };
  const labelStyle = { display: 'block', fontSize: 11, fontWeight: 600, color: C.muted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 };

  const submit = () => {
    if (!title.trim()) { setErr('Initiative title is required.'); return; }
    if (!driver.trim()) { setErr('Every initiative needs one Driver (owner accountable for it).'); return; }
    if (startDate && endDate && endDate < startDate) { setErr('End date cannot be before start date.'); return; }
    const contributors = contributorsRaw.split(',').map(s => s.trim()).filter(Boolean);
    onAdd({ title: title.trim(), driver: driver.trim(), contributors, status: 'todo', startDate: startDate || '', endDate: endDate || '' });
  };

  return (
    <div>
      <div style={{ marginBottom: 14 }}>
        <label style={labelStyle}>Initiative *</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Ship in-app NPS survey" style={inputStyle} />
      </div>
      <div style={{ marginBottom: 14 }}>
        <label style={labelStyle}>Driver * <span style={{ textTransform: 'none', fontWeight: 400 }}>(single owner, accountable)</span></label>
        <input value={driver} onChange={(e) => setDriver(e.target.value)} placeholder="e.g. Growth team / Jane" style={inputStyle} />
      </div>
      <div style={{ marginBottom: 14 }}>
        <label style={labelStyle}>Contributors <span style={{ textTransform: 'none', fontWeight: 400 }}>(comma-separated, optional)</span></label>
        <input value={contributorsRaw} onChange={(e) => setContributorsRaw(e.target.value)} placeholder="e.g. Design, Eng" style={inputStyle} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
        <div><label style={labelStyle}>Start date</label><input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} style={inputStyle} /></div>
        <div><label style={labelStyle}>End date</label><input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} style={inputStyle} /></div>
      </div>
      <div style={{ fontSize: 11, color: C.muted, marginBottom: 14, marginTop: -8 }}>If an end date passes while the initiative isn't Done or Cancelled, it's flagged Delayed automatically.</div>
      {err && <div style={{ padding: '8px 10px', background: C.redSoft, color: C.red, fontSize: 12, borderRadius: 5, marginBottom: 12, border: `1px solid ${C.red}33` }}>{err}</div>}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
        <button onClick={onCancel} style={{ padding: '8px 14px', fontSize: 13, fontWeight: 500, border: `1px solid ${C.border}`, background: C.white, color: C.text, borderRadius: 5, cursor: 'pointer' }}>Cancel</button>
        <button onClick={submit} style={{ padding: '8px 14px', fontSize: 13, fontWeight: 600, border: 'none', background: C.primary, color: C.white, borderRadius: 5, cursor: 'pointer' }}>Add Initiative</button>
      </div>
    </div>
  );
}

function KRCard({ kr, onUpdate, onDelete, onAddIni, onUpdateIni, onDeleteIni, accentColor }) {
  const [expanded, setExpanded] = useState(false);
  const [showAddIni, setShowAddIni] = useState(false);
  const [deleteIniId, setDeleteIniId] = useState(null);
  const isMobile = useIsMobile();

  const progressRaw = calcKRProgress(kr);
  const progress = Math.round(progressRaw);
  const progressClamped = Math.max(0, Math.min(100, progressRaw));
  const color = confColor(kr.confidence);
  const atRisk = kr.confidence < 0.5;
  const overshoot = kr.type === 'percent' && progressRaw > 100;
  const iniCount = kr.initiatives.length;
  const doneCount = kr.initiatives.filter(i => i.status === 'done').length;
  const delayedCount = kr.initiatives.filter(i => timeliness(i) === 'delayed').length;

  return (
    <div style={{ border: `1px solid ${C.border}`, borderRadius: 8, overflow: 'hidden', background: C.white }}>
      <div style={{ padding: '14px 16px', background: atRisk ? C.redSoft : C.white, borderLeft: `3px solid ${color}` }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 8 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 6px', borderRadius: 3, background: kr.type === 'deadline' ? C.blueSoft : '#FFF0E8', color: kr.type === 'deadline' ? C.secondary : '#B85C00', letterSpacing: 0.4, textTransform: 'uppercase' }}>
                {kr.type === 'deadline' ? `Due ${MONTHS[kr.deadlineMonth - 1]} ${kr.deadlineYear}` : `% Target`}
              </span>
              {atRisk && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 10, fontWeight: 600, color: C.red, padding: '2px 6px', borderRadius: 3, background: C.redSoft, border: `1px solid ${C.red}33`, textTransform: 'uppercase', letterSpacing: 0.4 }}>
                  <AlertTriangle size={10} /> At Risk
                </span>
              )}
            </div>
            <InlineEdit value={kr.label} onChange={(v) => onUpdate({ label: v })} placeholder="Key Result…" fontSize={14.5} fontWeight={600} />
          </div>
          <button onClick={onDelete} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted, padding: 4, borderRadius: 4, display: 'flex' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = C.redSoft; e.currentTarget.style.color = C.red; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = C.muted; }}
            title="Delete KR" aria-label="Delete KR">
            <Trash2 size={14} />
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'minmax(0,1fr)' : 'minmax(0,1fr) minmax(0,1fr)', gap: isMobile ? 12 : 16, alignItems: 'center' }}>
          <div>
            {kr.type === 'percent' ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: C.muted, marginBottom: 6, flexWrap: 'wrap' }}>
                <span>From <strong style={{ color: C.text, fontVariantNumeric: 'tabular-nums' }}>{kr.baseline}</strong></span>
                <span style={{ color: C.border }}>→</span>
                <NumericEdit value={kr.current} onChange={(v) => onUpdate({ current: v })} width={58} />
                <span style={{ color: C.border }}>/</span>
                <span>Target <strong style={{ color: C.text, fontVariantNumeric: 'tabular-nums' }}>{kr.target}</strong></span>
                <span style={{ color: C.muted }}>{kr.unit}</span>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: C.muted, marginBottom: 6 }}>
                <span>% complete:</span>
                <NumericEdit value={kr.current} onChange={(v) => onUpdate({ current: Math.max(0, Math.min(100, v)) })} width={58} />
                <span>%</span>
              </div>
            )}
            <div style={{ position: 'relative', height: 6, background: C.borderLight, borderRadius: 3, overflow: 'hidden' }}>
              <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: progressClamped + '%', background: color, transition: 'width 0.3s, background 0.3s' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
              <span style={{ fontSize: 11, color: C.muted }}>{confLabel(kr.confidence)}</span>
              <span style={{ fontSize: 11, fontWeight: 600, color: overshoot ? C.green : color, fontVariantNumeric: 'tabular-nums' }}>{progress}%{overshoot && ' (exceeded)'}</span>
            </div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: C.muted, marginBottom: 4, fontWeight: 500, textTransform: 'uppercase', letterSpacing: 0.5 }}>Confidence</div>
            <ConfidenceSlider value={kr.confidence} onChange={(v) => onUpdate({ confidence: v })} />
          </div>
        </div>
      </div>

      <div style={{ borderTop: `1px solid ${C.borderLight}` }}>
        <button onClick={() => setExpanded(e => !e)} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 16px', background: C.bg, border: 'none', cursor: 'pointer' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            {expanded ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
            Key Initiatives
            <span style={{ fontWeight: 500, textTransform: 'none', color: C.muted }}>
              {iniCount ? `(${doneCount}/${iniCount} done)` : '(none yet)'}
            </span>
            {delayedCount > 0 && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 9.5, fontWeight: 700, color: C.red, background: C.redSoft, padding: '1px 6px', borderRadius: 10, textTransform: 'none' }}>
                <Clock size={9} /> {delayedCount} delayed
              </span>
            )}
          </span>
        </button>
        {expanded && (
          <div>
            {kr.initiatives.map(ini => (
              <InitiativeRow key={ini.id} ini={ini} onUpdate={(u) => onUpdateIni(ini.id, u)} onDelete={() => setDeleteIniId(ini.id)} />
            ))}
            <div style={{ padding: '8px 12px', background: C.bg }}>
              <button onClick={() => setShowAddIni(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '5px 10px', background: C.white, color: accentColor, border: `1px dashed ${accentColor}`, borderRadius: 5, fontSize: 11.5, fontWeight: 600, cursor: 'pointer' }}>
                <Plus size={12} /> Add Initiative for this KR
              </button>
            </div>
          </div>
        )}
      </div>

      <Modal open={showAddIni} onClose={() => setShowAddIni(false)} title={`Add Initiative · ${kr.label || 'this KR'}`}>
        <AddInitiativeForm onCancel={() => setShowAddIni(false)} onAdd={(ini) => { onAddIni(ini); setShowAddIni(false); }} />
      </Modal>

      <Modal open={!!deleteIniId} onClose={() => setDeleteIniId(null)} title="Delete Key Initiative?" maxWidth={400}>
        <div style={{ fontSize: 13, color: C.text, marginBottom: 16 }}>This permanently removes the initiative.</div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <button onClick={() => setDeleteIniId(null)} style={{ padding: '8px 14px', fontSize: 13, fontWeight: 500, border: `1px solid ${C.border}`, background: C.white, color: C.text, borderRadius: 5, cursor: 'pointer' }}>Cancel</button>
          <button onClick={() => { onDeleteIni(deleteIniId); setDeleteIniId(null); }} style={{ padding: '8px 14px', fontSize: 13, fontWeight: 600, border: 'none', background: C.red, color: C.white, borderRadius: 5, cursor: 'pointer' }}>Delete</button>
        </div>
      </Modal>
    </div>
  );
}

function ProjectNameForm({ initialName = '', confirmLabel, onCancel, onConfirm }) {
  const [name, setName] = useState(initialName);
  const [err, setErr] = useState('');

  const submit = () => {
    if (!name.trim()) { setErr('Give the project a name.'); return; }
    onConfirm(name.trim());
  };

  return (
    <div>
      <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>Project name</label>
      <input
        autoFocus value={name} onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') submit(); }}
        placeholder="e.g. Side Business, Career, Q3 Launch"
        style={{ width: '100%', padding: '8px 10px', fontSize: 13, border: `1px solid ${C.border}`, borderRadius: 5, fontFamily: 'inherit', outline: 'none', background: C.white, color: C.text, boxSizing: 'border-box' }}
      />
      {err && <div style={{ color: C.red, fontSize: 12, marginTop: 8 }}>{err}</div>}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
        <button onClick={onCancel} style={{ padding: '8px 14px', fontSize: 13, fontWeight: 500, border: `1px solid ${C.border}`, background: C.white, color: C.text, borderRadius: 5, cursor: 'pointer' }}>Cancel</button>
        <button onClick={submit} style={{ padding: '8px 14px', fontSize: 13, fontWeight: 600, border: 'none', background: C.primary, color: C.white, borderRadius: 5, cursor: 'pointer' }}>{confirmLabel}</button>
      </div>
    </div>
  );
}

function AddKRForm({ onCancel, onAdd }) {
  const [label, setLabel] = useState('');
  const [type, setType] = useState('percent');
  const [baseline, setBaseline] = useState('0');
  const [target, setTarget] = useState('100');
  const [unit, setUnit] = useState('%');
  const [month, setMonth] = useState(12);
  const [year, setYear] = useState(CURRENT_YEAR);
  const [confidence, setConfidence] = useState(0.6);
  const [err, setErr] = useState('');

  const submit = () => {
    if (!label.trim()) { setErr('Key Result needs a measurable statement.'); return; }
    if (type === 'percent') {
      const b = parseFloat(baseline), t = parseFloat(target);
      if (!Number.isFinite(b) || !Number.isFinite(t)) { setErr('Baseline and target must be numbers.'); return; }
      if (b === t) { setErr('Baseline cannot equal target — KR needs movement.'); return; }
      onAdd({ label: label.trim(), type: 'percent', baseline: b, target: t, current: b, unit: unit.trim() || '%', confidence, initiatives: [] });
    } else {
      onAdd({ label: label.trim(), type: 'deadline', deadlineMonth: month, deadlineYear: year, current: 0, confidence, initiatives: [] });
    }
  };

  const inputStyle = { width: '100%', padding: '8px 10px', fontSize: 13, border: `1px solid ${C.border}`, borderRadius: 5, fontFamily: 'inherit', outline: 'none', background: C.white, color: C.text, boxSizing: 'border-box' };
  const labelStyle = { display: 'block', fontSize: 11, fontWeight: 600, color: C.muted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 };

  return (
    <div>
      <div style={{ marginBottom: 14 }}>
        <label style={labelStyle}>Key Result *</label>
        <input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="e.g. Increase activation rate" style={inputStyle} />
        <div style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>Write the outcome, not the activity — measurability comes from the fields below.</div>
      </div>
      <div style={{ marginBottom: 14 }}>
        <label style={labelStyle}>Measured by</label>
        <div style={{ display: 'flex', gap: 8 }}>
          {[{ k: 'percent', l: 'Numeric / % target' }, { k: 'deadline', l: 'Deadline (month/year)' }].map(opt => (
            <button key={opt.k} onClick={() => setType(opt.k)} style={{ flex: 1, padding: '8px 10px', fontSize: 12.5, fontWeight: 500, border: `1px solid ${type === opt.k ? C.primary : C.border}`, background: type === opt.k ? C.redSoft : C.white, color: type === opt.k ? C.primary : C.text, borderRadius: 5, cursor: 'pointer' }}>
              {opt.l}
            </button>
          ))}
        </div>
      </div>
      {type === 'percent' ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 14 }}>
          <div><label style={labelStyle}>Baseline</label><input type="number" value={baseline} onChange={(e) => setBaseline(e.target.value)} style={inputStyle} /></div>
          <div><label style={labelStyle}>Target</label><input type="number" value={target} onChange={(e) => setTarget(e.target.value)} style={inputStyle} /></div>
          <div><label style={labelStyle}>Unit</label><input value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="%, users, Rp" style={inputStyle} /></div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
          <div>
            <label style={labelStyle}>Month</label>
            <select value={month} onChange={(e) => setMonth(parseInt(e.target.value, 10))} style={inputStyle}>
              {MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Year</label>
            <select value={year} onChange={(e) => setYear(parseInt(e.target.value, 10))} style={inputStyle}>
              {[CURRENT_YEAR, CURRENT_YEAR + 1].map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>
      )}
      <div style={{ marginBottom: 14 }}>
        <label style={labelStyle}>Initial confidence: <span style={{ color: confColor(confidence), fontWeight: 700 }}>{confidence.toFixed(2)}</span></label>
        <ConfidenceSlider value={confidence} onChange={setConfidence} />
      </div>
      {err && <div style={{ padding: '8px 10px', background: C.redSoft, color: C.red, fontSize: 12, borderRadius: 5, marginBottom: 12, border: `1px solid ${C.red}33` }}>{err}</div>}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
        <button onClick={onCancel} style={{ padding: '8px 14px', fontSize: 13, fontWeight: 500, border: `1px solid ${C.border}`, background: C.white, color: C.text, borderRadius: 5, cursor: 'pointer' }}>Cancel</button>
        <button onClick={submit} style={{ padding: '8px 14px', fontSize: 13, fontWeight: 600, border: 'none', background: C.primary, color: C.white, borderRadius: 5, cursor: 'pointer' }}>Add Key Result</button>
      </div>
    </div>
  );
}

function ObjectiveTabs({ objectives, activeId, onSelect, onAdd, onDelete, accentColor }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
      {objectives.map((o, idx) => {
        const active = o.id === activeId;
        const title = o.objective.trim() || `Objective ${idx + 1} (untitled)`;
        return (
          <div key={o.id} style={{ position: 'relative', display: 'inline-flex' }}>
            <button onClick={() => onSelect(o.id)} title={title} style={{
              maxWidth: 220, padding: '7px 28px 7px 14px', fontSize: 12.5, fontWeight: 600,
              border: `1px solid ${active ? accentColor : C.border}`, borderRadius: 16, cursor: 'pointer',
              background: active ? accentColor : C.white, color: active ? C.white : C.text,
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
            }}>
              {title}
            </button>
            {objectives.length > 1 && (
              <button onClick={(e) => { e.stopPropagation(); onDelete(o.id); }} title="Delete objective" style={{
                position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', cursor: 'pointer', color: active ? C.white : C.muted,
                display: 'flex', padding: 0, opacity: 0.8
              }}>
                <X size={12} />
              </button>
            )}
          </div>
        );
      })}
      <button onClick={onAdd} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '7px 12px', fontSize: 12.5, fontWeight: 600, border: `1px dashed ${accentColor}`, borderRadius: 16, cursor: 'pointer', background: 'transparent', color: accentColor }}>
        <Plus size={12} /> New Objective
      </button>
    </div>
  );
}

function ProjectTabs({ projects, activeId, onSelect, onAdd, onRename, onDelete }) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
      {projects.map((p, idx) => {
        const active = p.id === activeId;
        const color = PROJECT_COLORS[idx % PROJECT_COLORS.length];
        return (
          <div key={p.id} style={{ position: 'relative', display: 'inline-flex' }}>
            <button onClick={() => onSelect(p.id)} title={p.name} style={{
              maxWidth: 180, padding: projects.length > 1 ? '7px 44px 7px 18px' : '7px 18px', fontSize: 13, fontWeight: 600,
              border: 'none', borderRadius: 6, cursor: 'pointer',
              background: active ? color : 'transparent', color: active ? C.white : C.muted,
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', transition: 'all 0.15s'
            }}>
              {p.name}
            </button>
            {projects.length > 0 && (
              <div style={{ position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)', display: 'flex', gap: 4 }}>
                <button onClick={(e) => { e.stopPropagation(); onRename(p.id); }} title="Rename project" style={{ background: 'none', border: 'none', cursor: 'pointer', color: active ? C.white : C.muted, display: 'flex', padding: 0, opacity: 0.8 }}>
                  <Pencil size={10} />
                </button>
                {projects.length > 1 && (
                  <button onClick={(e) => { e.stopPropagation(); onDelete(p.id); }} title="Delete project" style={{ background: 'none', border: 'none', cursor: 'pointer', color: active ? C.white : C.muted, display: 'flex', padding: 0, opacity: 0.8 }}>
                    <X size={11} />
                  </button>
                )}
              </div>
            )}
          </div>
        );
      })}
      <button onClick={onAdd} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '7px 14px', fontSize: 12.5, fontWeight: 600, border: `1px dashed ${C.border}`, borderRadius: 6, cursor: 'pointer', background: 'transparent', color: C.muted }}>
        <Plus size={12} /> New Project
      </button>
    </div>
  );
}

function DirectorView({ state, onJump }) {
  const allObjs = state.projects.flatMap(p => p.objectives.map(o => ({ ...o, projectId: p.id })));
  const allKRs = allObjs.flatMap(o => o.krs);
  const allInis = allKRs.flatMap(k => k.initiatives);

  const onTrack = allKRs.filter(k => k.confidence >= 0.7).length;
  const watch = allKRs.filter(k => k.confidence >= 0.5 && k.confidence < 0.7).length;
  const atRisk = allKRs.filter(k => k.confidence < 0.5).length;
  const delayed = allInis.filter(i => timeliness(i) === 'delayed').length;
  const avgConf = allKRs.length ? allKRs.reduce((s, k) => s + k.confidence, 0) / allKRs.length : 0;
  const total = allKRs.length || 1;

  const StatCard = ({ label, value, color, sub }) => (
    <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 10, padding: '14px 16px', flex: '1 1 130px', minWidth: 130 }}>
      <div style={{ fontSize: 10.5, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 700, color: color || C.text, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>{sub}</div>}
    </div>
  );

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
}

const COACH_STYLE = {
  warning: { icon: AlertTriangle, color: C.red, bg: C.redSoft },
  info: { icon: Lightbulb, color: C.secondary, bg: C.blueSoft },
  success: { icon: CheckCircle2, color: C.green, bg: C.greenSoft },
};

function CoachPanel({ objective, krs, checkins, weekNumber }) {
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
}

function EmptyState({ onAdd, onSample, onWizard, accentColor }) {
  return (
    <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 10, padding: '48px 24px', textAlign: 'center' }}>
      <div style={{ width: 48, height: 48, borderRadius: 12, background: C.redSoft, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}><Target size={22} color={C.primary} /></div>
      <div style={{ fontSize: 18, fontWeight: 600, color: C.text, marginBottom: 6 }}>No OKR set for this scope yet</div>
      <div style={{ fontSize: 13, color: C.muted, maxWidth: 460, margin: '0 auto 24px', lineHeight: 1.5 }}>
        Start with an aspirational Objective, then add up to 5 measurable Key Results — each one breaks down into the Key Initiatives that drive it. You can add more Objectives anytime.
      </div>
      <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
        {onWizard && (
          <button onClick={onWizard} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 16px', background: accentColor, color: C.white, border: 'none', borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}><Target size={14} /> Mulai dengan Panduan</button>
        )}
        <button onClick={onAdd} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 16px', background: onWizard ? C.white : accentColor, color: onWizard ? C.text : C.white, border: onWizard ? `1px solid ${C.border}` : 'none', borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}><Plus size={14} /> Add your first Key Result</button>
        <button onClick={onSample} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 16px', background: C.white, color: C.text, border: `1px solid ${C.border}`, borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}><Sparkles size={14} /> Load sample data</button>
      </div>
    </div>
  );
}

export default function OKRDashboard({ user, onLogout }) {
  const [state, setState] = useState(DEFAULT_STATE);
  const [loaded, setLoaded] = useState(false);
  const [showAddKR, setShowAddKR] = useState(false);
  const [showCheckIn, setShowCheckIn] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [deleteKRTarget, setDeleteKRTarget] = useState(null);
  const [deleteObjTarget, setDeleteObjTarget] = useState(null);
  const [checkInDraft, setCheckInDraft] = useState('');
  const [copied, setCopied] = useState(false);
  const [storageWarning, setStorageWarning] = useState('');
  const [showWizard, setShowWizard] = useState(false);
  const [migrated, setMigrated] = useState(false);
  const [checkins, setCheckins] = useState([]);
  const [showWeeklyCheckIn, setShowWeeklyCheckIn] = useState(false);
  const [showAddProject, setShowAddProject] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [renameProjectTarget, setRenameProjectTarget] = useState(null);
  const [deleteProjectTarget, setDeleteProjectTarget] = useState(null);
  const saveTimer = useRef(null);

  // Load order: server state (source of truth once signed in) → else a
  // one-time migration from this browser's localStorage (pre-auth data) →
  // else fresh wizard for first-time users.
  useEffect(() => {
    (async () => {
      let localParsed = null;
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) localParsed = JSON.parse(raw);
      } catch (e) {
        console.warn('OKR dashboard: could not read local backup', e);
      }

      try {
        const { state: remoteState } = await api.getState();
        if (remoteState) {
          setState(migrateState(remoteState));
        } else if (localParsed) {
          const merged = migrateState(localParsed);
          setState(merged);
          await api.putState(merged);
          setMigrated(true);
        } else if (!localStorage.getItem('okr-wizard-done')) {
          setShowWizard(true);
        }
      } catch (e) {
        setStorageWarning('Could not reach the server — showing your local copy. Changes may not sync.');
        if (localParsed) setState(migrateState(localParsed));
      } finally {
        setLoaded(true);
      }
    })();

    api.getCheckins().then((r) => setCheckins(r.checkins)).catch(() => {});
  }, []);

  const refreshCheckins = () => { api.getCheckins().then((r) => setCheckins(r.checkins)).catch(() => {}); };

  useEffect(() => {
    if (!loaded) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) { /* best-effort local backup */ }
      try {
        await api.putState(state);
        setStorageWarning('');
      } catch (e) {
        setStorageWarning('Could not save to server — changes are kept locally until reconnected.');
      }
    }, 400);
    return () => { if (saveTimer.current) clearTimeout(saveTimer.current); };
  }, [state, loaded]);

  const projectIndex = Math.max(0, state.projects.findIndex(p => p.id === state.activeProjectId));
  const activeProject = state.projects[projectIndex] || state.projects[0];
  const objectives = activeProject.objectives;
  const objective = objectives.find(o => o.id === activeProject.activeObjectiveId) || objectives[0];
  const krs = objective ? objective.krs : [];
  const allInitiatives = krs.flatMap(k => k.initiatives);
  const overallConf = krs.length ? krs.reduce((s, k) => s + k.confidence, 0) / krs.length : 0;
  const atRiskCount = krs.filter(k => k.confidence < 0.5).length;
  const delayedCount = allInitiatives.filter(i => timeliness(i) === 'delayed').length;
  const accentColor = PROJECT_COLORS[projectIndex % PROJECT_COLORS.length];

  const updateProject = (projectId, updater) => setState(s => ({
    ...s, projects: s.projects.map(p => p.id === projectId ? updater(p) : p)
  }));

  const updateObjField = (field, value) => updateProject(activeProject.id, (p) => ({
    ...p, objectives: p.objectives.map(o => o.id === objective.id ? { ...o, [field]: value } : o)
  }));

  const selectObjective = (id) => updateProject(activeProject.id, (p) => ({ ...p, activeObjectiveId: id }));

  const jumpTo = (projectId, objId) => setState(s => ({
    ...s, activeProjectId: projectId, viewMode: 'working',
    projects: s.projects.map(p => p.id === projectId ? { ...p, activeObjectiveId: objId } : p)
  }));

  const addObjective = () => {
    updateProject(activeProject.id, (p) => {
      const newObj = { id: newId(p.id + 'o', p.objectives), objective: '', whyNow: '', krs: [] };
      return { ...p, objectives: [...p.objectives, newObj], activeObjectiveId: newObj.id };
    });
  };

  const confirmDeleteObjective = () => {
    if (!deleteObjTarget) return;
    updateProject(activeProject.id, (p) => {
      const remaining = p.objectives.filter(o => o.id !== deleteObjTarget);
      const nextActive = p.activeObjectiveId === deleteObjTarget ? (remaining[0] ? remaining[0].id : null) : p.activeObjectiveId;
      return { ...p, objectives: remaining, activeObjectiveId: nextActive };
    });
    setDeleteObjTarget(null);
  };

  const updateKR = (id, updates) => updateProject(activeProject.id, (p) => ({
    ...p, objectives: p.objectives.map(o => o.id === objective.id ? { ...o, krs: o.krs.map(k => k.id === id ? { ...k, ...updates } : k) } : o)
  }));

  const addKR = (kr) => {
    updateProject(activeProject.id, (p) => {
      const obj = p.objectives.find(o => o.id === activeProject.activeObjectiveId);
      if (!obj || obj.krs.length >= 5) return p;
      return { ...p, objectives: p.objectives.map(o => o.id === obj.id ? { ...o, krs: [...o.krs, { id: newId(obj.id + 'k', o.krs), ...kr }] } : o) };
    });
    setShowAddKR(false);
  };

  const confirmDeleteKR = () => {
    if (!deleteKRTarget) return;
    updateProject(activeProject.id, (p) => ({
      ...p, objectives: p.objectives.map(o => o.id === objective.id ? { ...o, krs: o.krs.filter(k => k.id !== deleteKRTarget) } : o)
    }));
    setDeleteKRTarget(null);
  };

  const mutateKRInitiatives = (krId, fn) => {
    updateProject(activeProject.id, (p) => ({
      ...p,
      objectives: p.objectives.map(o => o.id === objective.id
        ? { ...o, krs: o.krs.map(k => k.id === krId ? { ...k, initiatives: fn(k.initiatives, k) } : k) }
        : o)
    }));
  };
  const addIniToKR = (krId, ini) => mutateKRInitiatives(krId, (inis) => [...inis, { id: newId(krId + 'i', inis), ...ini }]);
  const updateIniInKR = (krId, iniId, updates) => mutateKRInitiatives(krId, (inis) => inis.map(i => i.id === iniId ? { ...i, ...updates } : i));
  const deleteIniFromKR = (krId, iniId) => mutateKRInitiatives(krId, (inis) => inis.filter(i => i.id !== iniId));

  const loadSample = () => updateProject(activeProject.id, (p) =>
    projectIndex === 0
      ? { ...p, objectives: SAMPLE_PERSONAL_OBJECTIVES, activeObjectiveId: SAMPLE_PERSONAL_OBJECTIVES[0].id }
      : { ...p, objectives: SAMPLE_TEAM_OBJECTIVES, activeObjectiveId: SAMPLE_TEAM_OBJECTIVES[0].id }
  );

  const completeWizard = (obj) => {
    updateProject(activeProject.id, (p) => ({ ...p, objectives: [obj], activeObjectiveId: obj.id }));
    try { localStorage.setItem('okr-wizard-done', '1'); } catch (e) {}
    setShowWizard(false);
  };

  const skipWizard = () => {
    try { localStorage.setItem('okr-wizard-done', '1'); } catch (e) {}
    setShowWizard(false);
  };

  const handleReset = () => {
    setState(DEFAULT_STATE);
    try { localStorage.removeItem(STORAGE_KEY); } catch (e) {}
    setShowReset(false);
  };

  // Project management — create/rename/delete, with the Free-tier project
  // count gate. Billing itself (P3) isn't built; this is just the limit +
  // upsell messaging so the paywall UX can be tested before payments exist.
  const addProject = (name) => {
    if (state.projects.length >= FREE_PROJECT_LIMIT) { setShowUpgradeModal(true); return; }
    const id = newProjectId();
    const obj = { id: id + 'o1', objective: '', whyNow: '', krs: [] };
    setState(s => ({
      ...s,
      activeProjectId: id,
      projects: [...s.projects, { id, name: name.trim() || 'New Project', objectives: [obj], activeObjectiveId: obj.id }]
    }));
    setShowAddProject(false);
  };

  const renameProject = (id, name) => {
    setState(s => ({ ...s, projects: s.projects.map(p => p.id === id ? { ...p, name: name.trim() || p.name } : p) }));
    setRenameProjectTarget(null);
  };

  const confirmDeleteProject = () => {
    if (!deleteProjectTarget) return;
    setState(s => {
      const remaining = s.projects.filter(p => p.id !== deleteProjectTarget);
      if (remaining.length === 0) return s;
      const nextActive = s.activeProjectId === deleteProjectTarget ? remaining[0].id : s.activeProjectId;
      return { ...s, activeProjectId: nextActive, projects: remaining };
    });
    setDeleteProjectTarget(null);
  };

  const fmtKRTarget = (k) => k.type === 'deadline' ? `Due ${MONTHS[k.deadlineMonth - 1]} ${k.deadlineYear}` : `${k.current} → ${k.target} ${k.unit}`;

  const buildCheckIn = () => {
    const fmtScopeBlock = (sc, label) => {
      if (!sc.objectives.some(o => o.objective || o.krs.length)) return `_(${label} OKR not set)_`;
      const blocks = sc.objectives.map((o, oi) => {
        if (!o.objective && !o.krs.length) return null;
        const lines = [`### Objective ${oi + 1}: ${o.objective || '_(not set)_'}`];
        if (o.whyNow) lines.push(`**Why now**: ${o.whyNow}`);
        o.krs.forEach((k, i) => {
          const p = Math.round(calcKRProgress(k));
          lines.push(`\n**KR${i + 1}** ${confEmoji(k.confidence)} ${k.label} — ${fmtKRTarget(k)} — **${p}%** (confidence ${k.confidence.toFixed(2)})`);
          k.initiatives.forEach(ini => {
            const m = STATUS_META[ini.status];
            const contrib = ini.contributors.length ? ` w/ ${ini.contributors.join(', ')}` : '';
            const t = timeliness(ini);
            const tTag = t ? ` [${t === 'delayed' ? 'DELAYED' : 'on track'}]` : '';
            const dates = (ini.startDate || ini.endDate) ? ` (${fmtDate(ini.startDate) || '?'}–${fmtDate(ini.endDate) || '?'})` : '';
            lines.push(`  - [${m.label}]${tTag} ${ini.title}${dates} — Driver: ${ini.driver}${contrib}`);
          });
        });
        return lines.join('\n');
      }).filter(Boolean);
      return blocks.join('\n\n');
    };

    const allKRsOf = (sc) => sc.objectives.flatMap(o => o.krs);
    const atRiskOf = (sc, tag) => allKRsOf(sc).filter(k => k.confidence < 0.5).map(k => `- [${tag}] ${k.label} — confidence ${k.confidence.toFixed(2)}`);
    const onTrackOf = (sc, tag) => allKRsOf(sc).filter(k => k.confidence >= 0.7).map(k => `- [${tag}] ${k.label} — confidence ${k.confidence.toFixed(2)}`);
    const delayedOf = (sc, tag) => sc.objectives.flatMap(o => o.krs.flatMap(k => k.initiatives.filter(i => timeliness(i) === 'delayed').map(i => `- [${tag}] ${i.title} (due ${fmtDate(i.endDate)}) — Driver: ${i.driver}`)));

    const tagOf = (p) => p.name.trim() || 'Untitled';
    const confOf = (sc) => { const k = allKRsOf(sc); return k.length ? k.reduce((a, x) => a + x.confidence, 0) / k.length : 0; };

    const allAtRisk = state.projects.flatMap(p => atRiskOf(p, tagOf(p)));
    const allOnTrack = state.projects.flatMap(p => onTrackOf(p, tagOf(p)));
    const allDelayed = state.projects.flatMap(p => delayedOf(p, tagOf(p)));
    const overallLines = state.projects.map(p => {
      const c = confOf(p);
      return `- **${p.name}**: ${confEmoji(c)} ${c.toFixed(2)} confidence (${confLabel(c)})`;
    }).join('\n');
    const progressSections = state.projects.map(p => `## ${p.name} OKR Progress\n${fmtScopeBlock(p, p.name)}`).join('\n\n');

    return `# Weekly Check-in — Week ${state.weekNumber}

## Overall Status
${overallLines}

${progressSections}

## At-Risk KRs (${allAtRisk.length})
${allAtRisk.length ? allAtRisk.join('\n') : '_None — all KRs at watch or better._'}

## Delayed Initiatives (${allDelayed.length})
${allDelayed.length ? allDelayed.join('\n') : '_None — all initiatives on track._'}

## On Track KRs (${allOnTrack.length})
${allOnTrack.length ? allOnTrack.join('\n') : '_None at high confidence yet._'}

## Plan Next Week
- [ ] _Top intervention for at-risk KR_
- [ ] _Unblock the most delayed initiative_
- [ ] _One thing to stop doing_

## Exec Summary
_(2–3 sentences for leadership: where we are, what's at stake, what we're doing about it.)_
`;
  };

  const openCheckIn = () => { setCheckInDraft(buildCheckIn()); setCopied(false); setShowCheckIn(true); };
  const copyCheckIn = async () => {
    try { await navigator.clipboard.writeText(checkInDraft); setCopied(true); setTimeout(() => setCopied(false), 2000); }
    catch (e) { setCopied(false); }
  };

  const empty = objective && !objective.objective && krs.length === 0 && objectives.length === 1;
  const isMaxKR = krs.length >= 5;
  const isDirector = state.viewMode === 'exec';
  const isMobile = useIsMobile();
  const padX = isMobile ? 14 : 24;

  return (
    <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', background: C.bg, minHeight: '100vh', color: C.text, fontSize: 14 }}>
      <div style={{ background: C.white, borderBottom: `1px solid ${C.border}`, padding: isMobile ? '12px 14px' : '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: isMobile ? 10 : 16, flexWrap: 'wrap', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Logo size={28} />
          <div>
            <div style={{ fontSize: 16, fontWeight: 800, lineHeight: 1.1, letterSpacing: -0.3 }}>Own<span style={{ color: C.primary }}>the</span>Way</div>
            <div style={{ fontSize: 11, color: C.muted }}>{isDirector ? 'Director View · all Objectives at a glance' : 'Working View · Objective → up to 5 KRs → Initiatives'}</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <div style={{ display: 'inline-flex', background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: 3 }}>
            <button onClick={() => setState(s => ({ ...s, viewMode: 'working' }))} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '6px 12px', fontSize: 12.5, fontWeight: 600, border: 'none', borderRadius: 6, cursor: 'pointer', background: !isDirector ? C.white : 'transparent', color: !isDirector ? C.text : C.muted, boxShadow: !isDirector ? '0 1px 2px rgba(0,0,0,0.06)' : 'none' }}>
              <ListChecks size={13} /> Working
            </button>
            <button onClick={() => setState(s => ({ ...s, viewMode: 'exec' }))} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '6px 12px', fontSize: 12.5, fontWeight: 600, border: 'none', borderRadius: 6, cursor: 'pointer', background: isDirector ? C.white : 'transparent', color: isDirector ? C.text : C.muted, boxShadow: isDirector ? '0 1px 2px rgba(0,0,0,0.06)' : 'none' }}>
              <LayoutDashboard size={13} /> Director
            </button>
          </div>
          {!isDirector && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 10px', background: C.bg, border: `1px solid ${C.border}`, borderRadius: 6 }}>
              <Calendar size={13} color={C.muted} />
              <span style={{ fontSize: 12, color: C.muted }}>Week</span>
              <select value={state.weekNumber} onChange={(e) => setState(s => ({ ...s, weekNumber: parseInt(e.target.value, 10) }))} style={{ fontSize: 13, fontWeight: 600, color: C.text, border: 'none', background: 'transparent', outline: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
                {Array.from({ length: 13 }, (_, i) => i + 1).map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
          )}
          {!isDirector && objective && (
            <button onClick={() => setShowWeeklyCheckIn(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 12px', background: C.primary, color: C.white, border: 'none', borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
              <Check size={13} /> Weekly Check-in
              {checkins.some((c) => c.objectiveId === objective.id && c.weekNumber === state.weekNumber) && (
                <span style={{ background: 'rgba(255,255,255,0.25)', borderRadius: 4, padding: '1px 5px', fontSize: 10 }}>✓</span>
              )}
            </button>
          )}
          <button onClick={openCheckIn} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 12px', background: C.white, color: C.text, border: `1px solid ${C.border}`, borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}><FileText size={13} /> Export Report</button>
          {!isDirector && (
            <button onClick={() => setShowReset(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 10px', background: C.white, color: C.muted, border: `1px solid ${C.border}`, borderRadius: 6, fontSize: 12, cursor: 'pointer' }} title="Reset all data"><RotateCcw size={13} /></button>
          )}
          {user && (
            <button onClick={onLogout} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 10px', background: C.white, color: C.muted, border: `1px solid ${C.border}`, borderRadius: 6, fontSize: 12, cursor: 'pointer' }} title={`Sign out (${user.email})`}>Sign out</button>
          )}
        </div>
      </div>

      {migrated && (
        <div style={{ padding: '8px 24px', background: C.greenSoft, color: '#1E7A47', fontSize: 12, borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>✓ Imported the OKRs saved in this browser into your account.</span>
          <button onClick={() => setMigrated(false)} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontSize: 14, lineHeight: 1 }}>×</button>
        </div>
      )}
      {storageWarning && <div style={{ padding: '8px 24px', background: C.yellowSoft, color: '#8B6914', fontSize: 12, borderBottom: `1px solid ${C.border}` }}>⚠ {storageWarning}</div>}

      {isDirector ? (
        <div style={{ padding: `20px ${padX}px 40px ${padX}px` }}>
          <DirectorView state={state} onJump={jumpTo} />
          <div style={{ marginTop: 16, fontSize: 11, color: C.muted, textAlign: 'center' }}>Click any Objective above to open it in Working View.</div>
        </div>
      ) : (
        <>
          <div style={{ padding: `20px ${padX}px 0 ${padX}px`, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'inline-flex', background: C.white, border: `1px solid ${C.border}`, borderRadius: 8, padding: 3, alignSelf: 'flex-start' }}>
              <ProjectTabs
                projects={state.projects}
                activeId={state.activeProjectId}
                onSelect={(id) => setState(s => ({ ...s, activeProjectId: id }))}
                onAdd={() => state.projects.length >= FREE_PROJECT_LIMIT ? setShowUpgradeModal(true) : setShowAddProject(true)}
                onRename={(id) => setRenameProjectTarget(id)}
                onDelete={(id) => setDeleteProjectTarget(id)}
              />
            </div>
            <ObjectiveTabs
              objectives={objectives}
              activeId={activeProject.activeObjectiveId}
              onSelect={selectObjective}
              onAdd={addObjective}
              onDelete={(id) => setDeleteObjTarget(id)}
              accentColor={accentColor}
            />
          </div>

          <div style={{ padding: `16px ${padX}px 40px ${padX}px` }}>
            {loaded && empty ? (
              <EmptyState onAdd={() => setShowAddKR(true)} onSample={loadSample} onWizard={projectIndex === 0 ? () => setShowWizard(true) : undefined} accentColor={accentColor} />
            ) : objective ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 10, overflow: 'hidden' }}>
                  <div style={{ padding: '18px 20px', borderTop: `3px solid ${accentColor}` }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: isMobile ? 12 : 16, justifyContent: 'space-between', flexDirection: isMobile ? 'column' : 'row' }}>
                      <div style={{ flex: 1, minWidth: 0, width: isMobile ? '100%' : undefined }}>
                        <div style={{ fontSize: 10, fontWeight: 700, color: accentColor, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 4 }}>
                          {activeProject.name} Objective <span style={{ fontWeight: 400, textTransform: 'none', color: C.muted, letterSpacing: 0 }}>— aspirational, not a task</span>
                        </div>
                        <InlineEdit value={objective.objective} onChange={(v) => updateObjField('objective', v)} placeholder="What's the bold, inspiring future state we're reaching for — something we'd be proud of even if we fall short?" fontSize={19} fontWeight={600} />
                        <div style={{ marginTop: 6 }}>
                          <span style={{ fontSize: 10, color: C.muted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, marginRight: 6 }}>Why now</span>
                          <InlineEdit value={objective.whyNow} onChange={(v) => updateObjField('whyNow', v)} placeholder="Why does this matter this quarter specifically?" fontSize={13} color={C.muted} multiline />
                        </div>
                      </div>
                      <div style={{ minWidth: isMobile ? 0 : 170, textAlign: isMobile ? 'left' : 'right' }}>
                        <div style={{ fontSize: 10, color: C.muted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>Overall confidence</div>
                        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: isMobile ? 'flex-start' : 'flex-end', gap: 6 }}>
                          <span style={{ fontSize: 32, fontWeight: 700, color: confColor(overallConf), lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{krs.length ? overallConf.toFixed(2) : '—'}</span>
                          {krs.length > 0 && <span style={{ fontSize: 12, fontWeight: 600, color: confColor(overallConf) }}>{confLabel(overallConf)}</span>}
                        </div>
                        <div style={{ display: 'flex', gap: 6, marginTop: 8, justifyContent: isMobile ? 'flex-start' : 'flex-end', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: 11, color: C.muted }}>{krs.length}/5 KRs</span>
                          <span style={{ fontSize: 11, color: C.muted }}>· {allInitiatives.length} initiatives</span>
                          {atRiskCount > 0 && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 600, color: C.red, padding: '1px 6px', borderRadius: 3, background: C.redSoft }}><AlertTriangle size={10} /> {atRiskCount} at risk</span>}
                          {delayedCount > 0 && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 600, color: C.red, padding: '1px 6px', borderRadius: 3, background: C.redSoft }}><Clock size={10} /> {delayedCount} delayed</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <CoachPanel objective={objective} krs={krs} checkins={checkins} weekNumber={state.weekNumber} />

                {krs.length === 0 ? (
                  <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 10, padding: '24px 16px', textAlign: 'center' }}>
                    <div style={{ fontSize: 13, color: C.muted, marginBottom: 12 }}>No Key Results yet. Add up to 5 measurable outcomes — each can have its own Key Initiatives.</div>
                    <button onClick={() => setShowAddKR(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: accentColor, color: C.white, border: 'none', borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}><Plus size={14} /> Add Key Result</button>
                  </div>
                ) : (
                  <>
                    {krs.map(kr => (
                      <KRCard
                        key={kr.id}
                        kr={kr}
                        accentColor={accentColor}
                        onUpdate={(u) => updateKR(kr.id, u)}
                        onDelete={() => setDeleteKRTarget(kr.id)}
                        onAddIni={(ini) => addIniToKR(kr.id, ini)}
                        onUpdateIni={(iniId, u) => updateIniInKR(kr.id, iniId, u)}
                        onDeleteIni={(iniId) => deleteIniFromKR(kr.id, iniId)}
                      />
                    ))}
                    <button onClick={() => !isMaxKR && setShowAddKR(true)} disabled={isMaxKR} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 14px', background: isMaxKR ? C.borderLight : C.white, color: isMaxKR ? C.muted : accentColor, border: `1px dashed ${isMaxKR ? C.border : accentColor}`, borderRadius: 8, fontSize: 12.5, fontWeight: 600, cursor: isMaxKR ? 'not-allowed' : 'pointer', alignSelf: 'flex-start' }}>
                      <Plus size={14} /> {isMaxKR ? 'Max 5 Key Results reached' : 'Add Key Result'}
                    </button>
                  </>
                )}
              </div>
            ) : null}

            <div style={{ marginTop: 16, fontSize: 11, color: C.muted, textAlign: 'center' }}>
              Pairs with the <code style={{ background: C.white, padding: '1px 5px', borderRadius: 3, border: `1px solid ${C.border}`, fontSize: 10 }}>okr-coach</code> workflow — draft OKRs in Claude, track here.
            </div>
          </div>
        </>
      )}

      <Modal open={showAddKR} onClose={() => setShowAddKR(false)} title={`Add Key Result · ${objective ? (objective.objective || 'this Objective') : ''}`}>
        <AddKRForm onCancel={() => setShowAddKR(false)} onAdd={addKR} />
      </Modal>

      <Modal open={!!deleteKRTarget} onClose={() => setDeleteKRTarget(null)} title="Delete Key Result?" maxWidth={420}>
        <div style={{ fontSize: 13, color: C.text, marginBottom: 16 }}>This removes the KR <strong>and all Key Initiatives nested under it</strong>. This cannot be undone.</div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <button onClick={() => setDeleteKRTarget(null)} style={{ padding: '8px 14px', fontSize: 13, fontWeight: 500, border: `1px solid ${C.border}`, background: C.white, color: C.text, borderRadius: 5, cursor: 'pointer' }}>Cancel</button>
          <button onClick={confirmDeleteKR} style={{ padding: '8px 14px', fontSize: 13, fontWeight: 600, border: 'none', background: C.red, color: C.white, borderRadius: 5, cursor: 'pointer' }}>Delete</button>
        </div>
      </Modal>

      <Modal open={!!deleteObjTarget} onClose={() => setDeleteObjTarget(null)} title="Delete this Objective?" maxWidth={420}>
        <div style={{ fontSize: 13, color: C.text, marginBottom: 16 }}>This removes the Objective <strong>and every Key Result and Key Initiative under it</strong>. This cannot be undone.</div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <button onClick={() => setDeleteObjTarget(null)} style={{ padding: '8px 14px', fontSize: 13, fontWeight: 500, border: `1px solid ${C.border}`, background: C.white, color: C.text, borderRadius: 5, cursor: 'pointer' }}>Cancel</button>
          <button onClick={confirmDeleteObjective} style={{ padding: '8px 14px', fontSize: 13, fontWeight: 600, border: 'none', background: C.red, color: C.white, borderRadius: 5, cursor: 'pointer' }}>Delete Objective</button>
        </div>
      </Modal>

      <Modal open={showAddProject} onClose={() => setShowAddProject(false)} title="New Project" maxWidth={420}>
        <ProjectNameForm confirmLabel="Create Project" onCancel={() => setShowAddProject(false)} onConfirm={addProject} />
      </Modal>

      <Modal open={!!renameProjectTarget} onClose={() => setRenameProjectTarget(null)} title="Rename Project" maxWidth={420}>
        <ProjectNameForm
          initialName={state.projects.find(p => p.id === renameProjectTarget)?.name || ''}
          confirmLabel="Save"
          onCancel={() => setRenameProjectTarget(null)}
          onConfirm={(name) => renameProject(renameProjectTarget, name)}
        />
      </Modal>

      <Modal open={!!deleteProjectTarget} onClose={() => setDeleteProjectTarget(null)} title="Delete this Project?" maxWidth={420}>
        <div style={{ fontSize: 13, color: C.text, marginBottom: 16 }}>This removes <strong>every Objective, Key Result, and Key Initiative</strong> in this project. This cannot be undone.</div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <button onClick={() => setDeleteProjectTarget(null)} style={{ padding: '8px 14px', fontSize: 13, fontWeight: 500, border: `1px solid ${C.border}`, background: C.white, color: C.text, borderRadius: 5, cursor: 'pointer' }}>Cancel</button>
          <button onClick={confirmDeleteProject} style={{ padding: '8px 14px', fontSize: 13, fontWeight: 600, border: 'none', background: C.red, color: C.white, borderRadius: 5, cursor: 'pointer' }}>Delete Project</button>
        </div>
      </Modal>

      <Modal open={showUpgradeModal} onClose={() => setShowUpgradeModal(false)} title="Free plan limit reached" maxWidth={420}>
        <div style={{ fontSize: 13, color: C.text, marginBottom: 16, lineHeight: 1.6 }}>
          The Free plan includes up to <strong>{FREE_PROJECT_LIMIT} projects</strong>. Upgrade to Pro for unlimited projects, plus advanced analytics and AI coaching.
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <button onClick={() => setShowUpgradeModal(false)} style={{ padding: '8px 14px', fontSize: 13, fontWeight: 500, border: `1px solid ${C.border}`, background: C.white, color: C.text, borderRadius: 5, cursor: 'pointer' }}>Maybe later</button>
          <button disabled style={{ padding: '8px 14px', fontSize: 13, fontWeight: 600, border: 'none', background: C.border, color: C.muted, borderRadius: 5, cursor: 'not-allowed' }} title="Billing isn't live yet">Upgrade to Pro (coming soon)</button>
        </div>
      </Modal>

      <Modal open={showReset} onClose={() => setShowReset(false)} title="Reset all data?" maxWidth={420}>
        <div style={{ fontSize: 13, color: C.text, marginBottom: 16 }}>This clears <strong>every project, Objective, and Key Result</strong> and resets week to 1. This cannot be undone.</div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <button onClick={() => setShowReset(false)} style={{ padding: '8px 14px', fontSize: 13, fontWeight: 500, border: `1px solid ${C.border}`, background: C.white, color: C.text, borderRadius: 5, cursor: 'pointer' }}>Cancel</button>
          <button onClick={handleReset} style={{ padding: '8px 14px', fontSize: 13, fontWeight: 600, border: 'none', background: C.red, color: C.white, borderRadius: 5, cursor: 'pointer' }}>Reset everything</button>
        </div>
      </Modal>

      <Modal open={showCheckIn} onClose={() => setShowCheckIn(false)} title={`Weekly check-in — Week ${state.weekNumber}`} maxWidth={760}>
        <div style={{ fontSize: 12, color: C.muted, marginBottom: 10 }}>Edit before copying. Paste into Sheets / Notion / Slack.</div>
        <textarea value={checkInDraft} onChange={(e) => setCheckInDraft(e.target.value)} style={{ width: '100%', minHeight: 400, padding: 12, fontSize: 12, fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', border: `1px solid ${C.border}`, borderRadius: 6, resize: 'vertical', outline: 'none', color: C.text, background: C.bg, lineHeight: 1.5, boxSizing: 'border-box' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
          <button onClick={() => setCheckInDraft(buildCheckIn())} style={{ padding: '7px 12px', fontSize: 12, color: C.muted, background: 'transparent', border: `1px solid ${C.border}`, borderRadius: 5, cursor: 'pointer' }}>Regenerate from current data</button>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => setShowCheckIn(false)} style={{ padding: '8px 14px', fontSize: 13, fontWeight: 500, border: `1px solid ${C.border}`, background: C.white, color: C.text, borderRadius: 5, cursor: 'pointer' }}>Close</button>
            <button onClick={copyCheckIn} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px', fontSize: 13, fontWeight: 600, border: 'none', background: copied ? C.green : C.primary, color: C.white, borderRadius: 5, cursor: 'pointer' }}>
              {copied ? <><Check size={13} /> Copied</> : <><Copy size={13} /> Copy markdown</>}
            </button>
          </div>
        </div>
      </Modal>

      {showWizard && <OnboardingWizard onComplete={completeWizard} onSkip={skipWizard} />}

      {showWeeklyCheckIn && objective && (
        <WeeklyCheckIn
          objective={objective}
          krs={krs}
          scope={activeProject.id}
          weekNumber={state.weekNumber}
          checkins={checkins}
          onClose={() => setShowWeeklyCheckIn(false)}
          onSubmitted={refreshCheckins}
        />
      )}
    </div>
  );
}
