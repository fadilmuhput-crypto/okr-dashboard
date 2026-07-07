import React, { useState, useEffect } from 'react';
import OKRDashboard from './OKRDashboard.jsx';
import AuthScreen from './AuthScreen.jsx';
import { Logo } from './Landing.jsx';
import { api } from './api.js';

function LoadingScreen() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FAFAFA' }}>
      <div style={{ opacity: 0.6 }}><Logo size={36} /></div>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(undefined); // undefined = checking, null = signed out

  useEffect(() => {
    api.me().then((r) => setUser(r.user)).catch(() => setUser(null));
  }, []);

  if (user === undefined) return <LoadingScreen />;
  if (user === null) return <AuthScreen onAuthed={setUser} />;
  return <OKRDashboard user={user} onLogout={async () => { await api.logout().catch(() => {}); setUser(null); }} />;
}
