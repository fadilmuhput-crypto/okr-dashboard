import React, { useState } from 'react';
import { Logo } from './Landing.jsx';
import { api } from './api.js';
import { trackEvent } from './analytics.js';
import { C } from './theme.js';

const inputStyle = {
  width: '100%', padding: '11px 13px', fontSize: 14, border: `1px solid ${C.border}`,
  borderRadius: 7, fontFamily: 'inherit', outline: 'none', background: C.white,
  color: C.text, boxSizing: 'border-box',
};
const labelStyle = {
  display: 'block', fontSize: 11, fontWeight: 700, color: C.muted,
  textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6,
};

export default function AuthScreen({ onAuthed, initialMode = 'login', guestSource = false }) {
  const [mode, setMode] = useState(initialMode); // 'login' | 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { user } = mode === 'login'
        ? await api.login(email.trim(), password)
        : await api.register(email.trim(), password, name.trim());
      trackEvent(mode === 'login' ? 'login' : 'sign_up', { method: 'email', source: guestSource ? 'guest_demo' : 'direct' });
      onAuthed(user);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: C.bg, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      padding: 16,
    }}>
      <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 14, padding: 32, maxWidth: 380, width: '100%', boxShadow: '0 8px 30px rgba(0,0,0,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 22, justifyContent: 'center' }}>
          <Logo size={30} />
          <span style={{ fontSize: 17, fontWeight: 800, letterSpacing: -0.3 }}>
            Own<span style={{ color: C.primary }}>the</span>Way
          </span>
        </div>

        <h1 style={{ fontSize: 19, fontWeight: 800, textAlign: 'center', margin: '0 0 4px' }}>
          {mode === 'login' ? 'Welcome back' : 'Create your account'}
        </h1>
        <p style={{ fontSize: 13, color: C.muted, textAlign: 'center', margin: '0 0 22px' }}>
          {mode === 'login' ? 'Sign in to continue your OKRs.' : 'Free — no credit card required.'}
        </p>

        <form onSubmit={submit}>
          {mode === 'register' && (
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" style={inputStyle} />
            </div>
          )}
          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>Email</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" style={inputStyle} />
          </div>
          <div style={{ marginBottom: 18 }}>
            <label style={labelStyle}>Password</label>
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder={mode === 'register' ? 'At least 8 characters' : '••••••••'} style={inputStyle} />
          </div>

          {error && (
            <div style={{ marginBottom: 14, padding: '9px 12px', background: C.redSoft, color: C.primary, fontSize: 12.5, borderRadius: 6 }}>
              {error}
            </div>
          )}

          <button type="submit" disabled={loading} style={{
            width: '100%', padding: '11px 16px', fontSize: 14, fontWeight: 700,
            background: C.primary, color: C.white, border: 'none', borderRadius: 7,
            cursor: loading ? 'default' : 'pointer', opacity: loading ? 0.7 : 1,
            fontFamily: 'inherit',
          }}>
            {loading ? 'Please wait…' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 18, fontSize: 13, color: C.muted }}>
          {mode === 'login' ? (
            <>Don't have an account?{' '}
              <button onClick={() => { setMode('register'); setError(''); }} style={{ background: 'none', border: 'none', color: C.primary, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, padding: 0 }}>
                Sign up
              </button>
            </>
          ) : (
            <>Already have an account?{' '}
              <button onClick={() => { setMode('login'); setError(''); }} style={{ background: 'none', border: 'none', color: C.primary, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, padding: 0 }}>
                Sign in
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
