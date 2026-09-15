'use client';

import { useState } from 'react';

type SocialFormState = {
  socialX: string;
  socialFacebook: string;
  socialInstagram: string;
  socialYoutube: string;
  socialTiktok: string;
  socialLinkedin: string;
  socialShowFooter: boolean;
};

const SOCIAL_FIELDS: { key: keyof SocialFormState; label: string; hint: string; placeholder: string }[] = [
  { key: 'socialX', label: 'X (Twitter)', hint: 'Your @handle', placeholder: 'https://x.com/yourhandle' },
  { key: 'socialFacebook', label: 'Facebook', hint: 'Page or profile', placeholder: 'https://facebook.com/yourpage' },
  { key: 'socialInstagram', label: 'Instagram', hint: 'Your @handle', placeholder: 'https://instagram.com/yourhandle' },
  { key: 'socialYoutube', label: 'YouTube', hint: 'Your channel', placeholder: 'https://youtube.com/@yourchannel' },
  { key: 'socialTiktok', label: 'TikTok', hint: 'Your @handle', placeholder: 'https://tiktok.com/@yourhandle' },
  { key: 'socialLinkedin', label: 'LinkedIn', hint: 'Company or personal', placeholder: 'https://linkedin.com/company/yourpage' },
];

function NetworkRow({ label, hint, placeholder, value, onChange }: {
  label: string;
  hint: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1.4fr',
        gap: '1.5rem',
        alignItems: 'center',
        padding: '1.1rem 0',
        borderBottom: '1px solid var(--hairline)',
      }}
    >
      <div>
        <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{label}</div>
        <div style={{ fontSize: '0.75rem', color: 'var(--ink-faint)', marginTop: '0.15rem' }}>{hint}</div>
      </div>
      <input
        type="url"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="admin-input"
      />
    </div>
  );
}

export default function GrowthForm({ socials }: { socials: SocialFormState }) {
  const [form, setForm] = useState<SocialFormState>(socials);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<'idle' | 'saved' | 'error'>('idle');

  function set<K extends keyof SocialFormState>(key: K, value: SocialFormState[K]) {
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
        body: JSON.stringify(form),
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
    <form onSubmit={handleSave}>
      {SOCIAL_FIELDS.map((f) => (
        <NetworkRow
          key={f.key}
          label={f.label}
          hint={f.hint}
          placeholder={f.placeholder}
          value={form[f.key] as string}
          onChange={(value) => set(f.key, value)}
        />
      ))}

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          padding: '1.1rem 0',
          borderBottom: '1px solid var(--hairline)',
        }}
      >
        <div>
          <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>Show in footer</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--ink-faint)', marginTop: '0.15rem' }}>
            Display the filled profiles in the public site footer.
          </div>
        </div>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={form.socialShowFooter}
            onChange={(e) => set('socialShowFooter', e.target.checked)}
            style={{ width: '1.1rem', height: '1.1rem', accentColor: 'var(--neon-cyan)' }}
          />
          <span style={{ fontSize: '0.9rem', color: 'var(--ink-faint)' }}>Enabled</span>
        </label>
      </div>

      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', padding: '1.25rem 0' }}>
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
          {saving ? 'Saving…' : 'Save Profiles'}
        </button>
        {status === 'saved' && (
          <span style={{ color: 'var(--neon-cyan)', fontWeight: 600, fontSize: '0.875rem' }}>✓ Profiles saved</span>
        )}
        {status === 'error' && (
          <span style={{ color: 'var(--neon-magenta)', fontWeight: 600, fontSize: '0.875rem' }}>✗ Failed to save</span>
        )}
      </div>
    </form>
  );
}