'use client';

import { useEffect, useState } from 'react';
import type { ProviderId } from '@/lib/ai/types';
import { AI_PROVIDERS } from '@/lib/ai/models';
import PromptPreview from './prompt-preview';

const SUGGESTED_TOPICS = [
  'NVIDIA Blackwell B200X GPU Review',
  'iOS 21 Hidden Features Guide',
  'Best Mechanical Keyboards 2026',
  'Quantum Computing Explained',
  'AI Coding Tools Compared',
  'USB4 vs Thunderbolt 5',
  'Foldable Phones Worth Buying',
  'VR Gaming in 2026',
];

type QueueState = { queued: number; running: number; errors: number };

export default function GeneratorPage() {
  const [topic, setTopic] = useState('');
  const [categorySlug, setCategorySlug] = useState('');
  const [categories, setCategories] = useState<{ slug: string; name: string }[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<{ title?: string; slug?: string; isPublished?: boolean; error?: string } | null>(null);
  const [queue, setQueue] = useState<QueueState | null>(null);
  const [engine, setEngine] = useState('');
  const [previewOpen, setPreviewOpen] = useState(false);

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        const s = data?.settings;
        if (!s) return;
        const id = (s.aiProvider || 'gemini') as ProviderId;
        const meta = AI_PROVIDERS.find((p) => p.id === id);
        setEngine(meta ? `${meta.label} · ${s.aiModel || ''}` : s.aiModel || '');
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/categories', { signal: controller.signal })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        const cats = data?.categories || [];
        setCategories(cats.map((c: { slug: string; name: string }) => ({ slug: c.slug, name: c.name })));
        if (cats.length > 0) setCategorySlug((prev) => prev || cats[0].slug);
      })
      .catch(() => {});
    return () => controller.abort();
  }, []);

  useEffect(() => {
    function poll() {
      fetch('/api/generate/queue')
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => { if (data?.queue) setQueue(data.queue); })
        .catch(() => {});
    }
    poll();
    const interval = setInterval(poll, 2000);
    return () => clearInterval(interval);
  }, []);

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    setIsGenerating(true);
    setResult(null);

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, categorySlug }),
      });
      const data = await res.json();
      if (res.ok) {
        setResult({ title: data.article.title, slug: data.article.slug, isPublished: data.article.isPublished });
        setTopic('');
      } else {
        setResult({ error: data.error });
      }
    } catch (err: unknown) {
      setResult({ error: err instanceof Error ? err.message : 'Unknown error' });
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <div style={{ padding: '2.5rem', maxWidth: '800px' }}>
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 900, letterSpacing: '-0.04em', marginBottom: '0.25rem' }}>
          AI Generator
        </h1>
        <p style={{ color: '#71717a', fontSize: '0.9rem' }}>
          Generate complete, SEO-optimized articles.
          {engine && (
            <span style={{ marginLeft: '0.5rem', padding: '0.2rem 0.6rem', borderRadius: '9999px', backgroundColor: 'rgba(0,242,254,0.1)', border: '1px solid rgba(0,242,254,0.25)', color: '#00f2fe', fontSize: '0.75rem', fontWeight: 600 }}>
              Engine: {engine}
            </span>
          )}
        </p>
      </div>

      {queue && (queue.queued > 0 || queue.running > 0) && (
        <div style={{ padding: '0.875rem 1rem', backgroundColor: 'rgba(0,242,254,0.08)', border: '1px solid rgba(0,242,254,0.25)', borderRadius: '0.75rem', color: '#a1a1aa', fontSize: '0.875rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '2px solid #00f2fe', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', flexShrink: 0 }} />
          {queue.running > 0 ? 'A generation is running.' : 'Waiting…'}{' '}
          {queue.queued > 0 ? ` ${queue.queued} queued behind it.` : ''}
        </div>
      )}

      <div style={{ backgroundColor: '#0a0a0a', border: '1px solid #1a1a1a', borderRadius: '1rem', padding: '2rem', marginBottom: '2rem' }}>
        <form onSubmit={handleGenerate}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <label className="admin-label" style={{ marginBottom: 0 }}>
              Article Topic or Keyword
            </label>
            <button
              type="button"
              onClick={() => setPreviewOpen(true)}
              disabled={!topic.trim()}
              style={{
                padding: '0.3rem 0.8rem',
                backgroundColor: 'transparent',
                border: '1px solid #27272a',
                borderRadius: '9999px',
                color: topic.trim() ? '#a1a1aa' : '#3f3f46',
                fontSize: '0.72rem',
                fontWeight: 600,
                cursor: topic.trim() ? 'pointer' : 'not-allowed',
              }}
            >
              Preview prompt
            </button>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. The Future of Solid State Batteries"
              required
              className="admin-input"
              style={{ flex: 1, fontSize: '1rem' }}
            />
            <button
              type="submit"
              disabled={isGenerating}
              style={{
                padding: '0.875rem 1.75rem',
                background: isGenerating ? '#1a1a1a' : 'linear-gradient(90deg, #00f2fe, #fe0979)',
                border: 'none',
                borderRadius: '0.75rem',
                color: '#fff',
                fontWeight: 800,
                fontSize: '0.9rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                cursor: isGenerating ? 'not-allowed' : 'pointer',
                whiteSpace: 'nowrap',
                minWidth: '160px',
              }}
            >
              {isGenerating ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
                  <span style={{ display: 'inline-block', width: '14px', height: '14px', border: '2px solid #fff', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                  Generating…
                </span>
              ) : '✦ Generate'}
            </button>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label className="admin-label">
              Category
            </label>
            <select
              value={categorySlug}
              onChange={(e) => setCategorySlug(e.target.value)}
              className="admin-input"
            >
              <option value="">— Uncategorized —</option>
              {categories.map((c) => (
                <option key={c.slug} value={c.slug}>{c.name}</option>
              ))}
            </select>
            <p style={{ fontSize: '0.75rem', color: '#52525b', marginTop: '0.4rem' }}>
              Leave empty to use the default “Technology” category.
            </p>
          </div>

          {/* Suggested Topics */}
          <div>
            <div style={{ fontSize: '0.75rem', color: '#52525b', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>
              Quick topics
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {SUGGESTED_TOPICS.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTopic(t)}
                  style={{
                    padding: '0.4rem 0.9rem',
                    backgroundColor: 'transparent',
                    border: '1px solid #27272a',
                    borderRadius: '9999px',
                    color: '#71717a',
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </form>
      </div>

      {/* Result */}
      {result && (
        <div style={{
          padding: '1.5rem',
          backgroundColor: result.error ? 'rgba(254,9,121,0.05)' : 'rgba(0,242,254,0.05)',
          border: `1px solid ${result.error ? 'rgba(254,9,121,0.2)' : 'rgba(0,242,254,0.2)'}`,
          borderRadius: '1rem',
        }}>
          {result.error ? (
            <p style={{ color: '#fe0979', fontWeight: 600 }}>Error: {result.error}</p>
          ) : (
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>
                <span style={{ color: result.isPublished ? '#00f2fe' : '#a1a1aa' }}>
                  ✓ Article {result.isPublished ? 'generated and published' : 'generated as draft'}
                </span>
                {!result.isPublished && (
                  <span style={{ display: 'inline-block', marginLeft: '0.75rem', padding: '0.15rem 0.6rem', borderRadius: '9999px', backgroundColor: 'rgba(113,113,122,0.15)', color: '#a1a1aa', fontSize: '0.65rem' }}>
                    Enable Auto-Publish in Settings or publish it from the Articles list.
                  </span>
                )}
              </div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1rem' }}>{result.title}</div>
              <a
                href={`/article/${result.slug}`}
                target="_blank"
                style={{
                  fontSize: '0.875rem',
                  color: '#00f2fe',
                  textDecoration: 'underline',
                  fontWeight: 600,
                }}
              >
                View article →
              </a>
            </div>
          )}
        </div>
      )}

      {previewOpen && (
        <PromptPreview topic={topic} engine={engine} onClose={() => setPreviewOpen(false)} />
      )}
    </div>
  );
}
