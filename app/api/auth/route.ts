import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getSession } from '@/lib/session';
import prisma from '@/lib/db';
import { checkRateLimit } from '@/lib/rate-limit';

const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 5;

export async function POST(req: Request) {
  const { email, password } = await req.json();

  const ip = req.headers.get('x-forwarded-for')?.split(',').shift()?.trim()
    || req.headers.get('x-real-ip')
    || 'unknown';
  const key = `login:${ip}:${String(email).toLowerCase()}`;

  if (!checkRateLimit(key, MAX_ATTEMPTS, WINDOW_MS)) {
    return NextResponse.json(
      {
        error: `Too many failed attempts. Try again in ${Math.ceil(WINDOW_MS / 60000)} minutes.`,
      },
      { status: 429 },
    );
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }

  const session = await getSession();
  session.isLoggedIn = true;
  session.email = email;
  await session.save();

  return NextResponse.json({ success: true });
}
