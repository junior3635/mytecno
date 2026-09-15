import prisma from '@/lib/db';
import AdsPanel from './ads-panel';

export const dynamic = 'force-dynamic';

export default async function AdminAds() {
  const settings = await prisma.siteSettings.findUnique({ where: { id: 'global' } });

  type AdsState = {
    adsenseClientId: string;
    adsenseAdSlot: string;
    adsenseAutoAds: boolean;
    adsenseManualUnits: boolean;
    adsenseOnHome: boolean;
    adsenseOnArticles: boolean;
    amazonTag: string;
  };

  const ads: AdsState = {
    adsenseClientId: settings?.adsenseClientId ?? '',
    adsenseAdSlot: settings?.adsenseAdSlot ?? '',
    adsenseAutoAds: settings?.adsenseAutoAds ?? true,
    adsenseManualUnits: settings?.adsenseManualUnits ?? false,
    adsenseOnHome: settings?.adsenseOnHome ?? true,
    adsenseOnArticles: settings?.adsenseOnArticles ?? true,
    amazonTag: settings?.amazonTag ?? '',
  };

  const serving =
    (ads.adsenseAutoAds || (ads.adsenseManualUnits && !!ads.adsenseAdSlot)) && !!ads.adsenseClientId;

  return (
    <div className="admin-page" style={{ maxWidth: '1000px' }}>
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 className="admin-heading">Google Ads</h1>
        <p className="admin-sub">AdSense setup and where your units run</p>
      </div>

      <div className="admin-card" style={{ padding: '1.25rem 1.5rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <span
            style={{
              width: '0.55rem',
              height: '0.55rem',
              borderRadius: '50%',
              background: serving ? 'var(--neon-cyan)' : 'var(--accent-news)',
              flexShrink: 0,
            }}
          />
          <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>
            {serving ? 'AdSense is serving ads' : 'No ads being served'}
          </span>
          <span style={{ fontSize: '0.8rem', color: 'var(--ink-faint)' }}>
            {!ads.adsenseClientId
              ? 'Add your AdSense client ID below to get started.'
              : !serving
                ? 'Enable at least one ad mode below.'
                : ads.adsenseAutoAds
                  ? 'Auto Ads active' +
                    (ads.adsenseManualUnits ? ' + manual units' : '')
                  : 'Manual units active'}
          </span>
        </div>
      </div>

      <AdsPanel initial={ads} />
    </div>
  );
}