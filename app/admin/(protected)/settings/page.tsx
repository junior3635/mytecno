'use client';

import { useState } from 'react';

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

function Input({ defaultValue, placeholder, type = 'text' }: { defaultValue?: string; placeholder?: string; type?: string }) {
  return (
    <input
      type={type}
      defaultValue={defaultValue}
      placeholder={placeholder}
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

export default function SettingsPage() {
  const [saved, setSaved] = useState(false);

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <div style={{ padding: '2.5rem', maxWidth: '800px' }}>
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 900, letterSpacing: '-0.04em', marginBottom: '0.25rem' }}>
          Settings
        </h1>
        <p style={{ color: '#71717a', fontSize: '0.9rem' }}>
          Configure your portal, monetization, and AI generation.
        </p>
      </div>

      <form onSubmit={handleSave}>
        {/* Site Configuration */}
        <div style={{ backgroundColor: '#0a0a0a', border: '1px solid #1a1a1a', borderRadius: '1rem', padding: '0 2rem', marginBottom: '2rem' }}>
          <h2 style={{ padding: '1.5rem 0 0', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#52525b' }}>
            Site Configuration
          </h2>
          <SettingRow label="Site Name" description="The public name of your tech portal.">
            <Input defaultValue="MyTechNews" placeholder="My Site" />
          </SettingRow>
          <SettingRow label="Site URL" description="Your canonical domain (used for SEO and sitemaps).">
            <Input placeholder="https://mytechnews.com" />
          </SettingRow>
          <SettingRow label="Admin Email" description="The email address used to log into this admin panel.">
            <Input type="email" placeholder="admin@yoursite.com" />
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
            <Input placeholder="ca-pub-XXXXXXXXXXXXXXXX" />
          </SettingRow>
          <SettingRow
            label="Amazon Associates Tag"
            description="Your Amazon affiliate tag for automated product links."
          >
            <Input placeholder="yoursite-20" />
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
            <Input type="password" placeholder="•••••••••••••••••••••" />
          </SettingRow>
          <SettingRow
            label="AI Model"
            description="The Gemini model used for content generation."
          >
            <select style={{ width: '100%', padding: '0.75rem 1rem', backgroundColor: '#111', border: '1px solid #27272a', borderRadius: '0.75rem', color: '#fff', fontSize: '0.9rem' }}>
              <option value="gemini-3.6-flash">gemini-3.6-flash (fast)</option>
              <option value="gemini-2.5-pro">gemini-2.5-pro (quality)</option>
            </select>
          </SettingRow>
          <SettingRow
            label="Auto-Publish"
            description="Automatically publish articles without draft review."
          >
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
              <input type="checkbox" defaultChecked style={{ width: '1.1rem', height: '1.1rem', accentColor: '#00f2fe' }} />
              <span style={{ fontSize: '0.9rem', color: '#a1a1aa' }}>Enabled</span>
            </label>
          </SettingRow>
        </div>

        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <button
            type="submit"
            style={{
              padding: '0.875rem 2rem',
              background: 'linear-gradient(90deg, #00f2fe, #fe0979)',
              border: 'none',
              borderRadius: '0.75rem',
              color: '#fff',
              fontWeight: 800,
              fontSize: '0.875rem',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              cursor: 'pointer',
            }}
          >
            Save Settings
          </button>
          {saved && (
            <span style={{ color: '#00f2fe', fontWeight: 600, fontSize: '0.875rem' }}>
              ✓ Settings saved
            </span>
          )}
        </div>
      </form>
    </div>
  );
}
