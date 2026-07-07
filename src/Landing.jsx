import React from 'react';
import { LayoutDashboard, FileText, ArrowRight, Check, Gauge } from 'lucide-react';

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
    { label: 'Improve customer retention', conf: 0.75, color: C.green, tag: 'On Track' },
    { label: 'Launch referral program', conf: 0.55, color: C.yellow, tag: 'Watch' },
    { label: 'Cut churn below 3%', conf: 0.35, color: C.red, tag: 'At Risk' },
  ];
  return (
    <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20, boxShadow: '0 12px 40px rgba(0,0,0,0.08)', flex: '1 1 320px', maxWidth: 460 }}>
      <div style={{ fontSize: 10.5, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 14 }}>
        Week 6 Check-in — Confidence
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
        Update weekly. Catch problems before they become a missed quarter.
      </div>
    </div>
  );
}

export default function Landing() {
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 720;

  const features = [
    {
      icon: Gauge, color: C.primary,
      title: 'Weekly confidence check-ins',
      desc: 'Progress numbers can lie — confidence doesn\'t. Every Key Result carries a 0–1 confidence score you update weekly, so at-risk KRs surface long before the deadline does.',
    },
    {
      icon: LayoutDashboard, color: C.secondary,
      title: 'Director View',
      desc: 'One screen for every Objective — personal and team. Instantly see what\'s on track, what needs attention, and which initiatives are running late.',
    },
    {
      icon: FileText, color: C.green,
      title: 'One-click check-in reports',
      desc: 'Generate a complete weekly report in markdown — every KR\'s status, what\'s at risk, what\'s delayed — ready to paste into Slack, Notion, or an email to your boss.',
    },
  ];

  const steps = [
    { n: '1', title: 'Write your Objective & Key Results', desc: 'One aspirational Objective, up to 5 measurable KRs, plus the initiatives that drive them.' },
    { n: '2', title: 'Check in every week', desc: 'Update progress and slide your confidence score — 5 honest minutes a week.' },
    { n: '3', title: 'Share the status', desc: 'Generate a check-in report and send it to your team. Everyone knows the direction — and the risks.' },
  ];

  const faqs = [
    { q: 'What are OKRs?', a: 'OKRs (Objectives and Key Results) are the goal-setting framework used by Google, Intel, and thousands of companies: one ambitious Objective broken into 3–5 measurable Key Results, reviewed on a regular cadence.' },
    { q: 'Is it really free?', a: 'Yes. Free to start, no credit card required. You\'ll create a free account so your OKRs and check-in history are saved securely and available on any device.' },
    { q: 'How is this different from a spreadsheet?', a: 'Confidence tracking. A spreadsheet records progress numbers, but misses the earliest risk signal there is: how confident the people doing the work actually feel. Plus automatic check-in reports instead of manual copy-paste.' },
    { q: 'Can I use it with a team?', a: 'Yes — there are Personal and Team scopes, plus a Director View to see everything at once. Multi-user collaboration is on the roadmap.' },
  ];

  return (
    <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', color: C.text, background: C.white }}>

      {/* Nav */}
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: isMobile ? '14px 18px' : '16px 40px', borderBottom: `1px solid ${C.border}`, position: 'sticky', top: 0, background: C.white, zIndex: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <Logo size={30} />
          <Wordmark />
        </div>
        <CTAButton>Open App</CTAButton>
      </nav>

      {/* Hero */}
      <section style={{ padding: isMobile ? '48px 18px' : '80px 40px', maxWidth: 1080, margin: '0 auto', display: 'flex', gap: isMobile ? 36 : 48, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 400px', minWidth: 0 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, color: C.primary, background: C.redSoft, padding: '4px 12px', borderRadius: 14, marginBottom: 18 }}>
            Align Vision. Execute Better.
          </div>
          <h1 style={{ fontSize: isMobile ? 30 : 42, fontWeight: 800, lineHeight: 1.15, margin: '0 0 16px' }}>
            The numbers say <span style={{ color: C.green }}>on track</span>.<br />
            Your team says <span style={{ color: C.red }}>not sure</span>.<br />
            Which do you believe?
          </h1>
          <p style={{ fontSize: isMobile ? 15 : 17, color: C.muted, lineHeight: 1.6, margin: '0 0 28px', maxWidth: 480 }}>
            OwntheWay is an OKR platform with <strong style={{ color: C.text }}>weekly confidence check-ins</strong> — track not just progress, but how confident you are of actually hitting it. Risk shows up early, before it becomes a missed quarter.
          </p>
          <CTAButton big>Try It Now — Free</CTAButton>
          <div style={{ marginTop: 14, fontSize: 12.5, color: C.muted, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><Check size={13} color={C.green} /> Free to start</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><Check size={13} color={C.green} /> No credit card</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><Check size={13} color={C.green} /> 2-minute setup</span>
          </div>
        </div>
        <ConfidenceDemo />
      </section>

      {/* Features */}
      <section style={{ background: C.bg, padding: isMobile ? '48px 18px' : '72px 40px' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto' }}>
          <h2 style={{ fontSize: isMobile ? 24 : 30, fontWeight: 800, textAlign: 'center', margin: '0 0 10px' }}>
            Why not just a spreadsheet?
          </h2>
          <p style={{ fontSize: 15, color: C.muted, textAlign: 'center', margin: '0 auto 40px', maxWidth: 520 }}>
            Because spreadsheets capture numbers — and miss the earliest risk signal there is: the confidence of the people doing the work.
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
          A 5-minute weekly ritual
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
            Frequently asked questions
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
          The quarter keeps moving.<br />Start checking in this week.
        </h2>
        <p style={{ fontSize: 15, color: C.muted, margin: '0 0 28px' }}>
          Free account, takes 2 minutes. Write your first OKR today.
        </p>
        <CTAButton big>Open OwntheWay</CTAButton>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: `1px solid ${C.border}`, padding: '24px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Logo size={22} />
          <Wordmark size={13} />
        </div>
        <span style={{ fontSize: 12, color: C.muted }}>Align Vision. Execute Better. · Free · Your data stays in your browser · {new Date().getFullYear()}</span>
      </footer>
    </div>
  );
}
