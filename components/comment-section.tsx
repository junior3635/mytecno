'use client';

import { useEffect, useState } from 'react';

type Comment = { id: string; name: string; body: string; createdAt: string };

export default function CommentSection({ articleId }: { articleId: string }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [body, setBody] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`/api/comments?articleId=${encodeURIComponent(articleId)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setComments(data?.comments || []))
      .catch(() => {});
  }, [articleId]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('sending');
    setError('');

    const res = await fetch('/api/comments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ articleId, name, email: email || undefined, body }),
    });
    const data = await res.json();

    if (!res.ok) {
      setStatus('error');
      setError(data.error || 'Could not post your comment.');
      return;
    }

    setStatus('sent');
    setName('');
    setEmail('');
    setBody('');
  }

  return (
    <section style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid var(--border-color)' }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '1.5rem' }}>
        Comments
      </h2>

      {comments.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '2.5rem' }}>
          {comments.map((c) => (
            <div key={c.id}>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'baseline', marginBottom: '0.3rem' }}>
                <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{c.name}</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  {new Date(c.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
              <p style={{ fontSize: '0.95rem', lineHeight: 1.7, color: 'var(--text-secondary)' }}>{c.body}</p>
            </div>
          ))}
        </div>
      )}

      {status === 'sent' ? (
        <div style={{ padding: '1rem 1.25rem', backgroundColor: 'rgba(0,242,254,0.06)', border: '1px solid rgba(0,242,254,0.2)', borderRadius: '0.75rem', color: 'var(--text-primary)', fontSize: '0.9rem' }}>
          Thanks for commenting! Your comment is awaiting moderation before it appears.
        </div>
      ) : (
        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem', maxWidth: '520px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              required
              style={{ padding: '0.7rem 0.9rem', backgroundColor: 'var(--surface-color)', border: '1px solid var(--border-color)', borderRadius: '0.6rem', color: 'var(--text-primary)', fontSize: '0.9rem', outline: 'none' }}
            />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email (optional)"
              style={{ padding: '0.7rem 0.9rem', backgroundColor: 'var(--surface-color)', border: '1px solid var(--border-color)', borderRadius: '0.6rem', color: 'var(--text-primary)', fontSize: '0.9rem', outline: 'none' }}
            />
          </div>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Join the discussion…"
            required
            maxLength={1000}
            rows={4}
            style={{ padding: '0.7rem 0.9rem', backgroundColor: 'var(--surface-color)', border: '1px solid var(--border-color)', borderRadius: '0.6rem', color: 'var(--text-primary)', fontSize: '0.9rem', outline: 'none', resize: 'vertical', fontFamily: 'inherit' }}
          />
          {status === 'error' && (
            <p style={{ color: 'var(--neon-magenta)', fontSize: '0.85rem', fontWeight: 600 }}>{error}</p>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button
              type="submit"
              disabled={status === 'sending'}
              style={{
                padding: '0.75rem 1.5rem',
                background: status === 'sending' ? 'var(--border-color)' : 'var(--accent-color)',
                color: 'var(--accent-text)',
                border: 'none',
                borderRadius: '9999px',
                fontWeight: 800,
                fontSize: '0.875rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                cursor: status === 'sending' ? 'not-allowed' : 'pointer',
              }}
            >
              {status === 'sending' ? 'Posting…' : 'Post comment'}
            </button>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Comments await moderation.
            </span>
          </div>
        </form>
      )}
    </section>
  );
}