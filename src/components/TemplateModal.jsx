import React, { memo } from 'react';
import { Sparkles, X, Target } from 'lucide-react';
import { C } from '../theme.js';
import { Modal } from './UIComponents.jsx';

const CATEGORY_COLORS = {
  Personal: C.primary,
  Team: C.secondary,
};

const TemplateModal = memo(function TemplateModal({ templates, onAdd, onClose }) {
  const categories = [...new Set(templates.map((t) => t.category))];

  return (
    <Modal open onClose={onClose} title="Mulai dari Template OKR" maxWidth={680}>
      <p style={{ fontSize: 13, color: C.muted, margin: '0 0 16px', lineHeight: 1.5 }}>
        Pilih template, lalu sesuaikan Objective, KR, dan initiative-nya. Template ditambahkan sebagai Objective baru di project ini — data kamu aman.
      </p>
      {categories.map((cat) => (
        <div key={cat} style={{ marginBottom: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.6, color: CATEGORY_COLORS[cat] || C.muted, marginBottom: 8 }}>
            <Target size={12} /> {cat}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: 8 }}>
            {templates.filter((t) => t.category === cat).map((t) => (
              <button
                key={t.id}
                onClick={() => onAdd(t)}
                style={{
                  textAlign: 'left', background: C.white, border: `1px solid ${C.border}`, borderRadius: 8,
                  padding: '12px 14px', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = C.primary; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.boxShadow = 'none'; }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13.5, fontWeight: 700, color: C.text, marginBottom: 4 }}>
                  <Sparkles size={13} color={C.primary} /> {t.name}
                </div>
                <div style={{ fontSize: 11.5, color: C.muted, lineHeight: 1.45 }}>{t.desc}</div>
                <div style={{ fontSize: 10.5, color: C.muted, marginTop: 6 }}>
                  {t.objectives.length} Objective · {t.objectives.reduce((s, o) => s + o.krs.length, 0)} KR
                </div>
              </button>
            ))}
          </div>
        </div>
      ))}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 4 }}>
        <button onClick={onClose} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px', fontSize: 13, fontWeight: 600, border: `1px solid ${C.border}`, background: C.white, color: C.text, borderRadius: 6, cursor: 'pointer' }}>
          <X size={14} /> Batal
        </button>
      </div>
    </Modal>
  );
});

export default TemplateModal;
