import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Target, Calendar, Trash2, Plus, X, Copy, Sparkles, FileText, Check, User, Users, Flag, CheckCircle2, Circle, PauseCircle, ChevronDown, ChevronRight, XCircle, PauseOctagon, Clock, ListChecks, ArrowRight, ArrowLeft, GitBranch, UserCircle, UserPlus, FolderKanban, BarChart3, AlertTriangle, Link, Archive, Loader2, Menu } from 'lucide-react';
import OnboardingWizard from './OnboardingWizard.jsx';
import { Logo } from './Landing.jsx';
import { api } from './api.js';
import WeeklyCheckIn from './WeeklyCheckIn.jsx';
import { C, STATUS_META, STATUS_ORDER, PROJECT_COLORS, MONTHS, CURRENT_YEAR, FREE_PROJECT_LIMIT, SAMPLE_PERSONAL_OBJECTIVES, SAMPLE_TEAM_OBJECTIVES } from './theme.js';
import { calcKRProgress, confColor, confLabel, confEmoji, timeliness, fmtDate, newId, useIsMobile } from './utils.js';
import CoachPanel from './components/CoachPanel.jsx';
import ObjectiveTabs from './components/ObjectiveTabs.jsx';
import ProjectSwitcher from './components/ProjectSwitcher.jsx';
import KRCard from './components/KRCard.jsx';
import { InitiativeRow, AddInitiativeForm } from './components/InitiativeRow.jsx';
import { Modal, InlineEdit, NumericEdit, ConfidenceSlider, DateEdit, TimelinessBadge } from './components/UIComponents.jsx';
import { EmptyState, NoProjectsState } from './components/EmptyState.jsx';
import { ProjectsPage, ProjectNameForm, ProjectRow } from './components/ProjectsPage.jsx';
import TreeView from './components/TreeView.jsx';
import WeeklyPlanner from './components/WeeklyPlanner.jsx';
import ShareDialog from './components/ShareDialog.jsx';
import VisionBuilder from './components/VisionBuilder.jsx';
import ArchiveView from './components/ArchiveView.jsx';


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

