'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (res.ok) {
      router.push('/admin');
      router.refresh();
    } else {
      const data = await res.json();
      setError(data.error || 'Authentication failed');
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#000',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '420px',
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h1 style={{
            fontSize: '2rem',
            fontWeight: 900,
            letterSpacing: '-0.05em',
            textTransform: 'uppercase',
            background: 'linear-gradient(90deg, #fff 30%, #00f2fe)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '0.5rem',
          }}>
            MyTechNews
          </h1>
          <p style={{ color: '#71717a', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Admin Portal
          </p>
        </div>

        {/* Card */}
        <div style={{
          backgroundColor: '#0a0a0a',
          border: '1px solid #27272a',
          borderRadius: '1.5rem',
          padding: '2.5rem',
        }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem', letterSpacing: '-0.03em' }}>
            Sign in
          </h2>
          <p style={{ color: '#71717a', fontSize: '0.875rem', marginBottom: '2rem' }}>
            Enter your credentials to access the admin dashboard.
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#a1a1aa' }}>
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@mytecno.com"
                required
                style={{
                  width: '100%',
                  padding: '0.875rem 1rem',
                  backgroundColor: '#111',
                  border: '1px solid #3f3f46',
                  borderRadius: '0.75rem',
                  color: '#fff',
                  fontSize: '1rem',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#a1a1aa' }}>
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                style={{
                  width: '100%',
                  padding: '0.875rem 1rem',
                  backgroundColor: '#111',
                  border: '1px solid #3f3f46',
                  borderRadius: '0.75rem',
                  color: '#fff',
                  fontSize: '1rem',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                }}
              />
            </div>

            {error && (
              <div style={{
                padding: '0.875rem 1rem',
                backgroundColor: 'rgba(254,9,121,0.1)',
                border: '1px solid rgba(254,9,121,0.3)',
                borderRadius: '0.75rem',
                color: '#fe0979',
                fontSize: '0.875rem',
                fontWeight: 600,
              }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              id="login-submit"
              disabled={loading}
              style={{
                padding: '1rem',
                background: loading ? '#27272a' : 'linear-gradient(90deg, #00f2fe, #fe0979)',
                color: '#fff',
                border: 'none',
                borderRadius: '0.75rem',
                fontWeight: 800,
                fontSize: '1rem',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'opacity 0.2s, transform 0.1s',
                marginTop: '0.5rem',
              }}
            >
              {loading ? 'Signing in…' : 'Sign in →'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', marginTop: '2rem', color: '#3f3f46', fontSize: '0.8rem' }}>
          Protected area · MyTechNews Admin
        </p>
      </div>
    </div>
  );
}
