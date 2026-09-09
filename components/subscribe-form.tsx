'use client';

import { useState } from 'react';

export default function SubscribeForm() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('pending');
    setMessage('');

    const res = await fetch('/api/subscribers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();

    if (!res.ok) {
      setStatus('error');
      setMessage(data.error || 'Could not subscribe. Try again.');
      return;
    }

    setStatus('success');
    setMessage(data.message || "You're subscribed!");
    setEmail('');
  }

  return (
    <form onSubmit={submit} aria-label="Subscribe to newsletter">
      {status === 'success' ? (
        <p style={{ fontSize: '0.875rem', color: 'var(--neon-cyan)', fontWeight: 600 }}>✓ {message}</p>
      ) : (
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            aria-label="Email address"
            style={{
              padding: '0.6rem 0.9rem',
              borderRadius: '9999px',
              border: '1px solid var(--border-color)',
              background: 'transparent',
              color: 'var(--text-primary)',
              fontSize: '0.875rem',
              outline: 'none',
              minWidth: '200px',
            }}
          />
          <button
            type="submit"
            disabled={status === 'pending'}
            style={{
              padding: '0.6rem 1.4rem',
              borderRadius: '9999px',
              border: 'none',
              background: 'var(--accent-color)',
              color: 'var(--accent-text)',
              fontWeight: 800,
              fontSize: '0.825rem',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              cursor: status === 'pending' ? 'not-allowed' : 'pointer',
            }}
          >
            {status === 'pending' ? 'Subscribing…' : 'Subscribe'}
          </button>
        </div>
      )}
      {status === 'error' && <p style={{ fontSize: '0.825rem', color: 'var(--neon-magenta)', marginTop: '0.5rem' }}>{message}</p>}
    </form>
  );
}