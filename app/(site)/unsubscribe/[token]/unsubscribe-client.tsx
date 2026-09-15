'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function UnsubscribePage({ token }: { token: string }) {
  const [state, setState] = useState<'working' | 'done' | 'error'>('working');

  useEffect(() => {
    fetch(`/api/subscribers/${token}`, { method: 'DELETE' })
      .then((res) => setState(res.ok ? 'done' : 'error'))
      .catch(() => setState('error'));
  }, [token]);

  return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem 1.5rem' }}>
      <div style={{ maxWidth: '420px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 900, letterSpacing: '-0.04em', marginBottom: '1rem' }}>
          {state === 'done' ? "You're unsubscribed" : state === 'error' ? 'Link not recognized' : 'Unsubscribing…'}
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
          {state === 'done'
            ? "Sorry to see you go. You won't receive further newsletters from MyTechNews."
            : state === 'error'
              ? 'This unsubscribe link is invalid or already used.'
              : 'Please wait a moment…'}
        </p>
        <Link href="/" style={{ fontWeight: 800, fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--neon-cyan)' }}>
          ← Back to MyTechNews
        </Link>
      </div>
    </div>
  );
}