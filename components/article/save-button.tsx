'use client';

import { useSyncExternalStore } from 'react';

const STORAGE_KEY = 'mtn:bookmarks';

let snapshot: string[] = [];
const listeners = new Set<() => void>();
let loaded = false;

function load(): string[] {
  if (!loaded && typeof window !== 'undefined') {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      snapshot = Array.isArray(parsed)
        ? parsed.filter((s): s is string => typeof s === 'string')
        : [];
    } catch {
      snapshot = [];
    }
    loaded = true;
  }
  return snapshot;
}

function subscribe(onChange: () => void): () => void {
  listeners.add(onChange);
  return () => {
    listeners.delete(onChange);
  };
}

function emit() {
  for (const listener of listeners) listener();
}

export function readBookmarks(): string[] {
  return load();
}

export function toggleBookmark(slug: string): boolean {
  const list = load();
  const exists = list.includes(slug);
  snapshot = exists ? list.filter((s) => s !== slug) : [...list, slug];
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
  } catch {
    // Storage unavailable; keep in-memory only.
  }
  emit();
  return !exists;
}

export function useBookmarks(): string[] {
  return useSyncExternalStore(subscribe, load, load);
}

export default function SaveButton({ slug }: { slug: string }) {
  const saved = useBookmarks().includes(slug);

  return (
    <button
      type="button"
      className={`save-btn${saved ? ' save-btn--active' : ''}`}
      onClick={() => toggleBookmark(slug)}
      aria-pressed={saved}
    >
      {saved ? 'Saved ✓' : 'Save for later'}
    </button>
  );
}