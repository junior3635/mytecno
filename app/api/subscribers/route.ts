import { NextResponse } from 'next/server';
import crypto from 'crypto';
import prisma from '@/lib/db';

export async function POST(req: Request) {
  const { email } = await req.json();

  if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    return NextResponse.json({ error: 'A valid email is required' }, { status: 400 });
  }

  const normalized = email.trim().toLowerCase();

  const existing = await prisma.subscriber.findUnique({ where: { email: normalized } });
  if (existing) {
    if (!existing.isActive) {
      await prisma.subscriber.update({ where: { id: existing.id }, data: { isActive: true } });
      return NextResponse.json({ message: "You've been re-subscribed. Welcome back!" }, { status: 200 });
    }
    // Already subscribed — idempotent success
    return NextResponse.json({ message: "You're already subscribed. You're all set!" }, { status: 200 });
  }

  await prisma.subscriber.create({
    data: {
      email: normalized,
      token: crypto.randomBytes(24).toString('hex'),
      isActive: true,
    },
  });

  return NextResponse.json(
    { message: "You're subscribed! We'll send you the latest tech news." },
    { status: 201 }
  );
}