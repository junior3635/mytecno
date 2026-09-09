'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CommentActions({ id, isApproved }: { id: string; isApproved: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function run(method: string, body?: Record<string, unknown>) {
    setBusy(true);
    try {
      await fetch(`/api/comments/${id}`, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: body ? JSON.stringify(body) : undefined,
      });
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
      {!isApproved && (
        <button
          disabled={busy}
          onClick={() => run('PUT', { approve: true })}
          className="admin-btn admin-btn-cyan"
          style={{ cursor: busy ? 'not-allowed' : 'pointer' }}
        >
          Approve
        </button>
      )}
      <button
        disabled={busy}
        onClick={() => run('DELETE')}
        className="admin-btn admin-btn-red"
        style={{ cursor: busy ? 'not-allowed' : 'pointer' }}
      >
        Delete
      </button>
    </div>
  );
}