'use client';

import { useSyncExternalStore } from 'react';

const HISTORY_KEY = 'mtn:history';
const MAX_HISTORY = 50;

let history: string[] = [];
const listeners = new Set<() => void>();
let loaded = false;

function load(): string[] {
  if (!loaded && typeof window !== 'undefined') {
    try {
      const raw = window.localStorage.getItem(HISTORY_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      history = Array.isArray(parsed)
        ? parsed.filter((s): s is string => typeof s === 'string').slice(0, MAX_HISTORY)
        : [];
    } catch {
      history = [];
    }
    loaded = true;
  }
  return history;
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

export function readHistory(): string[] {
  return load();
}

export function trackRead(slug: string): void {
  const list = load();
  history = [slug, ...list.filter((s) => s !== slug)].slice(0, MAX_HISTORY);
  try {
    window.localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch {
    // Storage unavailable; keep in-memory only.
  }
  emit();
}

export function useReadingHistory(): string[] {
  return useSyncExternalStore(subscribe, load, load);
}