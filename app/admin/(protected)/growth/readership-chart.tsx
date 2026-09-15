'use client';

import { useEffect, useState } from 'react';
import { parseDayKey } from '@/lib/date-key';

type Day = { key: string; views: number };

export default function ReadershipChart({ days }: { days: Day[] }) {
  const [range, setRange] = useState(30);
  const [revealed, setRevealed] = useState<'idle' | 'show' | 'instant'>('idle');

  useEffect(() => {
    requestAnimationFrame(() =>
      setRevealed(window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'show'),
    );
  }, []);

  const slice = days.slice(Math.max(0, days.length - range));
  const maxViews = Math.max(1, ...slice.map((d) => d.views));
  const peakIndex = slice.reduce((best, d, i) => (d.views > slice[best].views ? i : best), 0);
  const totalShown = slice.reduce((sum, d) => sum + d.views, 0);
  const thisWeek = days.slice(-7).reduce((sum, d) => sum + d.views, 0);
  const today = slice.length > 0 ? slice[slice.length - 1].views : 0;
  const gap = slice.length > 16 ? 3 : 5;
  const barW = (100 - gap) / slice.length;
  const short = (key: string) =>
    parseDayKey(key).toLocaleDateString('en', { month: 'short', day: 'numeric' });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <h2 className="admin-row-label" style={{ color: 'var(--ink-faint)' }}>Readership trend</h2>
        <div role="group" aria-label="Chart range" style={{ display: 'flex', gap: '0.25rem' }}>
          {[7, 14, 30].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setRange(n)}
              aria-pressed={range === n}
              style={{
                padding: '0.3rem 0.7rem',
                fontSize: '0.75rem',
                fontWeight: 700,
                borderRadius: '9999px',
                border: range === n ? '1px solid var(--neon-cyan)' : '1px solid var(--hairline)',
                backgroundColor: range === n ? 'color-mix(in srgb, var(--neon-cyan) 10%, transparent)' : 'transparent',
                color: range === n ? 'var(--neon-cyan)' : 'var(--ink-faint)',
                cursor: 'pointer',
                transition: 'border-color .15s, color .15s',
              }}
            >
              {n}d
            </button>
          ))}
        </div>
      </div>

      {totalShown === 0 ? (
        <p style={{ color: 'var(--ink-faint)', fontSize: '0.875rem', lineHeight: 1.5, maxWidth: '52ch' }}>
          Views are recorded as readers open your stories. Publish a story and the trend starts building here day by day.
        </p>
      ) : (
        <svg
          viewBox="0 0 100 40"
          preserveAspectRatio="none"
          role="img"
          aria-label={`Daily reads, last ${range} days. Best day ${short(slice[peakIndex].key)} with ${slice[peakIndex].views.toLocaleString()} reads.`}
          style={{ display: 'block', width: '100%', height: '9rem' }}
        >
          {slice.map((d, i) => {
            const h = (d.views / maxViews) * 36;
            const isBest = i === peakIndex;
            return (
              <rect
                key={d.key}
                x={i * barW + gap / 2}
                y={40 - h}
                width={barW}
                height={h}
                rx={1}
                fill={isBest ? 'var(--neon-magenta)' : 'var(--neon-cyan)'}
                style={{
                  transformBox: 'fill-box',
                  transformOrigin: 'center bottom',
                  transform: revealed === 'idle' ? 'scaleY(0)' : 'scaleY(1)',
                  transition:
                    revealed === 'instant'
                      ? 'none'
                      : 'transform .55s cubic-bezier(.22,1,.36,1)',
                  transitionDelay: revealed === 'show' ? `${i * 18}ms` : '0ms',
                }}
              />
            );
          })}
          <title>
            {slice.map((d) => `${short(d.key)} · ${d.views.toLocaleString()} reads`).join('\n')}
          </title>
        </svg>
      )}

      {totalShown > 0 && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--ink-faint)' }}>{short(slice[0].key)}</span>
            <span style={{ fontSize: '0.72rem', color: 'var(--ink-faint)' }}>{short(slice[slice.length - 1].key)}</span>
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              borderTop: '1px solid var(--hairline)',
              marginTop: '1rem',
              paddingTop: '1.25rem',
            }}
          >
            <div style={{ paddingRight: '1rem' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--ink-faint)', marginBottom: '0.35rem' }}>Reads today</div>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.9rem', fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1 }}>
                {today.toLocaleString()}
              </div>
            </div>
            <div style={{ padding: '0 1rem', borderLeft: '1px solid var(--hairline)', borderRight: '1px solid var(--hairline)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--ink-faint)', marginBottom: '0.35rem' }}>Reads this week</div>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.15 }}>
                {thisWeek.toLocaleString()}
              </div>
            </div>
            <div style={{ paddingLeft: '1rem' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--ink-faint)', marginBottom: '0.35rem' }}>Best day</div>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.15, color: 'var(--neon-magenta)' }}>
                {slice[peakIndex].views.toLocaleString()}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--ink-faint)', marginTop: '0.1rem' }}>
                {short(slice[peakIndex].key)}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}