'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useState } from 'react';

const NAV = [
  { href: '/admin', label: 'Dashboard', icon: '⬡' },
  { href: '/admin/articles', label: 'Articles', icon: '◈' },
  { href: '/admin/categories', label: 'Categories', icon: '▤' },
  { href: '/admin/comments', label: 'Comments', icon: '◎' },
  { href: '/admin/subscribers', label: 'Subscribers', icon: '✉' },
  { href: '/admin/generator', label: 'AI Generator', icon: '✦' },
  { href: '/admin/logs', label: 'Logs', icon: '≡' },
  { href: '/admin/settings', label: 'Settings', icon: '⚙' },
];

export default function AdminSidebar({ email }: { email: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/admin/login');
    router.refresh();
  }

  return (
    <aside style={{
      width: '260px',
      minWidth: '260px',
      backgroundColor: '#0a0a0a',
      borderRight: '1px solid #1a1a1a',
      display: 'flex',
      flexDirection: 'column',
      padding: '1.5rem 1rem',
      gap: '0.5rem',
    }}>
      {/* Logo */}
      <div style={{ padding: '0.5rem 0.75rem', marginBottom: '1.5rem' }}>
        <div style={{
          fontSize: '1.1rem',
          fontWeight: 900,
          letterSpacing: '-0.04em',
          textTransform: 'uppercase',
          background: 'linear-gradient(90deg, #fff 30%, #00f2fe)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
          MyTechNews
        </div>
        <div style={{ fontSize: '0.7rem', color: '#52525b', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '0.2rem' }}>
          Admin Console
        </div>
      </div>

      {/* Nav Items */}
      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        {NAV.map(({ href, label, icon }) => {
          const active = pathname === href;
          return (
            <a
              key={href}
              href={href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem 1rem',
                borderRadius: '0.75rem',
                fontSize: '0.9rem',
                fontWeight: active ? 700 : 500,
                backgroundColor: active ? '#1a1a1a' : 'transparent',
                color: active ? '#fff' : '#71717a',
                borderLeft: active ? '2px solid #00f2fe' : '2px solid transparent',
                transition: 'all 0.15s ease',
              }}
            >
              <span style={{ fontSize: '1rem', width: '1.25rem', textAlign: 'center' }}>{icon}</span>
              {label}
            </a>
          );
        })}
      </nav>

      {/* Footer */}
      <div style={{ borderTop: '1px solid #1a1a1a', paddingTop: '1rem', marginTop: '1rem' }}>
        <div style={{ padding: '0.5rem 0.75rem', marginBottom: '0.75rem' }}>
          <div style={{ fontSize: '0.75rem', color: '#52525b', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Signed in as</div>
          <div style={{ fontSize: '0.875rem', color: '#a1a1aa', fontWeight: 600, marginTop: '0.2rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{email}</div>
        </div>
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          style={{
            width: '100%',
            padding: '0.65rem 1rem',
            backgroundColor: 'transparent',
            border: '1px solid #27272a',
            borderRadius: '0.75rem',
            color: '#71717a',
            fontSize: '0.875rem',
            fontWeight: 600,
            cursor: 'pointer',
            textAlign: 'left',
            transition: 'all 0.15s ease',
          }}
        >
          {loggingOut ? 'Signing out…' : '↩ Sign out'}
        </button>
      </div>
    </aside>
  );
}
