import React, { useState, useEffect, useRef } from 'react';
import OKRDashboard from './OKRDashboard.jsx';
import AuthScreen from './AuthScreen.jsx';
import OnboardingWizard from './OnboardingWizard.jsx';
import GuestPreview from './GuestPreview.jsx';
import PublicShareView from './PublicShareView.jsx';
import { Logo } from './Landing.jsx';
import { api } from './api.js';
import { trackEvent } from './analytics.js';

const GUEST_DRAFT_KEY = 'okr-guest-draft';

function readGuestDraft() {
  try {
    const raw = localStorage.getItem(GUEST_DRAFT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) { return null; }
}

function LoadingScreen() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FAFAFA' }}>
      <div style={{ opacity: 0.6 }}><Logo size={36} /></div>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(undefined); // undefined = checking, null = signed out
  const [guestDraft, setGuestDraft] = useState(() => readGuestDraft());
  const [authMode, setAuthMode] = useState(null); // null | 'login' | 'register'
  const [pendingGuestDraft, setPendingGuestDraft] = useState(null);

  // Check if this is a public share route
  const shareMatch = window.location.pathname.match(/^\/share\/([a-zA-Z0-9]+)$/);

  useEffect(() => {
    api.me().then((r) => setUser(r.user)).catch(() => setUser(null));
  }, []);

  const didTrackStart = useRef(false);
  useEffect(() => {
    if (didTrackStart.current) return;
    didTrackStart.current = true;
    if (!guestDraft && !authMode) trackEvent('guest_demo_started');
    // Only fire on the very first render of the empty-wizard state, not on every draft edit.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const persistDraft = (draft) => {
    setGuestDraft(draft);
    try { localStorage.setItem(GUEST_DRAFT_KEY, JSON.stringify(draft)); } catch (e) { /* ignore */ }
  };

  const handleGuestAuthed = (authedUser) => {
    setPendingGuestDraft(guestDraft);
    setUser(authedUser);
  };

  if (user === undefined) return <LoadingScreen />;

  // Public share route (no auth required)
  if (shareMatch) {
    return <PublicShareView token={shareMatch[1]} />;
  }

  if (user === null) {
    if (authMode) {
      return <AuthScreen initialMode={authMode} guestSource={!!guestDraft} onAuthed={handleGuestAuthed} />;
    }
    if (guestDraft) {
      return (
        <GuestPreview
          draft={guestDraft}
          onDraftChange={persistDraft}
          onSave={() => setAuthMode('register')}
          onLogin={() => setAuthMode('login')}
        />
      );
    }
    return (
      <OnboardingWizard
        askProjectType
        onComplete={(obj, projectMeta) => { trackEvent('guest_demo_completed'); persistDraft({ obj, projectMeta }); }}
        onSkip={() => setAuthMode('register')}
        secondaryLink={{ label: 'Sudah punya akun? Masuk', onClick: () => setAuthMode('login') }}
      />
    );
  }

  return (
    <OKRDashboard
      user={user}
      pendingGuestDraft={pendingGuestDraft}
      onLogout={async () => { await api.logout().catch(() => {}); setUser(null); }}
    />
  );
}
