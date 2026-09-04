import { NextResponse } from 'next/server';
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
      ...(typeof body.amazonTag === 'string' && { amazonTag: body.amazonTag }),
      ...(typeof body.geminiApiKey === 'string' && { geminiApiKey: body.geminiApiKey }),
      ...(typeof body.aiModel === 'string' && { aiModel: body.aiModel }),
      ...(typeof body.autoPublish === 'boolean' && { autoPublish: body.autoPublish }),
    },
    create: {
      id: 'global',
      siteName: body.siteName || 'MyTechNews',
      siteUrl: body.siteUrl || null,
      adsenseClientId: body.adsenseClientId || null,
      amazonTag: body.amazonTag || null,
      geminiApiKey: body.geminiApiKey || null,
      aiModel: body.aiModel || 'gemini-3.6-flash',
      autoPublish: Boolean(body.autoPublish),
    },
  });

  return NextResponse.json({ settings });
}