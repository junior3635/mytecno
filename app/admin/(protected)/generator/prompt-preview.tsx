'use client';

import { useEffect, useRef, useState } from 'react';
import { buildArticlePrompt } from '@/lib/ai/prompts';

export default function PromptPreview({
  topic,
  engine,
  onClose,
}: {
  topic: string;
  engine: string;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const prompt = buildArticlePrompt(topic);

  async function copy() {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  }

  useEffect(() => {
    panelRef.current?.focus();
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        backgroundColor: 'rgba(0,0,0,0.75)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Article prompt preview"
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '860px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#0a0a0a',
          border: '1px solid #1f1f1f',
          borderRadius: '1rem',
          overflow: 'hidden',
          outline: 'none',
        }}
      >
        <header style={{ padding: '1.5rem 1.5rem 1rem', borderBottom: '1px solid #171717' }}>
          <div style={{ fontSize: '0.7rem', color: '#00f2fe', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
            Preview
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 900, letterSpacing: '-0.02em', margin: 0 }}>
            Article prompt
          </h2>
          <p style={{ fontSize: '0.8rem', color: '#71717a', lineHeight: 1.5, margin: '0.4rem 0 0' }}>
            {engine ? `Ready to send to ${engine}. Nothing has been sent yet.` : 'Nothing has been sent to the AI yet.'}
          </p>
        </header>

        <pre
          style={{
            flex: 1,
            margin: 0,
            padding: '1.5rem',
            overflow: 'auto',
            fontFamily: "'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace",
            fontSize: '0.78rem',
            lineHeight: 1.65,
            color: '#c4c4c4',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            backgroundColor: 'transparent',
          }}
        >
          {prompt}
        </pre>

        <footer style={{ padding: '1rem 1.5rem', borderTop: '1px solid #171717', display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={copy}
            style={{
              padding: '0.6rem 1.25rem',
              background: copied ? '#00f2fe' : 'linear-gradient(90deg, #00f2fe, #fe0979)',
              border: 'none',
              borderRadius: '9999px',
              color: copied ? '#000' : '#fff',
              fontWeight: 800,
              fontSize: '0.8rem',
              cursor: 'pointer',
            }}
          >
            {copied ? 'Copied' : 'Copy prompt'}
          </button>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '0.6rem 1.25rem',
              backgroundColor: 'transparent',
              border: '1px solid #27272a',
              borderRadius: '9999px',
              color: '#a1a1aa',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Close
          </button>
          <span style={{ marginLeft: 'auto', fontSize: '0.72rem', color: '#52525b', maxWidth: '340px', textAlign: 'right', lineHeight: 1.4 }}>
            Image and SEO-metadata prompts are written by the model once the draft exists, so they cannot be previewed in advance.
          </span>
        </footer>
      </div>
    </div>
  );
}