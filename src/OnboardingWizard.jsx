import React, { useState } from 'react';
import { Target, ArrowRight, ArrowLeft, Check, Plus, X, Gauge, User, Users, Sparkles } from 'lucide-react';
import { C } from './theme.js';
import { confColor, confLabel } from './utils.js';
import { api } from './api.js';

const OBJECTIVE_EXAMPLES = [
  'Jadi kreator yang dipercaya audiens di industriku',
  'Bangun kebiasaan sehat yang bertahan sepanjang tahun',
  'Jadikan produk kami touchpoint paling dipercaya pelanggan',
];

const inputStyle = {
  width: '100%', padding: '11px 13px', fontSize: 14, border: `1px solid ${C.border}`,
  borderRadius: 7, fontFamily: 'inherit', outline: 'none', background: C.white,
  color: C.text, boxSizing: 'border-box',
};
const labelStyle = {
  display: 'block', fontSize: 11, fontWeight: 700, color: C.muted,
  textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6,
};

export default function OnboardingWizard({ onComplete, onSkip, askProjectType = false, secondaryLink }) {
  const [step, setStep] = useState(1);
  const [typeConfirmed, setTypeConfirmed] = useState(!askProjectType);
  const [projectType, setProjectType] = useState(null);
  const [projectName, setProjectName] = useState('');
  const [objective, setObjective] = useState('');
  const [whyNow, setWhyNow] = useState('');
  const [krs, setKrs] = useState([{ label: '', baseline: '', target: '', unit: '' }]);
  const [confidences, setConfidences] = useState([]);
  const [err, setErr] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');

  const chooseType = (type) => {
    setProjectType(type);
    if (type === 'personal') setProjectName('Personal');
    else if (!projectName) setProjectName('');
  };

  const validKrs = krs.filter(k => k.label.trim() && k.target !== '');

  const next = () => {
    setErr('');
    if (step === 1) {
      if (!objective.trim()) { setErr('Tulis dulu Objective-mu — satu kalimat aspiratif.'); return; }
      setStep(2);
    } else if (step === 2) {
      if (validKrs.length === 0) { setErr('Isi minimal 1 Key Result (nama + angka target).'); return; }
      setConfidences(validKrs.map(() => 0.5));
      setStep(3);
    }
  };

  const finish = () => {
    const ts = Date.now();
    const cleanKrs = validKrs.map((k, i) => ({
      id: `wz_k${ts}_${i}`,
      label: k.label.trim(),
      type: 'percent',
      baseline: Number(k.baseline) || 0,
      target: Number(k.target),
      current: Number(k.baseline) || 0,
      unit: k.unit.trim(),
      confidence: confidences[i] ?? 0.5,
      initiatives: [],
    }));
    onComplete(
      { id: `wz_o${ts}`, objective: objective.trim(), whyNow: whyNow.trim(), krs: cleanKrs },
      askProjectType ? { name: projectName.trim() || 'Personal', type: projectType || 'personal' } : undefined
    );
  };

  const updateKr = (idx, field, value) =>
    setKrs(prev => prev.map((k, i) => i === idx ? { ...k, [field]: value } : k));

  const generateWithAI = async () => {
    if (!objective.trim()) { setErr('Tulis dulu Objective-mu sebelum generate AI.'); return; }
    setAiLoading(true);
    setAiError('');
    setErr('');
    try {
      const { okr } = await api.generateOKR(objective);
      if (okr.whyNow) setWhyNow(okr.whyNow);
      if (okr.krs && okr.krs.length > 0) {
        setKrs(okr.krs.map(k => ({
          label: k.label || '',
          baseline: String(k.baseline ?? 0),
          target: String(k.target ?? 100),
          unit: k.unit || '',
        })));
      }
    } catch (e) {
      setAiError(e.message || 'Gagal generate OKR. Coba isi manual.');
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,15,15,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: 16 }}>
      <div style={{ background: C.white, borderRadius: 14, maxWidth: 560, width: '100%', maxHeight: '92vh', overflow: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.25)', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>

        {/* Header */}
        <div style={{ padding: '20px 24px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 26, height: 26, background: C.primary, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Target size={14} color={C.white} />
              </div>
              <span style={{ fontSize: 13, fontWeight: 700, color: C.text }}>OKR pertamamu — {askProjectType ? 4 : 3} langkah</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {secondaryLink && (
                <button onClick={secondaryLink.onClick} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted, fontSize: 12, fontFamily: 'inherit', textDecoration: 'underline' }}>
                  {secondaryLink.label}
                </button>
              )}
              <button onClick={onSkip} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted, fontSize: 12, fontFamily: 'inherit', textDecoration: 'underline' }}>
                Lewati, isi sendiri
              </button>
            </div>
          </div>
          {/* Progress */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 20 }}>
            {askProjectType && (
              <div style={{ flex: 1, height: 4, borderRadius: 2, background: C.primary, transition: 'background 0.3s' }} />
            )}
            {[1, 2, 3].map(n => (
              <div key={n} style={{ flex: 1, height: 4, borderRadius: 2, background: typeConfirmed && n <= step ? C.primary : C.border, transition: 'background 0.3s' }} />
            ))}
          </div>
        </div>

        <div style={{ padding: '0 24px 24px' }}>

          {/* Step 0 — Personal vs Team */}
          {askProjectType && !typeConfirmed && (
            <div>
              <h2 style={{ fontSize: 20, fontWeight: 800, margin: '0 0 6px', color: C.text }}>
                Kamu kerja sendiri atau bareng tim?
              </h2>
              <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.6, margin: '0 0 18px' }}>
                <strong style={{ color: C.text }}>Personal</strong> cuma bisa diakses kamu sendiri, gak bisa diundang orang lain. <strong style={{ color: C.text }}>Tim</strong> bisa kamu undang siapa saja untuk kolaborasi. Personal bisa di-upgrade ke Tim kapan saja nanti kalau berubah pikiran.
              </p>
              <div style={{ display: 'flex', gap: 10, marginBottom: 18 }}>
                {[
                  { type: 'personal', icon: User, label: 'Personal', desc: 'Cuma aku' },
                  { type: 'team', icon: Users, label: 'Tim', desc: 'Aku + orang lain' },
                ].map(({ type, icon: Icon, label, desc }) => {
                  const active = projectType === type;
                  return (
                    <button key={type} onClick={() => chooseType(type)} style={{
                      flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                      padding: '18px 12px', borderRadius: 10, cursor: 'pointer', fontFamily: 'inherit',
                      border: `2px solid ${active ? C.primary : C.border}`, background: active ? C.redSoft : C.white,
                    }}>
                      <Icon size={22} color={active ? C.primary : C.muted} />
                      <span style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{label}</span>
                      <span style={{ fontSize: 11.5, color: C.muted }}>{desc}</span>
                    </button>
                  );
                })}
              </div>
              {projectType === 'team' && (
                <div>
                  <label style={labelStyle}>Nama tim/workspace</label>
                  <input
                    autoFocus
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    placeholder="contoh: Tim Produk"
                    style={inputStyle}
                  />
                </div>
              )}
            </div>
          )}

          {/* Step 1 — Objective */}
          {typeConfirmed && step === 1 && (
            <div>
              <h2 style={{ fontSize: 20, fontWeight: 800, margin: '0 0 6px', color: C.text }}>
                Apa tujuan besarmu kuartal ini?
              </h2>
              <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.6, margin: '0 0 18px' }}>
                Satu kalimat aspiratif — sesuatu yang bikin bangga walau tercapai 70%. Bukan daftar tugas.
              </p>
              <label style={labelStyle}>Objective</label>
              <textarea
                autoFocus
                value={objective}
                onChange={(e) => setObjective(e.target.value)}
                placeholder="contoh: Jadi kreator yang dipercaya audiens di industriku"
                rows={2}
                style={{ ...inputStyle, resize: 'none', lineHeight: 1.5 }}
              />
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', margin: '10px 0 18px' }}>
                {OBJECTIVE_EXAMPLES.map(ex => (
                  <button key={ex} onClick={() => setObjective(ex)} style={{ fontSize: 11, color: C.muted, background: C.bg, border: `1px solid ${C.border}`, borderRadius: 12, padding: '4px 10px', cursor: 'pointer', fontFamily: 'inherit' }}>
                    {ex.length > 42 ? ex.slice(0, 42) + '…' : ex}
                  </button>
                ))}
              </div>
              <label style={labelStyle}>Kenapa sekarang? <span style={{ fontWeight: 400, textTransform: 'none' }}>(opsional)</span></label>
              <input
                value={whyNow}
                onChange={(e) => setWhyNow(e.target.value)}
                placeholder="contoh: Kuartal ini window terbaik sebelum kompetitor launching"
                style={inputStyle}
              />
              {objective.trim().length >= 10 && (
                <button
                  onClick={generateWithAI}
                  disabled={aiLoading}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 14, padding: '9px 16px', fontSize: 13, fontWeight: 600, border: `1px solid ${C.secondary}`, borderRadius: 7, cursor: aiLoading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', background: aiLoading ? C.bg : C.blueSoft, color: C.secondary }}
                >
                  <Sparkles size={14} /> {aiLoading ? 'Generating...' : 'Generate KRs with AI'}
                </button>
              )}
              {aiError && (
                <div style={{ marginTop: 10, padding: '8px 12px', background: C.redSoft, color: C.red, fontSize: 12, borderRadius: 6 }}>{aiError}</div>
              )}
            </div>
          )}

          {/* Step 2 — Key Results */}
          {step === 2 && (
            <div>
              <h2 style={{ fontSize: 20, fontWeight: 800, margin: '0 0 6px', color: C.text }}>
                Gimana kamu tahu berhasil?
              </h2>
              <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.6, margin: '0 0 18px' }}>
                Tulis 1-3 Key Result yang <strong style={{ color: C.text }}>terukur angka</strong>. Dari berapa, ke berapa.
              </p>
              {krs.map((k, i) => (
                <div key={i} style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 10, padding: 14, marginBottom: 10, position: 'relative' }}>
                  {krs.length > 1 && (
                    <button onClick={() => setKrs(prev => prev.filter((_, idx) => idx !== i))} style={{ position: 'absolute', top: 10, right: 10, background: 'none', border: 'none', cursor: 'pointer', color: C.muted, padding: 2, display: 'flex' }}>
                      <X size={14} />
                    </button>
                  )}
                  <label style={labelStyle}>Key Result {i + 1}</label>
                  <input
                    value={k.label}
                    onChange={(e) => updateKr(i, 'label', e.target.value)}
                    placeholder="contoh: Tambah subscriber newsletter"
                    style={{ ...inputStyle, marginBottom: 10 }}
                  />
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <div style={{ flex: '1 1 90px' }}>
                      <label style={labelStyle}>Dari</label>
                      <input type="number" value={k.baseline} onChange={(e) => updateKr(i, 'baseline', e.target.value)} placeholder="0" style={inputStyle} />
                    </div>
                    <div style={{ flex: '1 1 90px' }}>
                      <label style={labelStyle}>Target</label>
                      <input type="number" value={k.target} onChange={(e) => updateKr(i, 'target', e.target.value)} placeholder="1000" style={inputStyle} />
                    </div>
                    <div style={{ flex: '1 1 110px' }}>
                      <label style={labelStyle}>Satuan</label>
                      <input value={k.unit} onChange={(e) => updateKr(i, 'unit', e.target.value)} placeholder="subscriber" style={inputStyle} />
                    </div>
                  </div>
                </div>
              ))}
              {krs.length < 3 && (
                <button onClick={() => setKrs(prev => [...prev, { label: '', baseline: '', target: '', unit: '' }])} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '7px 12px', background: 'transparent', color: C.primary, border: `1px dashed ${C.primary}`, borderRadius: 7, fontSize: 12.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                  <Plus size={13} /> Tambah KR lagi
                </button>
              )}
            </div>
          )}

          {/* Step 3 — Confidence (aha moment) */}
          {step === 3 && (
            <div>
              <h2 style={{ fontSize: 20, fontWeight: 800, margin: '0 0 6px', color: C.text, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Gauge size={20} color={C.primary} /> Check-in pertamamu
              </h2>
              <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.6, margin: '0 0 18px' }}>
                Ini yang membedakan dari spreadsheet: tiap minggu kamu jawab satu pertanyaan jujur — <strong style={{ color: C.text }}>seberapa yakin kamu bakal mencapainya?</strong> Geser slidernya.
              </p>
              {validKrs.map((k, i) => {
                const c = confidences[i] ?? 0.5;
                return (
                  <div key={i} style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 10, padding: 14, marginBottom: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 13.5, fontWeight: 600, color: C.text }}>{k.label}</span>
                      <span style={{ fontSize: 11, fontWeight: 700, color: confColor(c), whiteSpace: 'nowrap' }}>
                        {confLabel(c)} · {c.toFixed(2)}
                      </span>
                    </div>
                    <input
                      type="range" min={0} max={1} step={0.05} value={c}
                      onChange={(e) => setConfidences(prev => prev.map((v, idx) => idx === i ? parseFloat(e.target.value) : v))}
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
              <div style={{ fontSize: 12, color: C.muted, background: C.redSoft, borderRadius: 8, padding: '10px 12px', lineHeight: 1.5 }}>
                💡 Mulai di <strong>0.5</strong> itu normal dan sehat. Kalau dari awal sudah 1.0, targetmu mungkin kurang ambisius.
              </div>
            </div>
          )}

          {err && (
            <div style={{ marginTop: 14, padding: '9px 12px', background: C.redSoft, color: C.red, fontSize: 12.5, borderRadius: 6 }}>
              {err}
            </div>
          )}

          {/* Nav buttons */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 22 }}>
            {typeConfirmed && (step > 1 || askProjectType) ? (
              <button onClick={() => { setErr(''); if (step > 1) setStep(step - 1); else setTypeConfirmed(false); }} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 16px', fontSize: 13.5, fontWeight: 600, border: `1px solid ${C.border}`, background: C.white, color: C.text, borderRadius: 7, cursor: 'pointer', fontFamily: 'inherit' }}>
                <ArrowLeft size={14} /> Kembali
              </button>
            ) : <span />}
            {!typeConfirmed ? (
              <button
                onClick={() => setTypeConfirmed(true)}
                disabled={!projectType || (projectType === 'team' && !projectName.trim())}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 18px', fontSize: 13.5, fontWeight: 700, border: 'none', borderRadius: 7, fontFamily: 'inherit',
                  background: (!projectType || (projectType === 'team' && !projectName.trim())) ? C.border : C.primary,
                  color: (!projectType || (projectType === 'team' && !projectName.trim())) ? C.muted : C.white,
                  cursor: (!projectType || (projectType === 'team' && !projectName.trim())) ? 'not-allowed' : 'pointer' }}>
                Lanjut <ArrowRight size={14} />
              </button>
            ) : step < 3 ? (
              <button onClick={next} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 18px', fontSize: 13.5, fontWeight: 700, border: 'none', background: C.primary, color: C.white, borderRadius: 7, cursor: 'pointer', fontFamily: 'inherit' }}>
                Lanjut <ArrowRight size={14} />
              </button>
            ) : (
              <button onClick={finish} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 18px', fontSize: 13.5, fontWeight: 700, border: 'none', background: C.green, color: C.white, borderRadius: 7, cursor: 'pointer', fontFamily: 'inherit' }}>
                <Check size={15} /> Selesai — Mulai Tracking
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
