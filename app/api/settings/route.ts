import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import prisma from '@/lib/db';
import { getSession } from '@/lib/session';

export async function GET() {
  const session = await getSession();
  if (!session.isLoggedIn) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const settings = await prisma.siteSettings.findUnique({ where: { id: 'global' } });
  return NextResponse.json({ settings });
}

export async function PUT(req: Request) {
  const session = await getSession();
  if (!session.isLoggedIn) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();

  const settings = await prisma.siteSettings.upsert({
    where: { id: 'global' },
    update: {
      ...(typeof body.siteName === 'string' && { siteName: body.siteName }),
      ...(typeof body.siteUrl === 'string' && { siteUrl: body.siteUrl }),
      ...(typeof body.adsenseClientId === 'string' && { adsenseClientId: body.adsenseClientId }),
      ...(typeof body.adsenseAdSlot === 'string' && { adsenseAdSlot: body.adsenseAdSlot }),
      ...(typeof body.adsenseAutoAds === 'boolean' && { adsenseAutoAds: body.adsenseAutoAds }),
      ...(typeof body.adsenseManualUnits === 'boolean' && { adsenseManualUnits: body.adsenseManualUnits }),
      ...(typeof body.adsenseOnHome === 'boolean' && { adsenseOnHome: body.adsenseOnHome }),
      ...(typeof body.adsenseOnArticles === 'boolean' && { adsenseOnArticles: body.adsenseOnArticles }),
      ...(typeof body.socialX === 'string' && { socialX: body.socialX }),
      ...(typeof body.socialFacebook === 'string' && { socialFacebook: body.socialFacebook }),
      ...(typeof body.socialInstagram === 'string' && { socialInstagram: body.socialInstagram }),
      ...(typeof body.socialYoutube === 'string' && { socialYoutube: body.socialYoutube }),
      ...(typeof body.socialTiktok === 'string' && { socialTiktok: body.socialTiktok }),
      ...(typeof body.socialLinkedin === 'string' && { socialLinkedin: body.socialLinkedin }),
      ...(typeof body.socialShowFooter === 'boolean' && { socialShowFooter: body.socialShowFooter }),
      ...(typeof body.amazonTag === 'string' && { amazonTag: body.amazonTag }),
      ...(typeof body.geminiApiKey === 'string' && { geminiApiKey: body.geminiApiKey }),
      ...(typeof body.anthropicApiKey === 'string' && { anthropicApiKey: body.anthropicApiKey }),
      ...(typeof body.openaiApiKey === 'string' && { openaiApiKey: body.openaiApiKey }),
      ...(typeof body.aiProvider === 'string' && { aiProvider: body.aiProvider }),
      ...(typeof body.aiModel === 'string' && { aiModel: body.aiModel }),
      ...(typeof body.imageProvider === 'string' && { imageProvider: body.imageProvider }),
      ...(typeof body.imageModel === 'string' && { imageModel: body.imageModel || null }),
      ...(typeof body.imageStyle === 'string' && { imageStyle: body.imageStyle }),
      ...(typeof body.imageFallback === 'string' && { imageFallback: body.imageFallback }),
      ...(typeof body.autoPublish === 'boolean' && { autoPublish: body.autoPublish }),
    },
    create: {
      id: 'global',
      siteName: body.siteName || 'MyTechNews',
      siteUrl: body.siteUrl || null,
      adsenseClientId: body.adsenseClientId || null,
      adsenseAdSlot: body.adsenseAdSlot || null,
      adsenseAutoAds: body.adsenseAutoAds !== false,
      adsenseManualUnits: body.adsenseManualUnits === true,
      adsenseOnHome: body.adsenseOnHome !== false,
      adsenseOnArticles: body.adsenseOnArticles !== false,
      socialX: body.socialX || null,
      socialFacebook: body.socialFacebook || null,
      socialInstagram: body.socialInstagram || null,
      socialYoutube: body.socialYoutube || null,
      socialTiktok: body.socialTiktok || null,
      socialLinkedin: body.socialLinkedin || null,
      socialShowFooter: body.socialShowFooter !== false,
      amazonTag: body.amazonTag || null,
      geminiApiKey: body.geminiApiKey || null,
      anthropicApiKey: body.anthropicApiKey || null,
      openaiApiKey: body.openaiApiKey || null,
      aiProvider: body.aiProvider || 'gemini',
      aiModel: body.aiModel || 'gemini-3.6-flash',
      imageProvider: body.imageProvider || 'auto',
      imageModel: body.imageModel || null,
      imageStyle: body.imageStyle || 'editorial',
      imageFallback: body.imageFallback || 'placeholder',
      autoPublish: Boolean(body.autoPublish),
    },
  });

  revalidatePath('/', 'layout');

  return NextResponse.json({ settings });
}