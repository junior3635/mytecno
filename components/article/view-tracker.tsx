'use client';

import { useEffect } from 'react';
import { trackRead } from '@/lib/reading-history';

const SEEN_KEY = 'mtn:seen-views';

export default function ViewTracker({ slug }: { slug: string }) {
  useEffect(() => {
    trackRead(slug);

    let seen: string[] = [];
    try {
      seen = JSON.parse(window.localStorage.getItem(SEEN_KEY) ?? '[]');
    } catch {
      seen = [];
    }
    if (Array.isArray(seen) && seen.includes(slug)) return;

    fetch(`/api/articles/${encodeURIComponent(slug)}/view`, { method: 'POST' }).catch(() => {});
    try {
      window.localStorage.setItem(
        SEEN_KEY,
        JSON.stringify([...(Array.isArray(seen) ? seen : []), slug].slice(-100))
      );
    } catch {
      // Storage unavailable; count every load instead.
    }
  }, [slug]);

  return null;
}