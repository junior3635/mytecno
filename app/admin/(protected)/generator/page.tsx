'use client';

import { useState } from 'react';

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

export default function GeneratorPage() {
  const [topic, setTopic] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<{ title?: string; slug?: string; error?: string } | null>(null);

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    setIsGenerating(true);
    setResult(null);

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic }),
      });
      const data = await res.json();
      if (res.ok) {
        setResult({ title: data.article.title, slug: data.article.slug });
        setTopic('');
      } else {
        setResult({ error: data.error });
      }
    } catch (err: any) {
      setResult({ error: err.message });
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
          Generate complete, SEO-optimized articles using Gemini AI.
        </p>
      </div>

      <div style={{ backgroundColor: '#0a0a0a', border: '1px solid #1a1a1a', borderRadius: '1rem', padding: '2rem', marginBottom: '2rem' }}>
        <form onSubmit={handleGenerate}>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#a1a1aa', marginBottom: '0.75rem' }}>
            Article Topic or Keyword
          </label>
          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. The Future of Solid State Batteries"
              required
              style={{
                flex: 1,
                padding: '0.875rem 1rem',
                backgroundColor: '#111',
                border: '1px solid #27272a',
                borderRadius: '0.75rem',
                color: '#fff',
                fontSize: '1rem',
                outline: 'none',
              }}
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
              <div style={{ fontSize: '0.75rem', color: '#00f2fe', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>
                ✓ Article generated and published
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
    </div>
  );
}
