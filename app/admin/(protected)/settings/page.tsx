import prisma from '@/lib/db';
import SettingsForm from './settings-form';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const settings = await prisma.siteSettings.findUnique({ where: { id: 'global' } });

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

      <SettingsForm settings={settings} />
    </div>
  );
}