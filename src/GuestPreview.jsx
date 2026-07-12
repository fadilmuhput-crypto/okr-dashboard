import React from 'react';
import { Target, Sparkles, LogIn } from 'lucide-react';
import { Logo } from './Landing.jsx';
import { C } from './theme.js';
import { confColor, confLabel } from './utils.js';

export default function GuestPreview({ draft, onDraftChange, onSave, onLogin }) {
  const { obj } = draft;

  const updateConfidence = (krId, confidence) => {
    onDraftChange({
      ...draft,
      obj: { ...obj, krs: obj.krs.map(k => k.id === krId ? { ...k, confidence } : k) },
    });
  };

  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', padding: '32px 16px' }}>
      <div style={{ maxWidth: 560, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Logo size={26} />
            <span style={{ fontSize: 15, fontWeight: 800 }}>Own<span style={{ color: C.primary }}>the</span>Way</span>
          </div>
          <button onClick={onLogin} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', color: C.muted, fontSize: 12.5, fontFamily: 'inherit' }}>
            <LogIn size={13} /> Sudah punya akun? Masuk
          </button>
        </div>

        <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 14, padding: 24, boxShadow: '0 8px 30px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <Target size={16} color={C.primary} />
            <span style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: 0.5 }}>Objective kamu</span>
          </div>
          <h2 style={{ fontSize: 19, fontWeight: 800, color: C.text, margin: '0 0 18px', lineHeight: 1.35 }}>{obj.objective}</h2>

          {obj.krs.map((k) => {
            const c = k.confidence ?? 0.5;
            return (
              <div key={k.id} style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 10, padding: 14, marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 13.5, fontWeight: 600, color: C.text }}>{k.label}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: confColor(c), whiteSpace: 'nowrap' }}>
                    {confLabel(c)} · {c.toFixed(2)}
                  </span>
                </div>
                <input
                  type="range" min={0} max={1} step={0.05} value={c}
                  onChange={(e) => updateConfidence(k.id, parseFloat(e.target.value))}
                  style={{ width: '100%', accentColor: confColor(c), cursor: 'pointer' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: C.muted, marginTop: 2 }}>
                  <span>0 — gak mungkin</span>
                  <span>0.5 — fifty-fifty</span>
                  <span>1 — pasti tercapai</span>
                </div>
              </div>
            );
          })}

          <div style={{ fontSize: 12, color: C.muted, background: C.redSoft, borderRadius: 8, padding: '10px 12px', lineHeight: 1.5, marginTop: 4, marginBottom: 20 }}>
            💡 Ini baru preview — belum kesimpan. Buat akun gratis buat nyimpen progress ini dan mulai check-in mingguan beneran.
          </div>

          <button onClick={onSave} style={{ width: '100%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '13px 16px', fontSize: 14.5, fontWeight: 700, border: 'none', background: C.primary, color: C.white, borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit' }}>
            <Sparkles size={15} /> Simpan progress kamu — buat akun gratis
          </button>
        </div>
      </div>
    </div>
  );
}
