import prisma from '@/lib/db';

export default async function AdSlot({ label, marginTop }: { label: string; marginTop?: string }) {
  const settings = await prisma.siteSettings.findUnique({ where: { id: 'global' } });
  if (!settings?.adsenseClientId) return null;

  return (
    <div className="ad-slot-tech" style={marginTop ? { marginTop } : undefined}>
      {label}
    </div>
  );
}