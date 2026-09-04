'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ArticleActions({ id, slug, isPublished }: { id: string; slug: string; isPublished: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function togglePublish() {
    setBusy(true);
    try {
      await fetch(`/api/articles/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublished: !isPublished }),
      });
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  async function deleteArticle() {
    if (!window.confirm(`Delete article "${slug}"? This cannot be undone.`)) return;
    setBusy(true);
    try {
      await fetch(`/api/articles/${id}`, { method: 'DELETE' });
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
      <Link
        href={`/admin/articles/${id}/edit`}
        style={{
          fontSize: '0.75rem',
          fontWeight: 700,
          padding: '0.3rem 0.7rem',
          borderRadius: '9999px',
          backgroundColor: 'rgba(0,242,254,0.08)',
          color: '#00f2fe',
          whiteSpace: 'nowrap',
        }}
      >
        Edit
      </Link>
      <button
        onClick={togglePublish}
        disabled={busy}
        style={{
          fontSize: '0.75rem',
          fontWeight: 700,
          padding: '0.3rem 0.7rem',
          borderRadius: '9999px',
          backgroundColor: 'rgba(113,113,122,0.08)',
          color: '#a1a1aa',
          border: 'none',
          cursor: busy ? 'not-allowed' : 'pointer',
          whiteSpace: 'nowrap',
        }}
      >
        {isPublished ? 'Unpublish' : 'Publish'}
      </button>
      <button
        onClick={deleteArticle}
        disabled={busy}
        style={{
          fontSize: '0.75rem',
          fontWeight: 700,
          padding: '0.3rem 0.7rem',
          borderRadius: '9999px',
          backgroundColor: 'rgba(254,9,121,0.08)',
          color: '#fe0979',
          border: 'none',
          cursor: busy ? 'not-allowed' : 'pointer',
          whiteSpace: 'nowrap',
        }}
      >
        Delete
      </button>
    </div>
  );
}