import React, { useState, memo } from 'react';
import { X, Check } from 'lucide-react';
import { C } from '../theme.js';
import { Modal } from './UIComponents.jsx';

const AlignmentModal = memo(function AlignmentModal({ projects, currentProject, onSave, onClose }) {
  const [parentId, setParentId] = useState(currentProject.parentId || '');
  const [parentObjectiveId, setParentObjectiveId] = useState(currentProject.parentObjectiveId || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const candidates = projects.filter((p) => p.id !== currentProject.id);
  const parent = candidates.find((p) => p.id === parentId);

  const save = async () => {
    setError('');
    setSaving(true);
    try {
      await onSave(parentId || null, parentObjectiveId || null);
      onClose();
    } catch (e) {
      setError(e.message || 'Could not save alignment.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open onClose={onClose} title="Project Alignment" maxWidth={480}>
      <p style={{ fontSize: 13, color: C.muted, margin: '0 0 16px', lineHeight: 1.5 }}>
        Nyatakan bahwa project ini berkontribusi ke objective di project lain (Company → Dept → Team → Individual). Leader di project parent bisa melihat ringkasan progress dari project ini.
      </p>

      <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>Align to project</label>
      <select
        value={parentId}
        onChange={(e) => { setParentId(e.target.value); setParentObjectiveId(''); }}
        style={{ width: '100%', padding: '9px 11px', fontSize: 13, border: `1px solid ${C.border}`, borderRadius: 6, background: C.white, color: C.text, fontFamily: 'inherit', outline: 'none', marginBottom: 12 }}
      >
        <option value="">— No alignment —</option>
        {candidates.map((p) => (
          <option key={p.id} value={p.id}>{p.name} ({p.type === 'team' ? 'Team' : 'Personal'})</option>
        ))}
      </select>

      {parent && (
        <>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>Align to objective</label>
          <select
            value={parentObjectiveId}
            onChange={(e) => setParentObjectiveId(e.target.value)}
            style={{ width: '100%', padding: '9px 11px', fontSize: 13, border: `1px solid ${C.border}`, borderRadius: 6, background: C.white, color: C.text, fontFamily: 'inherit', outline: 'none', marginBottom: 16 }}
          >
            <option value="">— Any objective —</option>
            {parent.objectives.map((o) => (
              <option key={o.id} value={o.id}>{o.objective.trim() || '(untitled)'}</option>
            ))}
          </select>
        </>
      )}

      {error && <div style={{ marginBottom: 12, padding: '9px 12px', background: C.redSoft, color: C.red, fontSize: 12.5, borderRadius: 6 }}>{error}</div>}

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
        <button onClick={onClose} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px', fontSize: 13, fontWeight: 600, border: `1px solid ${C.border}`, background: C.white, color: C.text, borderRadius: 6, cursor: 'pointer' }}>
          <X size={14} /> Batal
        </button>
        <button onClick={save} disabled={saving} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px', fontSize: 13, fontWeight: 600, border: 'none', background: C.primary, color: C.white, borderRadius: 6, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.6 : 1 }}>
          <Check size={14} /> {saving ? 'Menyimpan...' : 'Simpan'}
        </button>
      </div>
    </Modal>
  );
});

export default AlignmentModal;
