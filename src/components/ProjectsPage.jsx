import React, { useState, useEffect, useRef, memo } from 'react';
import { Plus, Trash2, UserPlus, Users, ArrowLeft } from 'lucide-react';
import { C, PROJECT_COLORS, FREE_PROJECT_LIMIT } from '../theme.js';
import { Modal } from './UIComponents.jsx';
import { api } from '../api.js';

const smallBtnStyle = { display: 'inline-flex', alignItems: 'center', gap: 5, padding: '5px 10px', fontSize: 11.5, fontWeight: 600, border: `1px solid ${C.border}`, background: C.white, color: C.text, borderRadius: 5, cursor: 'pointer' };

export function ProjectNameForm({ initialName = '', confirmLabel, onCancel, onConfirm, showType = false }) {
  const [name, setName] = useState(initialName);
  const [type, setType] = useState('personal');
  const [err, setErr] = useState('');

  const PROJECT_TYPE_INFO = {
    personal: 'Hanya kamu yang bisa akses. Cocok untuk goal pribadi yang privat.',
    team: 'Bisa undang orang lain untuk sama-sama edit Objective, KR, dan check-in.',
  };

  const submit = () => {
    if (!name.trim()) { setErr('Give the project a name.'); return; }
    onConfirm(name.trim(), type);
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
      {showType && (
        <div style={{ marginTop: 14 }}>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>Type</label>
          <div style={{ display: 'flex', gap: 8 }}>
            {[{ value: 'personal', icon: User, label: 'Personal' }, { value: 'team', icon: Users, label: 'Tim' }].map(({ value, icon: Icon, label }) => {
              const active = type === value;
              return (
                <button key={value} onClick={() => setType(value)} style={{
                  flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '8px 10px',
                  borderRadius: 6, cursor: 'pointer', fontFamily: 'inherit', fontSize: 12.5, fontWeight: 600,
                  border: `1.5px solid ${active ? C.primary : C.border}`, background: active ? C.redSoft : C.white, color: active ? C.primary : C.text,
                }}>
                  <Icon size={13} /> {label}
                </button>
              );
            })}
          </div>
          <div style={{ fontSize: 11.5, color: C.muted, marginTop: 6, lineHeight: 1.5 }}>{PROJECT_TYPE_INFO[type]}</div>
        </div>
      )}
      {err && <div style={{ color: C.red, fontSize: 12, marginTop: 8 }}>{err}</div>}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
        <button onClick={onCancel} style={{ padding: '8px 14px', fontSize: 13, fontWeight: 500, border: `1px solid ${C.border}`, background: C.white, color: C.text, borderRadius: 5, cursor: 'pointer' }}>Cancel</button>
        <button onClick={submit} style={{ padding: '8px 14px', fontSize: 13, fontWeight: 600, border: 'none', background: C.primary, color: C.white, borderRadius: 5, cursor: 'pointer' }}>{confirmLabel}</button>
      </div>
    </div>
  );
}

