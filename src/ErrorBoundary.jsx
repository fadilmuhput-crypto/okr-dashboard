import React from 'react';
import { C, FONT_FAMILY } from './theme.js';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary]', error, errorInfo);
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{
          fontFamily: FONT_FAMILY, background: C.bg, minHeight: '100vh',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
        }}>
          <div style={{
            background: C.white, border: `1px solid ${C.border}`, borderRadius: 12,
            maxWidth: 480, width: '100%', padding: 32, textAlign: 'center',
          }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>⚠️</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: C.text, marginBottom: 8 }}>
              Something went wrong
            </div>
            <div style={{ fontSize: 13, color: C.muted, marginBottom: 20, lineHeight: 1.5 }}>
              An unexpected error occurred. Your data is safe — try reloading the page.
            </div>
            <button
              onClick={() => { this.setState({ error: null }); window.location.reload(); }}
              style={{
                padding: '10px 20px', fontSize: 13, fontWeight: 600,
                background: C.primary, color: C.white, border: 'none',
                borderRadius: 7, cursor: 'pointer', fontFamily: FONT_FAMILY,
              }}
            >
              Reload page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
