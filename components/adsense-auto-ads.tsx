import prisma from '@/lib/db';

export default async function AdSenseAutoAds() {
  const settings = await prisma.siteSettings.findUnique({ where: { id: 'global' } });
  if (!settings?.adsenseClientId) return null;

  const manualOn = settings.adsenseManualUnits && !!settings.adsenseAdSlot;
  if (!settings.adsenseAutoAds && !manualOn) return null;

  return (
    <script
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(settings.adsenseClientId)}`}
      crossOrigin="anonymous"
    />
  );
}