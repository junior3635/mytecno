'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SubscriberActions({ id, token }: { id: string; token: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  async function remove() {
    if (!window.confirm('Delete this subscriber permanently?')) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/subscribers/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      router.refresh();
    } catch {
      setBusy(false);
    }
  }

  function copyUnsubscribeLink() {
    const url = `${window.location.origin}/unsubscribe/${token}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  return (
    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexShrink: 0 }}>
      <button
        onClick={copyUnsubscribeLink}
        className="admin-btn admin-btn-cyan"
      >
        {copied ? 'Copied!' : 'Copy link'}
      </button>
      <button
        onClick={remove}
        disabled={busy}
        className="admin-btn admin-btn-red"
        style={{ cursor: busy ? 'not-allowed' : 'pointer' }}
      >
        {busy ? '…' : 'Delete'}
      </button>
    </div>
  );
}