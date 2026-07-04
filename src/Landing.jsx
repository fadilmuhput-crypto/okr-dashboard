import React from 'react';
import { Target, ListChecks, LayoutDashboard, FileText, ArrowRight, Check, Gauge } from 'lucide-react';

const C = {
  primary: '#E72D33',
  secondary: '#2E4DA0',
  green: '#1E8449',
  yellow: '#D68910',
  red: '#C0392B',
  text: '#1F1F1F',
  muted: '#7A7A7A',
  border: '#E0E0E0',
  bg: '#FAFAFA',
  white: '#FFFFFF',
  greenSoft: '#EAF5EE',
  yellowSoft: '#FDF6E3',
  redSoft: '#FBEAEA',
};

const goToApp = () => { window.location.href = '/app'; };

function CTAButton({ children, big }) {
  return (
    <button onClick={goToApp} style={{
      display: 'inline-flex', alignItems: 'center', gap: 8,
      padding: big ? '14px 28px' : '9px 18px',
      fontSize: big ? 16 : 13.5, fontWeight: 700,
      background: C.primary, color: C.white, border: 'none',
      borderRadius: 8, cursor: 'pointer',
      boxShadow: big ? '0 4px 14px rgba(231,45,51,0.35)' : 'none',
    }}>
      {children} <ArrowRight size={big ? 17 : 14} />
    </button>
  );
}

function ConfidenceDemo() {
  const rows = [
    { label: 'Naikkan retensi pelanggan', conf: 0.75, color: C.green, tag: 'On Track' },
    { label: 'Luncurkan fitur referral', conf: 0.55, color: C.yellow, tag: 'Watch' },
    { label: 'Kurangi churn ke bawah 3%', conf: 0.35, color: C.red, tag: 'At Risk' },
  ];
  return (
    <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20, boxShadow: '0 12px 40px rgba(0,0,0,0.08)', flex: '1 1 320px', maxWidth: 460 }}>
      <div style={{ fontSize: 10.5, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 14 }}>
        Check-in Minggu 6 — Confidence
      </div>
      {rows.map((r) => (
        <div key={r.label} style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6, gap: 8 }}>
            <span style={{ fontSize: 13.5, fontWeight: 600, color: C.text }}>{r.label}</span>
            <span style={{ fontSize: 10.5, fontWeight: 700, color: r.color, background: r.conf >= 0.7 ? C.greenSoft : r.conf >= 0.5 ? C.yellowSoft : C.redSoft, padding: '2px 8px', borderRadius: 10, whiteSpace: 'nowrap' }}>
              {r.tag} · {r.conf.toFixed(2)}
            </span>
          </div>
          <div style={{ height: 6, background: '#F0F0F0', borderRadius: 3, overflow: 'hidden' }}>
            <div style={{ width: `${r.conf * 100}%`, height: '100%', background: r.color, borderRadius: 3 }} />
          </div>
        </div>
      ))}
      <div style={{ fontSize: 11.5, color: C.muted, marginTop: 4 }}>
        Update tiap minggu. Lihat masalah sebelum jadi kegagalan kuartal.
      </div>
    </div>
  );
}

