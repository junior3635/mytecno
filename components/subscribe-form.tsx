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
    <form onSubmit={submit} className="subscribe-form" aria-label="Subscribe to newsletter">
      {status === 'success' ? (
        <p className="subscribe-form__success">✓ {message}</p>
      ) : (
        <div className="subscribe-form__row">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            aria-label="Email address"
            className="subscribe-input"
          />
          <button type="submit" disabled={status === 'pending'} className="subscribe-btn">
            {status === 'pending' ? 'Subscribing…' : 'Subscribe'}
          </button>
        </div>
      )}
      {status === 'error' && <p className="subscribe-form__error">{message}</p>}
    </form>
  );
}