export function ProjectRow({ project, isActive, color, onSwitch, onRename, onDelete, onUpgrade }) {
  const [showInvite, setShowInvite] = useState(false);
  const [inviteLink, setInviteLink] = useState('');
  const [inviteErr, setInviteErr] = useState('');
  const [members, setMembers] = useState(null);
  const [copied, setCopied] = useState(false);

  const toggleInvite = async () => {
    if (showInvite) { setShowInvite(false); return; }
    setShowInvite(true);
    setInviteErr('');
    setInviteLink('');
    try {
      const { code } = await api.createInvite(project.id);
      setInviteLink(`${window.location.origin}/app?invite=${code}`);
    } catch (e) { setInviteErr(e.message); }
    try {
      const { members } = await api.getMembers(project.id);
      setMembers(members);
    } catch (e) { /* non-critical */ }
  };

  const copyLink = async () => {
    try { await navigator.clipboard.writeText(inviteLink); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch (e) { /* ignore */ }
  };

  return (
    <div style={{ border: `1px solid ${C.border}`, borderRadius: 8, padding: '10px 12px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ width: 8, height: 8, borderRadius: 4, background: color, flexShrink: 0 }} />
        <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: C.text, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{project.name}</span>
        <span style={{ fontSize: 9.5, fontWeight: 700, textTransform: 'uppercase', color: project.type === 'personal' ? C.muted : C.secondary, background: project.type === 'personal' ? C.grayPill : C.blueSoft, padding: '2px 6px', borderRadius: 4, flexShrink: 0 }}>{project.type === 'personal' ? 'Personal' : 'Tim'}</span>
        <span style={{ fontSize: 9.5, fontWeight: 700, textTransform: 'uppercase', color: C.muted, background: C.grayPill, padding: '2px 6px', borderRadius: 4, flexShrink: 0 }}>{project.role}</span>
        {isActive && <span style={{ fontSize: 9.5, fontWeight: 700, color: C.green, flexShrink: 0 }}>ACTIVE</span>}
      </div>
      <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
        {!isActive && <button onClick={onSwitch} style={smallBtnStyle}>Switch to</button>}
        <button onClick={onRename} style={smallBtnStyle}>Rename</button>
        {project.role === 'owner' && project.type === 'team' && <button onClick={toggleInvite} style={smallBtnStyle}><UserPlus size={11} /> Invite</button>}
        {project.role === 'owner' && project.type === 'personal' && <button onClick={onUpgrade} style={smallBtnStyle}><Users size={11} /> Upgrade to Tim</button>}
        {project.role === 'owner' && <button onClick={onDelete} style={{ ...smallBtnStyle, color: C.red }}><Trash2 size={10} /> Delete</button>}
      </div>
      {showInvite && (
        <div style={{ marginTop: 10, padding: 10, background: C.bg, borderRadius: 6 }}>
          {inviteErr ? (
            <div style={{ fontSize: 12, color: C.red }}>{inviteErr}</div>
          ) : inviteLink ? (
            <>
              <div style={{ fontSize: 11, color: C.muted, marginBottom: 6 }}>Share this link — anyone who opens it and signs in joins this project:</div>
              <div style={{ display: 'flex', gap: 6 }}>
                <input readOnly value={inviteLink} onFocus={(e) => e.target.select()} style={{ flex: 1, fontSize: 11.5, padding: '6px 8px', border: `1px solid ${C.border}`, borderRadius: 5, fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', background: C.white, color: C.text, minWidth: 0 }} />
                <button onClick={copyLink} style={{ ...smallBtnStyle, whiteSpace: 'nowrap' }}>{copied ? 'Copied!' : 'Copy'}</button>
              </div>
            </>
          ) : (
            <div style={{ fontSize: 12, color: C.muted }}>Generating…</div>
          )}
          {members && (
            <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${C.border}` }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: C.muted, textTransform: 'uppercase', marginBottom: 6 }}>Members ({members.length})</div>
              {members.map((m) => (
                <div key={m.id} style={{ fontSize: 12, color: C.text, display: 'flex', justifyContent: 'space-between', padding: '3px 0' }}>
                  <span>{m.name || m.email}</span>
                  <span style={{ color: C.muted, fontSize: 10, textTransform: 'uppercase' }}>{m.role}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function ProjectsPage({ user, projects, activeProjectId, onClose, onSwitch, onRename, onDelete, onUpgrade, onAdd }) {
  const padX = 24;
  return (
    <div style={{ position: 'fixed', inset: 0, background: C.bg, zIndex: 60, overflow: 'auto', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      <div style={{ background: C.white, borderBottom: `1px solid ${C.border}`, padding: '14px 24px', position: 'sticky', top: 0, zIndex: 1 }}>
        <button onClick={onClose} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 0', fontSize: 13, fontWeight: 600, border: 'none', background: 'transparent', color: C.muted, cursor: 'pointer', marginBottom: 10 }}>
          <ArrowLeft size={15} /> Back to dashboard
        </button>
        <div style={{ fontSize: 20, fontWeight: 800, color: C.text }}>Your Projects</div>
        <div style={{ fontSize: 12.5, color: C.muted, marginTop: 4, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span>{user.name || user.email} · {user.email}</span>
          <span style={{ display: 'inline-flex', fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', padding: '2px 8px', borderRadius: 10, background: user.plan === 'free' ? C.grayPill : C.greenSoft, color: user.plan === 'free' ? C.muted : C.green }}>
            {user.plan === 'free' ? 'Free plan' : 'Pro plan'}
          </span>
          <span>{projects.length}{user.plan === 'free' ? `/${FREE_PROJECT_LIMIT} owned` : ' projects'}</span>
        </div>
      </div>
      <div style={{ padding: `20px ${padX}px 40px ${padX}px`, maxWidth: 640, margin: '0 auto' }}>
        <button onClick={onAdd} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 16px', fontSize: 13, fontWeight: 700, border: 'none', background: C.primary, color: C.white, borderRadius: 7, cursor: 'pointer', marginBottom: 16 }}>
          <Plus size={14} /> New Project
        </button>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {projects.map((p, i) => (
            <ProjectRow
              key={p.id} project={p} isActive={p.id === activeProjectId} color={PROJECT_COLORS[i % PROJECT_COLORS.length]}
              onSwitch={() => onSwitch(p.id)} onRename={() => onRename(p.id)} onDelete={() => onDelete(p.id)} onUpgrade={() => onUpgrade(p.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