export default function Landing() {
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 720;

  const features = [
    {
      icon: Gauge, color: C.primary,
      title: 'Confidence check-in mingguan',
      desc: 'Angka progress bisa menipu — keyakinan tidak. Setiap Key Result punya skor confidence 0–1 yang kamu update tiap minggu, jadi KR yang berisiko meleset kelihatan lebih awal.',
    },
    {
      icon: LayoutDashboard, color: C.secondary,
      title: 'Director View',
      desc: 'Satu layar untuk semua Objective — personal & tim. Langsung terlihat mana yang on track, mana yang perlu diperhatikan, dan inisiatif mana yang delayed.',
    },
    {
      icon: FileText, color: C.green,
      title: 'Laporan check-in sekali klik',
      desc: 'Generate laporan mingguan lengkap dalam format markdown — status semua KR, yang at-risk, yang delayed — siap paste ke Slack, Notion, atau email ke atasan.',
    },
  ];

  const steps = [
    { n: '1', title: 'Tulis Objective & Key Results', desc: 'Satu Objective aspiratif, maksimal 5 KR terukur, plus inisiatif pendukungnya.' },
    { n: '2', title: 'Check-in tiap minggu', desc: 'Update progress dan geser confidence slider — 5 menit per minggu, jujur pada diri sendiri.' },
    { n: '3', title: 'Bagikan statusnya', desc: 'Generate laporan check-in dan kirim ke tim. Semua orang tahu arah dan risikonya.' },
  ];

  const faqs = [
    { q: 'Apa itu OKR?', a: 'OKR (Objectives and Key Results) adalah kerangka goal-setting yang dipakai Google, Intel, dan ribuan perusahaan: satu Objective ambisius diturunkan jadi 3-5 Key Results terukur, ditinjau secara berkala.' },
    { q: 'Benar-benar gratis?', a: 'Ya. Tanpa daftar akun, tanpa kartu kredit. Data OKR kamu tersimpan di browser kamu sendiri (localStorage) — tidak dikirim ke server mana pun.' },
    { q: 'Apa bedanya dengan spreadsheet?', a: 'Confidence tracking. Spreadsheet mencatat angka progress, tapi tidak menangkap keyakinan orang yang mengerjakannya — padahal itu sinyal risiko paling awal. Plus laporan check-in otomatis, bukan copy-paste manual.' },
    { q: 'Bisa dipakai untuk tim?', a: 'Bisa — ada scope Personal dan Team, plus Director View untuk melihat semuanya sekaligus. Fitur kolaborasi multi-user sedang disiapkan.' },
  ];

  return (
    <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', color: C.text, background: C.white }}>

      {/* Nav */}
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: isMobile ? '14px 18px' : '16px 40px', borderBottom: `1px solid ${C.border}`, position: 'sticky', top: 0, background: C.white, zIndex: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <div style={{ width: 30, height: 30, background: C.primary, borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Target size={17} color={C.white} />
          </div>
          <span style={{ fontSize: 16.5, fontWeight: 700 }}>OKR Dashboard</span>
        </div>
        <CTAButton>Buka App</CTAButton>
      </nav>

      {/* Hero */}
      <section style={{ padding: isMobile ? '48px 18px' : '80px 40px', maxWidth: 1080, margin: '0 auto', display: 'flex', gap: isMobile ? 36 : 48, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 400px', minWidth: 0 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, color: C.primary, background: C.redSoft, padding: '4px 12px', borderRadius: 14, marginBottom: 18 }}>
            Gratis · Tanpa daftar · Data di browser kamu
          </div>
          <h1 style={{ fontSize: isMobile ? 30 : 42, fontWeight: 800, lineHeight: 1.15, margin: '0 0 16px' }}>
            Target bilang <span style={{ color: C.green }}>on track</span>.<br />
            Tim kamu bilang <span style={{ color: C.red }}>gak yakin</span>.<br />
            Mana yang benar?
          </h1>
          <p style={{ fontSize: isMobile ? 15 : 17, color: C.muted, lineHeight: 1.6, margin: '0 0 28px', maxWidth: 480 }}>
            Dashboard OKR dengan <strong style={{ color: C.text }}>confidence check-in mingguan</strong> — ukur bukan cuma progress, tapi seberapa yakin kamu mencapainya. Risiko kelihatan lebih awal, sebelum jadi kegagalan kuartal.
          </p>
          <CTAButton big>Coba Sekarang — Gratis</CTAButton>
          <div style={{ marginTop: 14, fontSize: 12.5, color: C.muted, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><Check size={13} color={C.green} /> Tanpa akun</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><Check size={13} color={C.green} /> Tanpa kartu kredit</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><Check size={13} color={C.green} /> Langsung pakai</span>
          </div>
        </div>
        <ConfidenceDemo />
      </section>

      {/* Features */}
      <section style={{ background: C.bg, padding: isMobile ? '48px 18px' : '72px 40px' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto' }}>
          <h2 style={{ fontSize: isMobile ? 24 : 30, fontWeight: 800, textAlign: 'center', margin: '0 0 10px' }}>
            Kenapa bukan spreadsheet saja?
          </h2>
          <p style={{ fontSize: 15, color: C.muted, textAlign: 'center', margin: '0 auto 40px', maxWidth: 520 }}>
            Karena spreadsheet mencatat angka, tapi tidak menangkap sinyal risiko paling awal: keyakinan orang yang mengerjakannya.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: 20 }}>
            {features.map((f) => (
              <div key={f.title} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: 24 }}>
                <div style={{ width: 40, height: 40, borderRadius: 9, background: `${f.color}14`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                  <f.icon size={20} color={f.color} />
                </div>
                <div style={{ fontSize: 16.5, fontWeight: 700, marginBottom: 8 }}>{f.title}</div>
                <div style={{ fontSize: 13.5, color: C.muted, lineHeight: 1.6 }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section style={{ padding: isMobile ? '48px 18px' : '72px 40px', maxWidth: 880, margin: '0 auto' }}>
        <h2 style={{ fontSize: isMobile ? 24 : 30, fontWeight: 800, textAlign: 'center', margin: '0 0 40px' }}>
          Ritual 5 menit per minggu
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {steps.map((s, i) => (
            <div key={s.n} style={{ display: 'flex', gap: 20, position: 'relative', paddingBottom: i < steps.length - 1 ? 36 : 0 }}>
              {i < steps.length - 1 && (
                <div style={{ position: 'absolute', left: 19, top: 40, bottom: 0, width: 2, background: C.border }} />
              )}
              <div style={{ width: 40, height: 40, borderRadius: 20, background: C.primary, color: C.white, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 800, flexShrink: 0, zIndex: 1 }}>
                {s.n}
              </div>
              <div style={{ paddingTop: 6 }}>
                <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 4 }}>{s.title}</div>
                <div style={{ fontSize: 14, color: C.muted, lineHeight: 1.6 }}>{s.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section style={{ background: C.bg, padding: isMobile ? '48px 18px' : '72px 40px' }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <h2 style={{ fontSize: isMobile ? 24 : 30, fontWeight: 800, textAlign: 'center', margin: '0 0 36px' }}>
            Pertanyaan umum
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {faqs.map((f) => (
              <div key={f.q} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: '18px 22px' }}>
                <div style={{ fontSize: 15.5, fontWeight: 700, marginBottom: 6 }}>{f.q}</div>
                <div style={{ fontSize: 13.5, color: C.muted, lineHeight: 1.65 }}>{f.a}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section style={{ padding: isMobile ? '56px 18px' : '80px 40px', textAlign: 'center' }}>
        <h2 style={{ fontSize: isMobile ? 26 : 34, fontWeight: 800, margin: '0 0 12px' }}>
          Kuartal berjalan terus.<br />Mulai check-in minggu ini.
        </h2>
        <p style={{ fontSize: 15, color: C.muted, margin: '0 0 28px' }}>
          Tanpa daftar. Tanpa setup. Buka dan langsung tulis OKR pertamamu.
        </p>
        <CTAButton big>Buka OKR Dashboard</CTAButton>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: `1px solid ${C.border}`, padding: '24px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 22, height: 22, background: C.primary, borderRadius: 5, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Target size={12} color={C.white} />
          </div>
          <span style={{ fontSize: 13, fontWeight: 700 }}>OKR Dashboard</span>
        </div>
        <span style={{ fontSize: 12, color: C.muted }}>Gratis · Data tersimpan di browser kamu · {new Date().getFullYear()}</span>
      </footer>
    </div>
  );
}
