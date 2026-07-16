import React, { useState, useEffect, useCallback } from 'react';
import { Link, Globe, GlobeOff, Copy, Check, ExternalLink } from 'lucide-react';
import { C } from '../theme.js';
import { Modal } from './UIComponents.jsx';
import { api } from '../api.js';

export default function ShareDialog({ projectId, onClose }) {
  const [isPublic, setIsPublic] = useState(false);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const data = await api.getShareState(projectId);
        setIsPublic(data.public);
        setToken(data.token);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    })();
  }, [projectId]);

  const handleToggle = useCallback(async () => {
    setToggling(true);
    try {
      const data = await api.togglePublicShare(projectId, !isPublic);
      setIsPublic(data.public);
      if (data.token) setToken(data.token);
    } catch (e) {
      console.error('Toggle share failed:', e);
    } finally {
      setToggling(false);
    }
  }, [projectId, isPublic]);

  const shareUrl = token ? `${window.location.origin}/share/${token}` : '';

  const handleCopy = useCallback(() => {
    if (shareUrl) {
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [shareUrl]);

  return (
    <Modal onClose={onClose}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <Link size={16} color={C.primary} />
        <span style={{ fontSize: 15, fontWeight: 600, color: C.text }}>Share Project</span>
      </div>

      <div style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: `1px solid ${C.border}` }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 500, color: C.text }}>Public Access</div>
            <div style={{ fontSize: 11.5, color: C.muted, marginTop: 2 }}>Anyone with the link can view this OKR</div>
          </div>
          <button
            onClick={handleToggle}
            disabled={toggling}
            style={{
              width: 44, height: 24, borderRadius: 12, border: 'none', cursor: toggling ? 'wait' : 'pointer',
              background: isPublic ? C.primary : C.border, position: 'relative', transition: 'background 0.2s',
            }}
          >
            <div style={{
              width: 18, height: 18, borderRadius: 9, background: C.white, position: 'absolute', top: 3,
              left: isPublic ? 23 : 3, transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
            }} />
          </button>
        </div>
      </div>

      {isPublic && shareUrl && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 500, color: C.muted, marginBottom: 6 }}>Share Link</div>
          <div style={{ display: 'flex', gap: 6 }}>
            <input
              readOnly
              value={shareUrl}
              style={{ flex: 1, fontSize: 12.5, padding: '8px 10px', border: `1px solid ${C.border}`, borderRadius: 6, background: C.bg, color: C.text, fontFamily: 'monospace' }}
              onClick={(e) => e.target.select()}
            />
            <button
              onClick={handleCopy}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '8px 12px', background: copied ? C.green : C.primary, color: C.white, border: 'none', borderRadius: 6, fontSize: 12.5, fontWeight: 600, cursor: 'pointer', transition: 'background 0.2s' }}
            >
              {copied ? <Check size={13} /> : <Copy size={13} />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
        <button onClick={onClose} style={{ padding: '7px 14px', fontSize: 13, fontWeight: 500, border: `1px solid ${C.border}`, borderRadius: 6, background: C.white, color: C.text, cursor: 'pointer' }}>
          Done
        </button>
      </div>
    </Modal>
  );
}
