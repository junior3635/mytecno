'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

export default function SearchBox() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [q, setQ] = useState(searchParams.get('q') || '');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = q.trim();
    if (!trimmed) return router.push('/');
    const params = new URLSearchParams();
    const category = searchParams.get('category');
    if (category) params.set('category', category);
    params.set('q', trimmed);
    router.push(`/?${params.toString()}`);
  }

  return (
    <form onSubmit={handleSubmit} role="search" style={{ display: 'flex', alignItems: 'center' }}>
      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search articles…"
        aria-label="Search articles"
        style={{
          padding: '0.4rem 0.9rem',
          borderRadius: '9999px',
          border: '1px solid var(--border-color)',
          background: 'transparent',
          color: 'var(--text-primary)',
          fontSize: '0.85rem',
          outline: 'none',
          width: '160px',
          transition: 'width 0.2s',
        }}
      />
    </form>
  );
}