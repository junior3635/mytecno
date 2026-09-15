'use client';

import { useState } from 'react';

type AdsState = {
  adsenseClientId: string;
  adsenseAdSlot: string;
  adsenseAutoAds: boolean;
  adsenseManualUnits: boolean;
  adsenseOnHome: boolean;
  adsenseOnArticles: boolean;
  amazonTag: string;
};

function Toggle({ checked, onChange, label, disabled }: {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
  disabled: boolean;
}) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.4 : 1 }}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
        style={{ width: '1.1rem', height: '1.1rem', accentColor: 'var(--neon-cyan)' }}
      />
      <span style={{ fontSize: '0.9rem', color: 'var(--ink-faint)' }}>{label}</span>
    </label>
  );
}

function WireBlock({ w, h, tone }: { w?: string | number; h?: string | number; tone?: 'line' | 'ink' }) {
  return (
    <span
      style={{
        display: 'block',
        height: h ?? '0.5rem',
        width: w ?? '100%',
        borderRadius: '0.2rem',
        background: tone === 'ink' ? 'var(--ink)' : tone === 'line' ? 'var(--surface-soft)' : 'var(--hairline)',
        opacity: tone === 'line' ? 0.5 : 1,
      }}
    />
  );
}

function AdCell({ active }: { active: boolean }) {
  return (
    <span
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '3rem',
        borderRadius: '0.3rem',
        border: `2px dashed ${active ? 'var(--neon-cyan)' : 'var(--hairline)'}`,
        color: active ? 'var(--neon-cyan)' : 'var(--ink-faint)',
        fontSize: '0.65rem',
        fontWeight: 700,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
      }}
    >
      {active ? 'Ad unit' : 'Ad — off'}
    </span>
  );
}

