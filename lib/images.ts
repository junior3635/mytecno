import fs from 'fs';
import path from 'path';

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');

export function saveImageFromDataUrl(dataUrl: string, fileName: string): string {
  const match = /^data:(image\/(jpeg|png|svg\+xml|webp));base64,(.+)$/.exec(dataUrl);
  if (!match) throw new Error('Invalid image data URL');

  const [, mime, , base64Data] = match;
  const ext = mime === 'image/svg+xml' ? 'svg' : mime.replace('image/', '');
  const safeName = `${fileName.replace(/[^a-z0-9-]+/gi, '-').replace(/(^-|-$)+/g, '') || 'image'}.${ext}`;
  const fullPath = path.join(UPLOAD_DIR, safeName);

  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  fs.writeFileSync(fullPath, Buffer.from(base64Data, 'base64'));

  return `/uploads/${safeName}`;
}