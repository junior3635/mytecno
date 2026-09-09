import prisma from '@/lib/db';
import SettingsForm from './settings-form';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const settings = await prisma.siteSettings.findUnique({ where: { id: 'global' } });

  return (
    <div className="admin-page" style={{ maxWidth: '800px' }}>
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 className="admin-heading">Settings</h1>
        <p className="admin-sub">Configure your portal, monetization, and AI generation.</p>
      </div>

      <SettingsForm settings={settings} />
    </div>
  );
}