function Placements({ state }: { state: AdsState }) {
  const hasClient = !!state.adsenseClientId.trim();
  const canUnit = hasClient && state.adsenseManualUnits && !!state.adsenseAdSlot.trim() && state.adsenseOnArticles;

  return (
    <div style={{ borderTop: '1px solid var(--hairline)', padding: '1.75rem 0' }}>
      <div style={{ marginBottom: '1rem' }}>
        <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>Placement map</div>
        <div style={{ fontSize: '0.75rem', color: 'var(--ink-faint)', marginTop: '0.15rem' }}>
          Where ad units appear on the public site.
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        {/* Article wireframe */}
        <div style={{ border: '1px solid var(--hairline)', borderRadius: '0.75rem', padding: '1rem' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--ink-faint)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.75rem' }}>
            Article page
          </div>
          <WireBlock h="1.4rem" tone="ink" />
          <div style={{ height: '0.5rem' }} />
          <WireBlock h="4.5rem" tone="line" />
          <div style={{ height: '0.75rem' }} />
          <WireBlock w="90%" />
          <div style={{ height: '0.4rem' }} />
          <WireBlock w="95%" />
          <div style={{ height: '0.4rem' }} />
          <WireBlock w="70%" />
          <div style={{ height: '0.8rem' }} />
          <AdCell active={canUnit} />
          <div style={{ height: '0.8rem' }} />
          <WireBlock w="85%" />
          <div style={{ height: '0.4rem' }} />
          <WireBlock w="60%" />
        </div>

        {/* Home wireframe */}
        <div style={{ border: '1px solid var(--hairline)', borderRadius: '0.75rem', padding: '1rem' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--ink-faint)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.75rem' }}>
            Home page
          </div>
          <WireBlock h="4.5rem" tone="line" />
          <div style={{ height: '0.75rem' }} />
          <AdCell active={hasClient && state.adsenseManualUnits && !!state.adsenseAdSlot.trim() && state.adsenseOnHome} />
          <div style={{ height: '0.75rem' }} />
          <WireBlock w="55%" tone="ink" />
          <div style={{ height: '0.5rem' }} />
          <WireBlock w="100%" />
          <div style={{ height: '0.4rem' }} />
          <WireBlock w="92%" />
          <div style={{ height: '0.4rem' }} />
          <WireBlock w="84%" />
        </div>
      </div>

      <div style={{ marginTop: '1rem', fontSize: '0.75rem', color: 'var(--ink-faint)', lineHeight: 1.6 }}>
        {state.adsenseAutoAds ? 'Auto Ads fill any remaining space automatically on all pages.' : 'Auto Ads are off — only the manual units above are shown.'}{' '}
        {state.adsenseClientId.trim() && !state.adsenseAdSlot.trim() && state.adsenseManualUnits && (
          <span>Add an AdSense ad-slot ID to enable the manual units.</span>
        )}{' '}
        AdSense requires a consent banner (CMP) to run in the EU. Keep the tag active below.</div>
    </div>
  );
}

export default function AdsPanel({ initial }: { initial: AdsState }) {
  const [form, setForm] = useState<AdsState>(initial);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<'idle' | 'saved' | 'error'>('idle');

  function set<K extends keyof AdsState>(key: K, value: AdsState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setStatus('idle');
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adsenseClientId: form.adsenseClientId,
          adsenseAdSlot: form.adsenseAdSlot,
          adsenseAutoAds: form.adsenseAutoAds,
          adsenseManualUnits: form.adsenseManualUnits,
          adsenseOnHome: form.adsenseOnHome,
          adsenseOnArticles: form.adsenseOnArticles,
          amazonTag: form.amazonTag,
        }),
      });
      if (!res.ok) throw new Error('Failed to save');
      setStatus('saved');
    } catch {
      setStatus('error');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSave} className="admin-card" style={{ padding: '0 1.75rem' }}>
      <div style={{ padding: '1.75rem 0', borderBottom: '1px solid var(--hairline)' }}>
        <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>AdSense configuration</div>
        <div style={{ fontSize: '0.75rem', color: 'var(--ink-faint)', marginTop: '0.15rem' }}>
          Paste the IDs from your Google AdSense account.
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: '1.5rem', alignItems: 'center', padding: '1.1rem 0', borderBottom: '1px solid var(--hairline)' }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>AdSense client ID</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--ink-faint)', marginTop: '0.15rem' }}>Your ca-pub-XXXX ID</div>
        </div>
        <input
          type="text"
          value={form.adsenseClientId}
          placeholder="ca-pub-XXXXXXXXXXXXXXXX"
          onChange={(e) => set('adsenseClientId', e.target.value)}
          className="admin-input"
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: '1.5rem', alignItems: 'center', padding: '1.1rem 0', borderBottom: '1px solid var(--hairline)' }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>Ad unit slot ID</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--ink-faint)', marginTop: '0.15rem' }}>
            The responsive ad unit from AdSense. Needed for manual units.
          </div>
        </div>
        <input
          type="text"
          value={form.adsenseAdSlot}
          placeholder="1234567890"
          onChange={(e) => set('adsenseAdSlot', e.target.value)}
          className="admin-input"
        />
      </div>

      <div style={{ padding: '1.1rem 0', borderBottom: '1px solid var(--hairline)' }}>
        <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.5rem' }}>Ad modes</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', maxWidth: '30rem' }}>
          <Toggle
            checked={form.adsenseAutoAds}
            onChange={(v) => set('adsenseAutoAds', v)}
            label="Auto Ads"
            disabled={!form.adsenseClientId.trim()}
          />
          <Toggle
            checked={form.adsenseManualUnits}
            onChange={(v) => set('adsenseManualUnits', v)}
            label="Manual units"
            disabled={!form.adsenseClientId.trim()}
          />
          <Toggle
            checked={form.adsenseOnHome}
            onChange={(v) => set('adsenseOnHome', v)}
            label="Unit on home"
            disabled={!form.adsenseManualUnits}
          />
          <Toggle
            checked={form.adsenseOnArticles}
            onChange={(v) => set('adsenseOnArticles', v)}
            label="Unit on articles"
            disabled={!form.adsenseManualUnits}
          />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: '1.5rem', alignItems: 'center', padding: '1.1rem 0', borderBottom: '1px solid var(--hairline)' }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>Amazon Associates tag</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--ink-faint)', marginTop: '0.15rem' }}>
            Affiliate tag for automated product links.
          </div>
        </div>
        <input
          type="text"
          value={form.amazonTag}
          placeholder="yoursite-20"
          onChange={(e) => set('amazonTag', e.target.value)}
          className="admin-input"
        />
      </div>

      <Placements state={form} />

      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', padding: '1.25rem 0 1.75rem' }}>
        <button
          type="submit"
          disabled={saving}
          style={{
            padding: '0.875rem 2rem',
            background: saving ? 'var(--hairline)' : 'linear-gradient(90deg, var(--neon-cyan), var(--neon-magenta))',
            border: 'none',
            borderRadius: '0.75rem',
            color: '#fff',
            fontWeight: 800,
            fontSize: '0.875rem',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            cursor: saving ? 'not-allowed' : 'pointer',
          }}
        >
          {saving ? 'Saving…' : 'Save Ads Settings'}
        </button>
        {status === 'saved' && (
          <span style={{ color: 'var(--neon-cyan)', fontWeight: 600, fontSize: '0.875rem' }}>✓ Settings saved</span>
        )}
        {status === 'error' && (
          <span style={{ color: 'var(--neon-magenta)', fontWeight: 600, fontSize: '0.875rem' }}>✗ Failed to save</span>
        )}
      </div>
    </form>
  );
}