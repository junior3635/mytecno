import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { getSession } from '@/lib/session';
import { checkRateLimit } from '@/lib/rate-limit';

export const runtime = 'nodejs';

const MAX_SIZE = 8 * 1024 * 1024;
const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');

function sniffImageType(buf: Buffer): 'png' | 'jpg' | 'gif' | 'webp' | null {
  if (buf.length >= 4 && buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) return 'png';
  if (buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return 'jpg';
  if (buf.length >= 6 && buf.toString('latin1', 0, 4) === 'GIF8') return 'gif';
  if (
    buf.length >= 12 &&
    buf.toString('latin1', 0, 4) === 'RIFF' &&
    buf.toString('latin1', 8, 12) === 'WEBP'
  ) {
    return 'webp';
  }
  return null;
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session.isLoggedIn) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const email = session.email ?? 'anonymous';
  if (!checkRateLimit(`upload:${email}`, 60, 60 * 60 * 1000)) {
    return NextResponse.json({ error: 'Too many uploads. Try again later.' }, { status: 429 });
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: 'Invalid form data' }, { status: 400 });
  }

  const files = form.getAll('files').filter((f): f is File => f instanceof File);
  if (files.length === 0) {
    return NextResponse.json({ error: 'No files provided' }, { status: 400 });
  }

  await fs.mkdir(UPLOAD_DIR, { recursive: true });

  const saved: { url: string }[] = [];
  for (const file of files) {
    if (file.size <= 0 || file.size > MAX_SIZE) {
      return NextResponse.json({ error: `"${file.name}" exceeds the 8 MB limit` }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const ext = sniffImageType(buffer);
    if (!ext) {
      return NextResponse.json(
        { error: `"${file.name}" is not a valid JPG, PNG, GIF or WebP image` },
        { status: 400 }
      );
    }

    const fileName = `${crypto.randomUUID()}.${ext}`;
    await fs.writeFile(path.join(UPLOAD_DIR, fileName), buffer);
    saved.push({ url: `/uploads/${fileName}` });
  }

  return NextResponse.json({ files: saved });
}