import React, { useState } from 'react';
import { LayoutDashboard, FileText, ArrowRight, Check, Gauge, Sun, Moon } from 'lucide-react';
import { C, setTheme } from './theme.js';

const goToApp = () => { window.location.href = '/app'; };

export function Logo({ size = 30 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" style={{ flexShrink: 0 }}>
      <rect width="32" height="32" rx="8" fill={C.primary} />
      {/* route: start dot → path with a turn → arrow ke kanan-atas */}
      <circle cx="10" cy="23" r="2.6" fill="#fff" />
      <path
        d="M10 23 V17 Q10 14 13 14 H17 Q20 14 20 11 V9.5"
        stroke="#fff" strokeWidth="2.6" strokeLinecap="round" fill="none"
      />
      <path d="M16.4 11 L20 6.6 L23.6 11" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

function Wordmark({ size = 16.5 }) {
  return (
    <span style={{ fontSize: size, fontWeight: 800, letterSpacing: -0.3 }}>
      Own<span style={{ color: C.primary }}>the</span>Way
    </span>
  );
}

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
    { label: 'Luncurkan program referral', conf: 0.55, color: C.yellow, tag: 'Watch' },
    { label: 'Turunkan churn di bawah 3%', conf: 0.35, color: C.red, tag: 'At Risk' },
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
          <div style={{ height: 6, background: 'var(--otw-borderLight)', borderRadius: 3, overflow: 'hidden' }}>
            <div style={{ width: `${r.conf * 100}%`, height: '100%', background: r.color, borderRadius: 3 }} />
          </div>
        </div>
      ))}
      <div style={{ fontSize: 11.5, color: C.muted, marginTop: 4 }}>
        Update tiap minggu. Tangkap masalah sebelum jadi kegagalan kuartal.
      </div>
    </div>
  );
}

