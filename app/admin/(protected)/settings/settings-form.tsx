'use client';

import { useState } from 'react';

type Settings = {
  siteName?: string | null;
  siteUrl?: string | null;
  adsenseClientId?: string | null;
  amazonTag?: string | null;
  geminiApiKey?: string | null;
  aiModel?: string | null;
  autoPublish?: boolean | null;
};

function SettingRow({ label, description, children }: { label: string; description: string; children: React.ReactNode }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '2rem',
      alignItems: 'start',
      padding: '1.75rem 0',
      borderBottom: '1px solid #111',
    }}>
      <div>
        <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.3rem' }}>{label}</div>
        <div style={{ fontSize: '0.8rem', color: '#71717a', lineHeight: 1.5 }}>{description}</div>
      </div>
      <div>{children}</div>
    </div>
  );
}

function Input({ name, value, placeholder, type = 'text', onChange }: { name: string; value?: string | null; placeholder?: string; type?: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }) {
  return (
    <input
      type={type}
      name={name}
      value={value || ''}
      placeholder={placeholder}
      onChange={onChange}
      style={{
        width: '100%',
        padding: '0.75rem 1rem',
        backgroundColor: '#111',
        border: '1px solid #27272a',
        borderRadius: '0.75rem',
        color: '#fff',
        fontSize: '0.9rem',
        outline: 'none',
      }}
    />
  );
}

export default function SettingsForm({ settings }: { settings: Settings | null }) {
  const [form, setForm] = useState<Settings>({
    siteName: settings?.siteName ?? 'MyTechNews',
    siteUrl: settings?.siteUrl ?? '',
    adsenseClientId: settings?.adsenseClientId ?? '',
    amazonTag: settings?.amazonTag ?? '',
    geminiApiKey: settings?.geminiApiKey ?? '',
    aiModel: settings?.aiModel ?? 'gemini-3.6-flash',
    autoPublish: settings?.autoPublish ?? false,
  });
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<'idle' | 'saved' | 'error'>('idle');

  function set<K extends keyof Settings>(key: K, value: Settings[K]) {
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

      if (!res.ok) throw new Error('Failed to save settings');

      setStatus('saved');
    } catch {
      setStatus('error');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSave}>
      {/* Site Configuration */}
      <div style={{ backgroundColor: '#0a0a0a', border: '1px solid #1a1a1a', borderRadius: '1rem', padding: '0 2rem', marginBottom: '2rem' }}>
        <h2 style={{ padding: '1.5rem 0 0', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#52525b' }}>
          Site Configuration
        </h2>
        <SettingRow label="Site Name" description="The public name of your tech portal.">
          <Input name="siteName" value={form.siteName} placeholder="My Site" onChange={(e) => set('siteName', e.target.value)} />
        </SettingRow>
        <SettingRow label="Site URL" description="Your canonical domain (used for SEO and sitemaps).">
          <Input name="siteUrl" value={form.siteUrl} placeholder="https://mytechnews.com" onChange={(e) => set('siteUrl', e.target.value)} />
        </SettingRow>
      </div>

      {/* Monetization */}
      <div style={{ backgroundColor: '#0a0a0a', border: '1px solid #1a1a1a', borderRadius: '1rem', padding: '0 2rem', marginBottom: '2rem' }}>
        <h2 style={{ padding: '1.5rem 0 0', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#52525b' }}>
          Monetization
        </h2>
        <SettingRow
          label="Google AdSense Client ID"
          description="Your ca-pub-XXXX ID from your AdSense account."
        >
          <Input name="adsenseClientId" value={form.adsenseClientId} placeholder="ca-pub-XXXXXXXXXXXXXXXX" onChange={(e) => set('adsenseClientId', e.target.value)} />
        </SettingRow>
        <SettingRow
          label="Amazon Associates Tag"
          description="Your Amazon affiliate tag for automated product links."
        >
          <Input name="amazonTag" value={form.amazonTag} placeholder="yoursite-20" onChange={(e) => set('amazonTag', e.target.value)} />
        </SettingRow>
      </div>

      {/* AI Engine */}
      <div style={{ backgroundColor: '#0a0a0a', border: '1px solid #1a1a1a', borderRadius: '1rem', padding: '0 2rem', marginBottom: '2rem' }}>
        <h2 style={{ padding: '1.5rem 0 0', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#52525b' }}>
          AI Content Engine
        </h2>
        <SettingRow
          label="Gemini API Key"
          description="Your Google Gemini API key. Get one at aistudio.google.com."
        >
          <Input name="geminiApiKey" type="password" value={form.geminiApiKey} placeholder="•••••••••••••••••••••" onChange={(e) => set('geminiApiKey', e.target.value)} />
        </SettingRow>
        <SettingRow
          label="AI Model"
          description="The Gemini model used for content generation."
        >
          <select
            name="aiModel"
            value={form.aiModel ?? ''}
            onChange={(e) => set('aiModel', e.target.value)}
            style={{ width: '100%', padding: '0.75rem 1rem', backgroundColor: '#111', border: '1px solid #27272a', borderRadius: '0.75rem', color: '#fff', fontSize: '0.9rem' }}
          >
            <option value="gemini-3.6-flash">gemini-3.6-flash (fast)</option>
            <option value="gemini-2.5-pro">gemini-2.5-pro (quality)</option>
          </select>
        </SettingRow>
        <SettingRow
          label="Auto-Publish"
          description="Automatically publish articles without draft review."
        >
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={!!form.autoPublish}
              onChange={(e) => set('autoPublish', e.target.checked)}
              style={{ width: '1.1rem', height: '1.1rem', accentColor: '#00f2fe' }}
            />
            <span style={{ fontSize: '0.9rem', color: '#a1a1aa' }}>Enabled</span>
          </label>
        </SettingRow>
      </div>

      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <button
          type="submit"
          disabled={saving}
          style={{
            padding: '0.875rem 2rem',
            background: saving ? '#27272a' : 'linear-gradient(90deg, #00f2fe, #fe0979)',
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
          {saving ? 'Saving…' : 'Save Settings'}
        </button>
        {status === 'saved' && (
          <span style={{ color: '#00f2fe', fontWeight: 600, fontSize: '0.875rem' }}>
            ✓ Settings saved
          </span>
        )}
        {status === 'error' && (
          <span style={{ color: '#fe0979', fontWeight: 600, fontSize: '0.875rem' }}>
            ✗ Failed to save settings
          </span>
        )}
      </div>
    </form>
  );
}