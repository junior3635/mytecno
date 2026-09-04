'use client';

import { useEffect, useState } from 'react';

export default function ThemeToggle() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  // Sync with the persisted/system theme AFTER hydration (deferred so it never
  // mismatches the SSR markup, and avoids synchronous setState in the effect).
  useEffect(() => {
    const t = document.documentElement.dataset.theme;
    const id = setTimeout(() => setTheme(t === 'light' ? 'light' : 'dark'), 0);
    return () => clearTimeout(id);
  }, []);

  function toggle() {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem('theme', next);
    } catch {
      // storage unavailable — theme just applies for this visit
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      style={{
        fontSize: '0.85rem',
        fontWeight: 800,
        padding: '0.4rem 0.8rem',
        borderRadius: '9999px',
        border: '1px solid var(--border-color)',
        background: 'transparent',
        color: 'var(--text-primary)',
        cursor: 'pointer',
        transition: 'all 0.2s',
      }}
    >
      {theme === 'dark' ? '☀' : '☾'}
    </button>
  );
}