export default function Landing() {
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 720;
  const [theme, setThemeState] = useState(() => typeof document !== 'undefined' ? (document.documentElement.getAttribute('data-theme') || 'light') : 'light');
  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    setThemeState(next);
  };

  const features = [
    {
      icon: Gauge, color: C.primary,
      title: 'Confidence check-in mingguan',
      desc: 'Angka progress bisa menipu — confidence tidak. Setiap Key Result punya skor confidence 0–1 yang kamu update tiap minggu, jadi KR berisiko kelihatan jauh sebelum deadline.',
    },
    {
      icon: LayoutDashboard, color: C.secondary,
      title: 'Director View',
      desc: 'Satu layar untuk semua Objective — lintas semua project kamu. Langsung terlihat mana yang on track, mana yang perlu perhatian, dan initiative mana yang telat.',
    },
    {
      icon: FileText, color: C.green,
      title: 'Laporan check-in sekali klik',
      desc: 'Generate laporan mingguan lengkap dalam format markdown — status semua KR, yang berisiko, yang telat — siap paste ke Slack, Notion, atau email ke atasan.',
    },
  ];

  const steps = [
    { n: '1', title: 'Tulis Objective & Key Results kamu', desc: 'Satu Objective yang ambisius, sampai 5 KR terukur, plus initiative yang mendorongnya.' },
    { n: '2', title: 'Check-in tiap minggu', desc: 'Update progress dan geser skor confidence kamu — 5 menit jujur tiap minggu.' },
    { n: '3', title: 'Bagikan statusnya', desc: 'Generate laporan check-in dan kirim ke tim. Semua orang tahu arahnya — dan risikonya.' },
  ];

  const faqs = [
    { q: 'Apa itu OKR?', a: 'OKR (Objectives and Key Results) adalah framework goal-setting yang dipakai Google, Intel, dan ribuan perusahaan lain: satu Objective ambisius diturunkan jadi 3–5 Key Results terukur, ditinjau secara berkala.' },
    { q: 'Beneran gratis?', a: 'Ya. Gratis untuk mulai, tanpa kartu kredit. Kamu akan membuat akun gratis supaya OKR dan riwayat check-in tersimpan aman dan bisa diakses dari perangkat mana saja.' },
    { q: 'Apa bedanya dengan spreadsheet?', a: 'Confidence tracking. Spreadsheet mencatat angka progress, tapi melewatkan sinyal risiko paling awal: seberapa yakin orang yang mengerjakannya. Plus laporan check-in otomatis, bukan copy-paste manual.' },
    { q: 'Bisa dipakai bareng tim?', a: 'Bisa — kamu bisa bikin project terpisah untuk tiap konteks (misalnya Personal dan Tim), plus Director View untuk lihat semuanya sekaligus. Kolaborasi multi-user dalam satu project ada di roadmap.' },
  ];

  return (
    <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', color: C.text, background: C.white }}>

      {/* Nav */}
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: isMobile ? '14px 18px' : '16px 40px', borderBottom: `1px solid ${C.border}`, position: 'sticky', top: 0, background: C.white, zIndex: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <Logo size={30} />
          <Wordmark />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button onClick={toggleTheme} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '8px 10px', background: C.white, color: C.muted, border: `1px solid ${C.border}`, borderRadius: 6, cursor: 'pointer' }} title={theme === 'dark' ? 'Light mode' : 'Dark mode'}>
            {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
          </button>
          <CTAButton>Buka App</CTAButton>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ padding: isMobile ? '48px 18px' : '80px 40px', maxWidth: 1080, margin: '0 auto', display: 'flex', gap: isMobile ? 36 : 48, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 400px', minWidth: 0 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, color: C.primary, background: C.redSoft, padding: '4px 12px', borderRadius: 14, marginBottom: 18 }}>
            Align Vision. Execute Better.
          </div>
          <h1 style={{ fontSize: isMobile ? 30 : 42, fontWeight: 800, lineHeight: 1.15, margin: '0 0 16px' }}>
            Angka bilang <span style={{ color: C.green }}>on track</span>.<br />
            Timmu bilang <span style={{ color: C.red }}>belum yakin</span>.<br />
            Mana yang bisa dipercaya?
          </h1>
          <p style={{ fontSize: isMobile ? 15 : 17, color: C.muted, lineHeight: 1.6, margin: '0 0 28px', maxWidth: 480 }}>
            OwntheWay adalah platform OKR dengan <strong style={{ color: C.text }}>confidence check-in mingguan</strong> — bukan cuma mengukur progress, tapi seberapa yakin kamu benar-benar akan mencapainya. Risiko kelihatan lebih awal, sebelum jadi kegagalan kuartal.
          </p>
          <CTAButton big>Coba Sekarang — Gratis</CTAButton>
          <div style={{ marginTop: 14, fontSize: 12.5, color: C.muted, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><Check size={13} color={C.green} /> Gratis untuk mulai</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><Check size={13} color={C.green} /> Tanpa kartu kredit</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><Check size={13} color={C.green} /> Setup 2 menit</span>
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
            Karena spreadsheet cuma mencatat angka — dan melewatkan sinyal risiko paling awal: keyakinan orang yang mengerjakannya.
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
          Ritual 5 menit tiap minggu
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
            Pertanyaan yang sering ditanyakan
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
          Kuartal terus berjalan.<br />Mulai check-in minggu ini.
        </h2>
        <p style={{ fontSize: 15, color: C.muted, margin: '0 0 28px' }}>
          Akun gratis, 2 menit aja. Tulis OKR pertamamu hari ini.
        </p>
        <CTAButton big>Buka OwntheWay</CTAButton>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: `1px solid ${C.border}`, padding: '24px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Logo size={22} />
          <Wordmark size={13} />
        </div>
        <span style={{ fontSize: 12, color: C.muted }}>Align Vision. Execute Better. · Gratis untuk mulai · {new Date().getFullYear()}</span>
      </footer>
    </div>
  );
}
