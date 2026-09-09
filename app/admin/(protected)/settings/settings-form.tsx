'use client';

import { useState } from 'react';
import type { ProviderId } from '@/lib/ai/types';
import { AI_PROVIDERS, PROVIDER_DEFAULT_ENV_KEY, PROVIDER_DEFAULT_TEXT_MODELS, PROVIDER_MODELS } from '@/lib/ai/models';

type Settings = {
  siteName?: string | null;
  siteUrl?: string | null;
  adsenseClientId?: string | null;
  amazonTag?: string | null;
  geminiApiKey?: string | null;
  anthropicApiKey?: string | null;
  openaiApiKey?: string | null;
  aiProvider?: string | null;
  aiModel?: string | null;
  autoPublish?: boolean | null;
};

const KEY_FIELDS: Record<ProviderId, keyof Settings> = {
  gemini: 'geminiApiKey',
  anthropic: 'anthropicApiKey',
  openai: 'openaiApiKey',
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

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="admin-card" style={{ padding: '0 2rem', marginBottom: '2rem' }}>
      <h2 className="admin-row-label" style={{ padding: '1.5rem 0 0', letterSpacing: '0.15em' }}>
        {title}
      </h2>
      {children}
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
      className="admin-input"
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
    anthropicApiKey: settings?.anthropicApiKey ?? '',
    openaiApiKey: settings?.openaiApiKey ?? '',
    aiProvider: settings?.aiProvider ?? 'gemini',
    aiModel: settings?.aiModel ?? 'gemini-3.6-flash',
    autoPublish: settings?.autoPublish ?? false,
  });
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<'idle' | 'saved' | 'error'>('idle');

  const providerId = (form.aiProvider === 'anthropic' || form.aiProvider === 'openai' ? form.aiProvider : 'gemini') as ProviderId;
  const providerMeta = AI_PROVIDERS.find((p) => p.id === providerId);
  const textModels = PROVIDER_MODELS[providerId].filter((m) => m.kind === 'text');
  const keyField = KEY_FIELDS[providerId];

  function set<K extends keyof Settings>(key: K, value: Settings[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleProviderChange(id: string) {
    const next = id as ProviderId;
    set('aiProvider', next);
    // If the saved model doesn't belong to the new provider, reset to its default text model.
    const modelsFor = PROVIDER_MODELS[next].filter((m) => m.kind === 'text');
    if (!modelsFor.some((m) => m.id === form.aiModel)) {
      set('aiModel', PROVIDER_DEFAULT_TEXT_MODELS[next]);
    }
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
      <Section title="Site Configuration">
        <SettingRow label="Site Name" description="The public name of your tech portal.">
          <Input name="siteName" value={form.siteName} placeholder="My Site" onChange={(e) => set('siteName', e.target.value)} />
        </SettingRow>
        <SettingRow label="Site URL" description="Your canonical domain (used for SEO and sitemaps).">
          <Input name="siteUrl" value={form.siteUrl} placeholder="https://mytechnews.com" onChange={(e) => set('siteUrl', e.target.value)} />
        </SettingRow>
      </Section>

      {/* Monetization */}
      <Section title="Monetization">
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
      </Section>

      {/* AI Engine */}
      <Section title="AI Content Engine">
        <SettingRow
          label="Provider"
          description="The AI engine used to write articles and generate images."
        >
          <select
            name="aiProvider"
            value={providerId}
            onChange={(e) => handleProviderChange(e.target.value)}
            className="admin-input"
          >
            {AI_PROVIDERS.map((p) => (
              <option key={p.id} value={p.id}>{p.label}</option>
            ))}
          </select>
        </SettingRow>
        <SettingRow
          label={`${providerMeta?.label ?? 'Provider'} API Key`}
          description={`Paste your API key. Fallback: ${PROVIDER_DEFAULT_ENV_KEY[providerId]} in .env.`}
        >
          <Input
            name={keyField}
            type="password"
            value={(form[keyField] as string | null | undefined) ?? ''}
            placeholder="•••••••••••••••••••••"
            onChange={(e) => set(keyField, e.target.value)}
          />
        </SettingRow>
        <SettingRow
          label="Model"
          description="The model used for content generation."
        >
          <select
            name="aiModel"
            value={form.aiModel ?? ''}
            onChange={(e) => set('aiModel', e.target.value)}
            className="admin-input"
          >
            {textModels.map((m) => (
              <option key={m.id} value={m.id}>{m.label}</option>
            ))}
          </select>
        </SettingRow>
        <SettingRow
          label="Image Generation"
          description={providerMeta?.description ?? ''}
        >
          <span style={{ fontSize: '0.8rem', color: '#71717a' }}>
            {PROVIDER_MODELS[providerId].some((m) => m.kind === 'image')
              ? 'Enabled automatically with the provider above.'
              : 'Not available for this provider — articles use a styled placeholder instead.'}
          </span>
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
      </Section>

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