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
        className="admin-btn admin-btn-cyan"
      >
        Edit
      </Link>
      <button
        onClick={togglePublish}
        disabled={busy}
        className="admin-btn admin-btn-grey"
        style={{ cursor: busy ? 'not-allowed' : 'pointer' }}
      >
        {isPublished ? 'Unpublish' : 'Publish'}
      </button>
      <button
        onClick={deleteArticle}
        disabled={busy}
        className="admin-btn admin-btn-red"
        style={{ cursor: busy ? 'not-allowed' : 'pointer' }}
      >
        Delete
      </button>
    </div>
  );
}