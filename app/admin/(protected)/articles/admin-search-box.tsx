'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

export default function AdminSearchBox({ placeholder }: { placeholder?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [q, setQ] = useState(searchParams.get('q') || '');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = q.trim();
    if (!trimmed) {
      router.push(window.location.pathname);
    } else {
      router.push(`${window.location.pathname}?q=${encodeURIComponent(trimmed)}`);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      role="search"
      style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, maxWidth: '320px' }}
    >
      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={placeholder || 'Search…'}
        aria-label="Search"
        style={{
          flex: 1,
          padding: '0.6rem 0.9rem',
          backgroundColor: '#111',
          border: '1px solid #27272a',
          borderRadius: '0.75rem',
          color: '#fff',
          fontSize: '0.85rem',
          outline: 'none',
        }}
      />
      {q && (
        <button
          type="submit"
          onClick={() => setQ('')}
          aria-label="Clear search"
          style={{ background: 'none', border: 'none', color: '#52525b', cursor: 'pointer', fontSize: '1rem' }}
        >
          ×
        </button>
      )}
    </form>
  );
}