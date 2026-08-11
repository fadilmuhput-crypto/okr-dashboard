import React from 'react';
import { Target, Plus, Sparkles, LayoutTemplate } from 'lucide-react';
import { C } from '../theme.js';

export function EmptyState({ onAdd, onSample, onWizard, onTemplates, accentColor }) {
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
        <button onClick={onTemplates} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 16px', background: C.white, color: C.text, border: `1px solid ${C.border}`, borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}><LayoutTemplate size={14} /> Browse templates</button>
        <button onClick={onSample} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 16px', background: C.white, color: C.text, border: `1px solid ${C.border}`, borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}><Sparkles size={14} /> Load sample data</button>
      </div>
    </div>
  );
}

export function NoProjectsState({ onAdd, onWizard }) {
  return (
    <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 10, padding: '48px 24px', textAlign: 'center' }}>
      <div style={{ width: 48, height: 48, borderRadius: 12, background: C.redSoft, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}><Target size={22} color={C.primary} /></div>
      <div style={{ fontSize: 18, fontWeight: 600, color: C.text, marginBottom: 6 }}>You don't have any projects yet</div>
      <div style={{ fontSize: 13, color: C.muted, maxWidth: 420, margin: '0 auto 24px', lineHeight: 1.5 }}>
        A project holds one or more Objectives and their Key Results — start your own, or ask a teammate for an invite link to join theirs.
      </div>
      <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
        <button onClick={onWizard} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 16px', background: C.primary, color: C.white, border: 'none', borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}><Target size={14} /> Mulai dengan Panduan</button>
        <button onClick={onAdd} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 16px', background: C.white, color: C.text, border: `1px solid ${C.border}`, borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}><Plus size={14} /> Create a project</button>
      </div>
    </div>
  );
}
