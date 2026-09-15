import prisma from '@/lib/db';

export default async function AdSlot({ where }: { where: 'home' | 'article' }) {
  const settings = await prisma.siteSettings.findUnique({ where: { id: 'global' } });
  if (!settings?.adsenseClientId || !settings.adsenseManualUnits || !settings.adsenseAdSlot) return null;

  const enabled = where === 'home' ? settings.adsenseOnHome : settings.adsenseOnArticles;
  if (!enabled) return null;

  return (
    <div className="ad-unit" aria-label="Advertisement">
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={settings.adsenseClientId}
        data-ad-slot={settings.adsenseAdSlot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
      <script
        dangerouslySetInnerHTML={{
          __html: '(adsbygoogle = window.adsbygoogle || []).push({});',
        }}
      />
    </div>
  );
}