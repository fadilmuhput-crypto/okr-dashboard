import React, { useState, useCallback } from 'react';
import { Sparkles, Target, Calendar, Lightbulb, ArrowRight, Loader2, Copy, Check, X } from 'lucide-react';
import { C } from '../theme.js';
import { Modal } from './UIComponents.jsx';
import { api } from '../api.js';

export default function VisionBuilder({ onClose, onApplyObjective }) {
  const [input, setInput] = useState('');
  const [vision, setVision] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const handleGenerate = useCallback(async () => {
    if (input.trim().length < 10) return;
    setLoading(true);
    setError('');
    try {
      const res = await api.generateVision(input.trim());
      setVision(res.vision);
    } catch (e) {
      setError(e.message || 'Failed to generate vision');
    } finally {
      setLoading(false);
    }
  }, [input]);

  const handleCopy = useCallback(() => {
    if (!vision) return;
    const text = `Vision: ${vision.vision}\n\nAnnual Theme: ${vision.annualTheme}\n\nStrategic Priorities:\n${vision.strategicPriorities.map((p, i) => `${i + 1}. ${p}`).join('\n')}\n\nQuarterly Focus: ${vision.quarterlyFocus}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [vision]);

  const handleUseAsObjective = useCallback(() => {
    if (vision && onApplyObjective) {
      onApplyObjective(vision);
    }
  }, [vision, onApplyObjective]);

  return (
    <Modal onClose={onClose} maxWidth={600}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
        <Sparkles size={18} color={C.primary} />
        <span style={{ fontSize: 16, fontWeight: 700, color: C.text }}>Vision Builder</span>
      </div>
      <div style={{ fontSize: 12.5, color: C.muted, marginBottom: 16 }}>
        Transform your rough ideas into a clear strategic vision with AI guidance.
      </div>

      {!vision ? (
        <>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: C.muted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>
              Describe your vision
            </label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="e.g. We want to become the leading platform for remote team productivity in Southeast Asia. Currently we have 10K users but need to grow to 100K while maintaining NPS above 50..."
              style={{ width: '100%', minHeight: 120, padding: 12, fontSize: 13, border: `1px solid ${C.border}`, borderRadius: 8, fontFamily: 'inherit', outline: 'none', resize: 'vertical', color: C.text, background: C.bg, lineHeight: 1.5, boxSizing: 'border-box' }}
            />
            <div style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>
              Include: your aspiration, current situation, timeline, and any constraints. The more context, the better the output.
            </div>
          </div>

          {error && (
            <div style={{ padding: '8px 12px', background: C.redSoft, color: C.red, fontSize: 12, borderRadius: 6, marginBottom: 12 }}>
              {error}
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <button onClick={onClose} style={{ padding: '8px 14px', fontSize: 13, fontWeight: 500, border: `1px solid ${C.border}`, background: C.white, color: C.text, borderRadius: 6, cursor: 'pointer' }}>
              Cancel
            </button>
            <button
              onClick={handleGenerate}
              disabled={loading || input.trim().length < 10}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px',
                fontSize: 13, fontWeight: 600, border: 'none', borderRadius: 6, cursor: loading || input.trim().length < 10 ? 'not-allowed' : 'pointer',
                background: loading || input.trim().length < 10 ? C.border : C.primary,
                color: loading || input.trim().length < 10 ? C.muted : C.white,
              }}
            >
              {loading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
              {loading ? 'Generating...' : 'Generate Vision'}
            </button>
          </div>
        </>
      ) : (
        <div>
          {/* Vision Statement */}
          <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: 16, marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
              <Target size={14} color={C.primary} />
              <span style={{ fontSize: 11, fontWeight: 700, color: C.primary, textTransform: 'uppercase', letterSpacing: 0.5 }}>Vision Statement</span>
            </div>
            <div style={{ fontSize: 15, fontWeight: 600, color: C.text, lineHeight: 1.5 }}>{vision.vision}</div>
          </div>

          {/* Annual Theme */}
          <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: 16, marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
              <Calendar size={14} color={C.secondary} />
              <span style={{ fontSize: 11, fontWeight: 700, color: C.secondary, textTransform: 'uppercase', letterSpacing: 0.5 }}>Annual Theme</span>
            </div>
            <div style={{ fontSize: 18, fontWeight: 700, color: C.text }}>{vision.annualTheme}</div>
          </div>

          {/* Strategic Priorities */}
          <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: 16, marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
              <Lightbulb size={14} color={C.yellow} />
              <span style={{ fontSize: 11, fontWeight: 700, color: C.yellow, textTransform: 'uppercase', letterSpacing: 0.5 }}>Strategic Priorities</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {vision.strategicPriorities.map((p, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 13, color: C.text }}>
                  <span style={{ fontWeight: 700, color: C.primary, minWidth: 16 }}>{i + 1}.</span>
                  <span>{p}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quarterly Focus */}
          <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: 16, marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
              <ArrowRight size={14} color={C.green} />
              <span style={{ fontSize: 11, fontWeight: 700, color: C.green, textTransform: 'uppercase', letterSpacing: 0.5 }}>This Quarter's Focus</span>
            </div>
            <div style={{ fontSize: 13, fontWeight: 500, color: C.text, lineHeight: 1.5 }}>{vision.quarterlyFocus}</div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <button onClick={handleCopy} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '8px 12px', fontSize: 12.5, fontWeight: 500, border: `1px solid ${C.border}`, background: C.white, color: C.text, borderRadius: 6, cursor: 'pointer' }}>
              {copied ? <Check size={13} color={C.green} /> : <Copy size={13} />}
              {copied ? 'Copied' : 'Copy'}
            </button>
            <button onClick={handleUseAsObjective} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '8px 14px', fontSize: 13, fontWeight: 600, border: 'none', background: C.primary, color: C.white, borderRadius: 6, cursor: 'pointer' }}>
              <ArrowRight size={13} /> Use as OKR Objective
            </button>
            <button onClick={() => { setVision(null); setInput(''); }} style={{ padding: '8px 14px', fontSize: 13, fontWeight: 500, border: `1px solid ${C.border}`, background: C.white, color: C.text, borderRadius: 6, cursor: 'pointer' }}>
              Start Over
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}