export default function OKRDashboard({ user, onLogout, pendingGuestDraft }) {
  const [projects, setProjects] = useState([]);
  const [activeProjectId, setActiveProjectId] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [viewScheme, setViewScheme] = useState('cards'); // 'cards' | 'tree'
  const switchView = (v) => { setViewScheme(v); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const [showAddKR, setShowAddKR] = useState(false);
  const [showCheckIn, setShowCheckIn] = useState(false);
  const [deleteKRTarget, setDeleteKRTarget] = useState(null);
  const [deleteObjTarget, setDeleteObjTarget] = useState(null);
  const [checkInDraft, setCheckInDraft] = useState('');
  const [copied, setCopied] = useState(false);
  const [storageWarning, setStorageWarning] = useState('');
  const [savedAt, setSavedAt] = useState(null);
  const [hasUnsaved, setHasUnsaved] = useState(false);
  const [guestDiscardNote, setGuestDiscardNote] = useState('');
  const [showWizard, setShowWizard] = useState(false);
  const [checkins, setCheckins] = useState([]);
  const [showWeeklyCheckIn, setShowWeeklyCheckIn] = useState(false);
  const [showAddProject, setShowAddProject] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [renameProjectTarget, setRenameProjectTarget] = useState(null);
  const [deleteProjectTarget, setDeleteProjectTarget] = useState(null);
  const [showProjectsPage, setShowProjectsPage] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [showVisionBuilder, setShowVisionBuilder] = useState(false);
  const [showArchive, setShowArchive] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const saveTimer = useRef(null);
  const activeProjectRef = useRef(null);

  // Load order: accept a pending invite (if the URL carries one) → fetch
  // every project the user is a member of → else show the wizard for
  // first-timers. Projects are first-class server rows now (see
  // migrations/0002_projects.sql), not a single JSON blob per user, so
  // multiple people can share one project.
  // didInit guards against StrictMode's dev-only double-invoke of this
  // effect, which would otherwise create a duplicate first project.
  const didInit = useRef(false);
  useEffect(() => {
    if (didInit.current) return;
    didInit.current = true;
    (async () => {
      let joinNote = '';
      const params = new URLSearchParams(window.location.search);
      const inviteCode = params.get('invite');
      if (inviteCode) {
        try { await api.acceptInvite(inviteCode); }
        catch (e) { joinNote = e.message; }
        window.history.replaceState({}, '', '/app');
      }

      try {
        const { projects: serverProjects } = await api.getProjects();
        setProjects(serverProjects);
        if (serverProjects.length > 0) {
          let lastActive = null;
          try { lastActive = localStorage.getItem('okr-last-project'); } catch (e) { /* ignore */ }
          const initial = serverProjects.find(p => p.id === lastActive) || serverProjects[serverProjects.length - 1];
          setActiveProjectId(initial.id);
          if (pendingGuestDraft) {
            try { localStorage.removeItem('okr-guest-draft'); } catch (e) { /* ignore */ }
            setGuestDiscardNote('Progress demo tidak disimpan — akun ini sudah punya project.');
          }
        } else if (pendingGuestDraft) {
          try { localStorage.removeItem('okr-guest-draft'); } catch (e) { /* ignore */ }
          completeWizard(pendingGuestDraft.obj, pendingGuestDraft.projectMeta);
        } else {
          let wizardDone = false;
          try { wizardDone = !!localStorage.getItem('okr-wizard-done'); } catch (e) { /* ignore */ }
          if (!wizardDone) setShowWizard(true);
        }
        if (joinNote) setStorageWarning(joinNote);
      } catch (e) {
        setStorageWarning('Could not reach the server. Try reloading.');
      } finally {
        setLoaded(true);
      }
    })();

    api.getCheckins().then((r) => setCheckins(r.checkins)).catch(() => {});
  }, []);

  const refreshCheckins = () => { api.getCheckins().then((r) => setCheckins(r.checkins)).catch(() => {}); };

  useEffect(() => {
    if (activeProjectId) {
      try { localStorage.setItem('okr-last-project', activeProjectId); } catch (e) { /* ignore */ }
    }
  }, [activeProjectId]);

  const activeProject = projects.find(p => p.id === activeProjectId) || projects[0];
  activeProjectRef.current = activeProject;
  const projectIndex = activeProject ? projects.findIndex(p => p.id === activeProject.id) : 0;
  const objectives = activeProject ? activeProject.objectives : [];
  const objective = objectives.find(o => o.id === activeProject?.activeObjectiveId) || objectives[0];
  const krs = objective ? objective.krs : [];
  const allInitiatives = krs.flatMap(k => k.initiatives);
  const overallConf = krs.length ? krs.reduce((s, k) => s + k.confidence, 0) / krs.length : 0;
  const atRiskCount = krs.filter(k => k.confidence < 0.5).length;
  const delayedCount = allInitiatives.filter(i => timeliness(i) === 'delayed').length;
  const accentColor = PROJECT_COLORS[Math.max(0, projectIndex) % PROJECT_COLORS.length];

  // Debounced save — PATCHes only the active project's own row. Uses a ref
  // to always read the latest state, preventing stale closures when rapid
  // edits happen (e.g., confidence slider drag).
  useEffect(() => {
    if (!loaded || !activeProject) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      const proj = activeProjectRef.current;
      if (!proj) return;
      try {
        await api.updateProject(proj.id, {
          objectives: proj.objectives,
          activeObjectiveId: proj.activeObjectiveId,
          weekNumber: proj.weekNumber,
        });
        setStorageWarning('');
        setSavedAt(Date.now());
        setHasUnsaved(false);
        setTimeout(() => setSavedAt(null), 2000);
      } catch (e) {
        setStorageWarning('Could not save — changes may not persist.');
      }
    }, 400);
    return () => { if (saveTimer.current) clearTimeout(saveTimer.current); };
  }, [projects, activeProjectId, loaded]);

  // Warn before leaving with unsaved changes
  useEffect(() => {
    const handler = (e) => { if (hasUnsaved) { e.preventDefault(); e.returnValue = ''; } };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [hasUnsaved]);

  // Close mobile menu on outside click
  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [menuOpen]);

  const updateProjectLocal = (projectId, updater) => { setHasUnsaved(true); setProjects(prev => prev.map(p => p.id === projectId ? updater(p) : p)); };

  const updateObjField = (field, value) => updateProjectLocal(activeProject.id, (p) => ({
    ...p, objectives: p.objectives.map(o => o.id === objective.id ? { ...o, [field]: value } : o)
  }));

  const selectObjective = (id) => updateProjectLocal(activeProject.id, (p) => ({ ...p, activeObjectiveId: id }));

  const addObjective = () => {
    updateProjectLocal(activeProject.id, (p) => {
      const newObj = { id: newId(p.id + 'o', p.objectives), objective: '', whyNow: '', krs: [] };
      return { ...p, objectives: [...p.objectives, newObj], activeObjectiveId: newObj.id };
    });
  };

  const confirmDeleteObjective = () => {
    if (!deleteObjTarget) return;
    updateProjectLocal(activeProject.id, (p) => {
      const remaining = p.objectives.filter(o => o.id !== deleteObjTarget);
      const nextActive = p.activeObjectiveId === deleteObjTarget ? (remaining[0] ? remaining[0].id : null) : p.activeObjectiveId;
      return { ...p, objectives: remaining, activeObjectiveId: nextActive };
    });
    setDeleteObjTarget(null);
  };

  const updateKR = (id, updates) => updateProjectLocal(activeProject.id, (p) => ({
    ...p, objectives: p.objectives.map(o => o.id === objective.id ? { ...o, krs: o.krs.map(k => k.id === id ? { ...k, ...updates } : k) } : o)
  }));

  const addKR = (kr) => {
    let added = false;
    updateProjectLocal(activeProject.id, (p) => {
      const obj = p.objectives.find(o => o.id === activeProject.activeObjectiveId);
      if (!obj || obj.krs.length >= 5) return p;
      added = true;
      return { ...p, objectives: p.objectives.map(o => o.id === obj.id ? { ...o, krs: [...o.krs, { id: newId(obj.id + 'k', o.krs), ...kr }] } : o) };
    });
    if (added) setShowAddKR(false);
  };

  const confirmDeleteKR = () => {
    if (!deleteKRTarget) return;
    updateProjectLocal(activeProject.id, (p) => ({
      ...p, objectives: p.objectives.map(o => o.id === objective.id ? { ...o, krs: o.krs.filter(k => k.id !== deleteKRTarget) } : o)
    }));
    setDeleteKRTarget(null);
  };

  const mutateKRInitiatives = (krId, fn) => {
    updateProjectLocal(activeProject.id, (p) => ({
      ...p,
      objectives: p.objectives.map(o => o.id === objective.id
        ? { ...o, krs: o.krs.map(k => k.id === krId ? { ...k, initiatives: fn(k.initiatives, k) } : k) }
        : o)
    }));
  };
  const addIniToKR = (krId, ini) => mutateKRInitiatives(krId, (inis) => [...inis, { id: newId(krId + 'i', inis), ...ini }]);
  const updateIniInKR = (krId, iniId, updates) => mutateKRInitiatives(krId, (inis) => inis.map(i => i.id === iniId ? { ...i, ...updates } : i));
  const deleteIniFromKR = (krId, iniId) => mutateKRInitiatives(krId, (inis) => inis.filter(i => i.id !== iniId));

  const loadSample = () => {
    if (!confirm('This will replace your current OKR with sample data. Continue?')) return;
    updateProjectLocal(activeProject.id, (p) =>
      p.type === 'personal'
        ? { ...p, objectives: SAMPLE_PERSONAL_OBJECTIVES, activeObjectiveId: SAMPLE_PERSONAL_OBJECTIVES[0].id }
        : { ...p, objectives: SAMPLE_TEAM_OBJECTIVES, activeObjectiveId: SAMPLE_TEAM_OBJECTIVES[0].id }
    );
  };

  const completeWizard = async (obj, projectMeta) => {
    if (projects.length === 0) {
      try {
        const { project } = await api.createProject(projectMeta?.name || 'Personal', projectMeta?.type || 'personal');
        const filled = { ...project, objectives: [obj], activeObjectiveId: obj.id };
        setProjects([filled]);
        setActiveProjectId(project.id);
        await api.updateProject(project.id, { objectives: [obj], activeObjectiveId: obj.id });
      } catch (e) {
        setStorageWarning('Could not create your first project — try reloading.');
      }
    } else {
      updateProjectLocal(activeProject.id, (p) => ({ ...p, objectives: [obj], activeObjectiveId: obj.id }));
    }
    try { localStorage.setItem('okr-wizard-done', '1'); } catch (e) {}
    setShowWizard(false);
  };

  const skipWizard = () => {
    try { localStorage.setItem('okr-wizard-done', '1'); } catch (e) {}
    setShowWizard(false);
  };

  // Project management — create/rename/delete, with the Free-tier project
  // count gate enforced server-side (worker/projects.js); the client check
  // here is just a fast-path so most attempts never need a round trip.
  // Billing itself (P3) isn't built — the upgrade modal is messaging only.
  const addProject = async (name, type) => {
    if (user.plan === 'free' && projects.filter(p => p.role === 'owner').length >= FREE_PROJECT_LIMIT) {
      setShowAddProject(false);
      setShowUpgradeModal(true);
      return;
    }
    try {
      const { project } = await api.createProject(name, type);
      setProjects(prev => [...prev, project]);
      setActiveProjectId(project.id);
      setShowAddProject(false);
    } catch (e) {
      setShowAddProject(false);
      if (e.message.includes('limited to')) setShowUpgradeModal(true);
      else setStorageWarning(e.message);
    }
  };

  const renameProject = async (id, name) => {
    const trimmed = name.trim();
    setRenameProjectTarget(null);
    if (!trimmed) return;
    setProjects(prev => prev.map(p => p.id === id ? { ...p, name: trimmed } : p));
    try { await api.updateProject(id, { name: trimmed }); } catch (e) { setStorageWarning('Could not rename project on the server.'); }
  };

  const upgradeProjectType = async (id) => {
    setProjects(prev => prev.map(p => p.id === id ? { ...p, type: 'team' } : p));
    try { await api.updateProject(id, { type: 'team' }); } catch (e) {
      setProjects(prev => prev.map(p => p.id === id ? { ...p, type: 'personal' } : p));
      setStorageWarning('Could not upgrade project on the server.');
    }
  };

  const confirmDeleteProject = async () => {
    if (!deleteProjectTarget) return;
    const id = deleteProjectTarget;
    setDeleteProjectTarget(null);
    try {
      await api.deleteProject(id);
      setProjects(prev => {
        const remaining = prev.filter(p => p.id !== id);
        if (activeProjectId === id) setActiveProjectId(remaining[0]?.id || null);
        return remaining;
      });
    } catch (e) {
      setStorageWarning(e.message || 'Could not delete project.');
    }
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

    const allAtRisk = projects.flatMap(p => atRiskOf(p, tagOf(p)));
    const allOnTrack = projects.flatMap(p => onTrackOf(p, tagOf(p)));
    const allDelayed = projects.flatMap(p => delayedOf(p, tagOf(p)));
    const overallLines = projects.map(p => {
      const c = confOf(p);
      return `- **${p.name}**: ${confEmoji(c)} ${c.toFixed(2)} confidence (${confLabel(c)})`;
    }).join('\n');
    const progressSections = projects.map(p => `## ${p.name} OKR Progress (Week ${p.weekNumber})\n${fmtScopeBlock(p, p.name)}`).join('\n\n');

    return `# Weekly Check-in${activeProject ? ` — Week ${activeProject.weekNumber}` : ''}

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
  const isMobile = useIsMobile();
  const padX = isMobile ? 14 : 24;

  return (
    <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', background: C.bg, minHeight: '100vh', color: C.text, fontSize: 14 }}>
      <div style={{ background: C.white, borderBottom: `1px solid ${C.border}`, padding: isMobile ? '12px 14px' : '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: isMobile ? 10 : 16, position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Logo size={28} />
          <div>
            <div style={{ fontSize: 16, fontWeight: 800, lineHeight: 1.1, letterSpacing: -0.3 }}>Own<span style={{ color: C.primary }}>the</span>Way</div>
            <div style={{ fontSize: 11, color: C.muted }}>Objective → up to 5 KRs → Initiatives</div>
          </div>
        </div>
        {isMobile ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {activeProject && (
              <div style={{ display: 'inline-flex', background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: 3 }}>
                <button onClick={() => switchView('cards')} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '5px 8px', fontSize: 11.5, fontWeight: 600, border: 'none', borderRadius: 6, cursor: 'pointer', background: viewScheme === 'cards' ? C.white : 'transparent', color: viewScheme === 'cards' ? C.text : C.muted, boxShadow: viewScheme === 'cards' ? '0 1px 2px rgba(0,0,0,0.06)' : 'none' }}>
                  <ListChecks size={12} />
                </button>
                <button onClick={() => switchView('planner')} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '5px 8px', fontSize: 11.5, fontWeight: 600, border: 'none', borderRadius: 6, cursor: 'pointer', background: viewScheme === 'planner' ? C.white : 'transparent', color: viewScheme === 'planner' ? C.text : C.muted, boxShadow: viewScheme === 'planner' ? '0 1px 2px rgba(0,0,0,0.06)' : 'none' }}>
                  <Calendar size={12} />
                </button>
                <button onClick={() => switchView('tree')} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '5px 8px', fontSize: 11.5, fontWeight: 600, border: 'none', borderRadius: 6, cursor: 'pointer', background: viewScheme === 'tree' ? C.white : 'transparent', color: viewScheme === 'tree' ? C.text : C.muted, boxShadow: viewScheme === 'tree' ? '0 1px 2px rgba(0,0,0,0.06)' : 'none' }}>
                  <GitBranch size={12} />
                </button>
              </div>
            )}
            <div ref={menuRef} style={{ position: 'relative' }}>
              <button onClick={() => setMenuOpen(!menuOpen)} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '7px 8px', background: menuOpen ? C.bg : C.white, border: `1px solid ${C.border}`, borderRadius: 6, cursor: 'pointer', color: C.text }}>
                <Menu size={16} />
              </button>
              {menuOpen && (
                <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: 4, background: C.white, border: `1px solid ${C.border}`, borderRadius: 8, boxShadow: '0 4px 16px rgba(0,0,0,0.1)', padding: 4, minWidth: 180, zIndex: 20 }}>
                  {activeProject && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 10px', fontSize: 12, color: C.muted, borderBottom: `1px solid ${C.border}` }}>
                      <Calendar size={12} />
                      <span>Week</span>
                      <select value={activeProject.weekNumber} onChange={(e) => { updateProjectLocal(activeProject.id, (p) => ({ ...p, weekNumber: parseInt(e.target.value, 10) })); setMenuOpen(false); }} style={{ fontSize: 12, fontWeight: 600, color: C.text, border: 'none', background: 'transparent', outline: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
                        {Array.from({ length: 13 }, (_, i) => i + 1).map(n => <option key={n} value={n}>{n}</option>)}
                      </select>
                      <span style={{ fontSize: 10.5, color: C.muted }}>/ 13</span>
                    </div>
                  )}
                  {objective && (
                    <button onClick={() => { setShowWeeklyCheckIn(true); setMenuOpen(false); }} style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '8px 10px', background: 'none', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13, color: C.text, textAlign: 'left' }}>
                      <Check size={14} color={C.primary} /> Weekly Check-in
                    </button>
                  )}
                  {objective && (
                    <button onClick={() => { setShowShareDialog(true); setMenuOpen(false); }} style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '8px 10px', background: 'none', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13, color: C.text, textAlign: 'left' }}>
                      <Link size={14} color={C.muted} /> Share
                    </button>
                  )}
                  {objective && activeProject && (
                    <button onClick={() => { setShowArchive(true); setMenuOpen(false); }} style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '8px 10px', background: 'none', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13, color: C.text, textAlign: 'left' }}>
                      <Archive size={14} color={C.muted} /> Archive
                    </button>
                  )}
                  <button onClick={() => { openCheckIn(); setMenuOpen(false); }} style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '8px 10px', background: 'none', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13, color: C.text, textAlign: 'left' }}>
                    <FileText size={14} color={C.muted} /> Export Report
                  </button>
                  <div style={{ height: 1, background: C.border, margin: '4px 6px' }} />
                  <button onClick={() => { setShowProjectsPage(true); setMenuOpen(false); }} style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '8px 10px', background: 'none', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13, color: C.text, textAlign: 'left' }}>
                    <UserCircle size={14} color={C.muted} /> Projects
                  </button>
                  {user && (
                    <button onClick={() => { onLogout(); setMenuOpen(false); }} style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '8px 10px', background: 'none', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13, color: C.red, textAlign: 'left' }}>
                      Sign out
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          {activeProject && (
            <div style={{ display: 'inline-flex', background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: 3 }}>
              <button onClick={() => switchView('cards')} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '6px 12px', fontSize: 12.5, fontWeight: 600, border: 'none', borderRadius: 6, cursor: 'pointer', background: viewScheme === 'cards' ? C.white : 'transparent', color: viewScheme === 'cards' ? C.text : C.muted, boxShadow: viewScheme === 'cards' ? '0 1px 2px rgba(0,0,0,0.06)' : 'none' }}>
                <ListChecks size={13} /> Cards
              </button>
              <button onClick={() => switchView('planner')} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '6px 12px', fontSize: 12.5, fontWeight: 600, border: 'none', borderRadius: 6, cursor: 'pointer', background: viewScheme === 'planner' ? C.white : 'transparent', color: viewScheme === 'planner' ? C.text : C.muted, boxShadow: viewScheme === 'planner' ? '0 1px 2px rgba(0,0,0,0.06)' : 'none' }}>
                <Calendar size={13} /> Planner
              </button>
              <button onClick={() => switchView('tree')} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '6px 12px', fontSize: 12.5, fontWeight: 600, border: 'none', borderRadius: 6, cursor: 'pointer', background: viewScheme === 'tree' ? C.white : 'transparent', color: viewScheme === 'tree' ? C.text : C.muted, boxShadow: viewScheme === 'tree' ? '0 1px 2px rgba(0,0,0,0.06)' : 'none' }}>
                <GitBranch size={13} /> Tree
              </button>
            </div>
          )}
          {activeProject && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 10px', background: C.bg, border: `1px solid ${C.border}`, borderRadius: 6 }} title="Quarter progress (13 weeks)">
              <Calendar size={13} color={C.muted} />
              <span style={{ fontSize: 12, color: C.muted }}>Week</span>
              <select value={activeProject.weekNumber} onChange={(e) => updateProjectLocal(activeProject.id, (p) => ({ ...p, weekNumber: parseInt(e.target.value, 10) }))} style={{ fontSize: 13, fontWeight: 600, color: C.text, border: 'none', background: 'transparent', outline: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
                {Array.from({ length: 13 }, (_, i) => i + 1).map(n => <option key={n} value={n}>{n}</option>)}
              </select>
              <span style={{ fontSize: 10.5, color: C.muted }}>/ 13</span>
            </div>
          )}
          {objective && (
            <button onClick={() => setShowWeeklyCheckIn(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 12px', background: C.primary, color: C.white, border: 'none', borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
              <Check size={13} /> Weekly Check-in
              {checkins.some((c) => c.objectiveId === objective.id && c.weekNumber === activeProject.weekNumber) && (
                <span style={{ background: 'rgba(255,255,255,0.25)', borderRadius: 4, padding: '1px 5px', fontSize: 10 }}>✓</span>
              )}
            </button>
          )}
          {objective && (
            <button onClick={() => setShowShareDialog(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 12px', background: C.white, color: C.text, border: `1px solid ${C.border}`, borderRadius: 6, fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>
              <Link size={13} /> Share
            </button>
          )}
          {objective && activeProject && (
            <button onClick={() => setShowArchive(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 12px', background: C.white, color: C.text, border: `1px solid ${C.border}`, borderRadius: 6, fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>
              <Archive size={13} /> Archive
            </button>
          )}
          <button onClick={openCheckIn} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 12px', background: C.white, color: C.text, border: `1px solid ${C.border}`, borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}><FileText size={13} /> Export Report</button>
          <button onClick={() => setShowProjectsPage(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 10px', background: C.white, color: C.muted, border: `1px solid ${C.border}`, borderRadius: 6, fontSize: 12, cursor: 'pointer' }} title="Projects"><UserCircle size={15} /></button>
          {user && (
            <button onClick={onLogout} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 10px', background: C.white, color: C.muted, border: `1px solid ${C.border}`, borderRadius: 6, fontSize: 12, cursor: 'pointer' }} title={`Sign out (${user.email})`}>Sign out</button>
          )}
          </div>
        )}
      </div>

      {savedAt && (
        <div style={{ position: 'fixed', bottom: 20, right: 20, display: 'inline-flex', alignItems: 'center', gap: 5, padding: '6px 12px', background: C.green, color: C.white, borderRadius: 6, fontSize: 12, fontWeight: 600, boxShadow: '0 2px 8px rgba(0,0,0,0.15)', zIndex: 50, animation: 'fadeIn 0.15s' }}>
          <Check size={13} /> Saved
        </div>
      )}

      {storageWarning && <div style={{ padding: `8px ${padX}px`, background: C.yellowSoft, color: '#8B6914', fontSize: 12, borderBottom: `1px solid ${C.border}` }}>⚠ {storageWarning}</div>}
      {guestDiscardNote && <div style={{ padding: `8px ${padX}px`, background: C.blueSoft, color: C.secondary, fontSize: 12, borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
        <span>ℹ {guestDiscardNote}</span>
        <button onClick={() => setGuestDiscardNote('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.secondary, fontSize: 12, fontWeight: 700 }}>✕</button>
      </div>}

      {!loaded ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '50vh' }}>
          <div style={{ textAlign: 'center' }}>
            <Loader2 size={28} color={C.primary} className="animate-spin" style={{ marginBottom: 8 }} />
            <div style={{ fontSize: 12.5, color: C.muted }}>Loading...</div>
          </div>
        </div>
      ) : projects.length === 0 ? (
        <div style={{ padding: `20px ${padX}px 40px ${padX}px` }}>
          <NoProjectsState onAdd={() => setShowAddProject(true)} onWizard={() => setShowWizard(true)} />
        </div>
      ) : activeProject ? (
        <>
          <div style={{ padding: `20px ${padX}px 0 ${padX}px`, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ alignSelf: 'flex-start' }}>
              <ProjectSwitcher
                projects={projects}
                activeId={activeProjectId}
                onSelect={setActiveProjectId}
                onAdd={() => (user.plan === 'free' && projects.filter(p => p.role === 'owner').length >= FREE_PROJECT_LIMIT) ? setShowUpgradeModal(true) : setShowAddProject(true)}
                onManage={() => setShowProjectsPage(true)}
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
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: 14 }}>
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
                        <button onClick={() => setShowVisionBuilder(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, marginTop: 10, padding: '5px 10px', fontSize: 11.5, fontWeight: 600, border: `1px dashed ${C.border}`, borderRadius: 6, background: 'transparent', color: C.muted, cursor: 'pointer', transition: 'all 0.15s' }} onMouseEnter={(e) => { e.target.style.borderColor = C.primary; e.target.style.color = C.primary; }} onMouseLeave={(e) => { e.target.style.borderColor = C.border; e.target.style.color = C.muted; }}>
                          <Sparkles size={12} /> Generate Vision with AI
                        </button>
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

                <CoachPanel objective={objective} krs={krs} checkins={checkins} weekNumber={activeProject.weekNumber} />

                {viewScheme === 'planner' ? (
                  <WeeklyPlanner krs={krs} weekNumber={activeProject.weekNumber} />
                ) : viewScheme === 'tree' ? (
                  <TreeView krs={krs} onUpdateKR={updateKR} onDeleteKR={(id) => setDeleteKRTarget(id)} />
                ) : krs.length === 0 ? (
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
                        onChange={(updatedKR) => updateKR(kr.id, updatedKR)}
                        onRemove={() => setDeleteKRTarget(kr.id)}
                        checkins={checkins}
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
      ) : null}

      <Modal open={showAddKR} onClose={() => setShowAddKR(false)} title={`Add Key Result · ${objective ? (objective.objective || 'this Objective') : ''}`}>
        <AddKRForm onCancel={() => setShowAddKR(false)} onAdd={addKR} />
      </Modal>

      <Modal open={!!deleteKRTarget} onClose={() => setDeleteKRTarget(null)} title="Delete Key Result?" maxWidth={420}>
        <div style={{ fontSize: 13, color: C.text, marginBottom: 16 }}>
          Delete <strong>"{krs.find(k => k.id === deleteKRTarget)?.label || 'Unknown'}"</strong>?
          <div style={{ marginTop: 6, color: C.muted }}>This removes the KR <strong>and all Key Initiatives nested under it</strong>. This cannot be undone.</div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <button onClick={() => setDeleteKRTarget(null)} style={{ padding: '8px 14px', fontSize: 13, fontWeight: 500, border: `1px solid ${C.border}`, background: C.white, color: C.text, borderRadius: 5, cursor: 'pointer' }}>Cancel</button>
          <button onClick={confirmDeleteKR} style={{ padding: '8px 14px', fontSize: 13, fontWeight: 600, border: 'none', background: C.red, color: C.white, borderRadius: 5, cursor: 'pointer' }}>Delete</button>
        </div>
      </Modal>

      <Modal open={!!deleteObjTarget} onClose={() => setDeleteObjTarget(null)} title="Delete this Objective?" maxWidth={420}>
        <div style={{ fontSize: 13, color: C.text, marginBottom: 16 }}>
          Delete objective <strong>"{objectives.find(o => o.id === deleteObjTarget)?.objective || 'Untitled'}"</strong>?
          <div style={{ marginTop: 6, color: C.muted }}>This removes the Objective <strong>and every Key Result and Key Initiative under it</strong>. This cannot be undone.</div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <button onClick={() => setDeleteObjTarget(null)} style={{ padding: '8px 14px', fontSize: 13, fontWeight: 500, border: `1px solid ${C.border}`, background: C.white, color: C.text, borderRadius: 5, cursor: 'pointer' }}>Cancel</button>
          <button onClick={confirmDeleteObjective} style={{ padding: '8px 14px', fontSize: 13, fontWeight: 600, border: 'none', background: C.red, color: C.white, borderRadius: 5, cursor: 'pointer' }}>Delete Objective</button>
        </div>
      </Modal>

      <Modal open={showAddProject} onClose={() => setShowAddProject(false)} title="New Project" maxWidth={420}>
        <ProjectNameForm confirmLabel="Create Project" onCancel={() => setShowAddProject(false)} onConfirm={addProject} showType />
      </Modal>

      <Modal open={!!renameProjectTarget} onClose={() => setRenameProjectTarget(null)} title="Rename Project" maxWidth={420}>
        <ProjectNameForm
          initialName={projects.find(p => p.id === renameProjectTarget)?.name || ''}
          confirmLabel="Save"
          onCancel={() => setRenameProjectTarget(null)}
          onConfirm={(name) => renameProject(renameProjectTarget, name)}
        />
      </Modal>

      <Modal open={!!deleteProjectTarget} onClose={() => setDeleteProjectTarget(null)} title="Delete this Project?" maxWidth={420}>
        <div style={{ fontSize: 13, color: C.text, marginBottom: 16 }}>This removes <strong>every Objective, Key Result, and Key Initiative</strong> in this project for every member. This cannot be undone.</div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <button onClick={() => setDeleteProjectTarget(null)} style={{ padding: '8px 14px', fontSize: 13, fontWeight: 500, border: `1px solid ${C.border}`, background: C.white, color: C.text, borderRadius: 5, cursor: 'pointer' }}>Cancel</button>
          <button onClick={confirmDeleteProject} style={{ padding: '8px 14px', fontSize: 13, fontWeight: 600, border: 'none', background: C.red, color: C.white, borderRadius: 5, cursor: 'pointer' }}>Delete Project</button>
        </div>
      </Modal>

      <Modal open={showUpgradeModal} onClose={() => setShowUpgradeModal(false)} title="Free plan limit reached" maxWidth={420}>
        <div style={{ fontSize: 13, color: C.text, marginBottom: 16, lineHeight: 1.6 }}>
          The Free plan includes up to <strong>{FREE_PROJECT_LIMIT} owned projects</strong>. Upgrade to Pro for unlimited projects, plus advanced analytics and AI coaching.
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <button onClick={() => setShowUpgradeModal(false)} style={{ padding: '8px 14px', fontSize: 13, fontWeight: 500, border: `1px solid ${C.border}`, background: C.white, color: C.text, borderRadius: 5, cursor: 'pointer' }}>Maybe later</button>
          <button disabled style={{ padding: '8px 14px', fontSize: 13, fontWeight: 600, border: 'none', background: C.border, color: C.muted, borderRadius: 5, cursor: 'not-allowed' }} title="Billing isn't live yet">Upgrade to Pro (coming soon)</button>
        </div>
      </Modal>

      {showProjectsPage && (
        <ProjectsPage
          user={user}
          projects={projects}
          activeProjectId={activeProjectId}
          onClose={() => setShowProjectsPage(false)}
          onSwitch={(id) => { setActiveProjectId(id); setShowProjectsPage(false); }}
          onRename={(id) => setRenameProjectTarget(id)}
          onDelete={(id) => setDeleteProjectTarget(id)}
          onUpgrade={upgradeProjectType}
          onAdd={() => (user.plan === 'free' && projects.filter(p => p.role === 'owner').length >= FREE_PROJECT_LIMIT) ? setShowUpgradeModal(true) : setShowAddProject(true)}
        />
      )}

      {showShareDialog && activeProject && (
        <ShareDialog projectId={activeProject.id} onClose={() => setShowShareDialog(false)} />
      )}

      <Modal open={showCheckIn} onClose={() => setShowCheckIn(false)} title={`Weekly check-in${activeProject ? ` — Week ${activeProject.weekNumber}` : ''}`} maxWidth={760}>
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

      {showWizard && <OnboardingWizard onComplete={completeWizard} onSkip={skipWizard} askProjectType={projects.length === 0} />}

      {showWeeklyCheckIn && objective && activeProject && (
        <WeeklyCheckIn
          objective={objective}
          krs={krs}
          scope={activeProject.id}
          weekNumber={activeProject.weekNumber}
          checkins={checkins}
          onClose={() => setShowWeeklyCheckIn(false)}
          onSubmitted={refreshCheckins}
        />
      )}

      {showVisionBuilder && (
        <VisionBuilder
          onClose={() => setShowVisionBuilder(false)}
          onApplyObjective={(vision) => {
            if (objective) {
              updateObjField('objective', vision.vision);
              updateObjField('whyNow', `Annual theme: ${vision.annualTheme}. Quarterly focus: ${vision.quarterlyFocus}`);
            }
            setShowVisionBuilder(false);
          }}
        />
      )}

      {showArchive && activeProject && (
        <ArchiveView projectId={activeProject.id} krs={krs} onClose={() => setShowArchive(false)} />
      )}
    </div>
  );
}
