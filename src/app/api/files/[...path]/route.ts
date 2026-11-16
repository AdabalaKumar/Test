import fs from 'node:fs/promises';
import path from 'node:path';
import { UPLOAD_DIR } from '@/lib/db';
import { fail } from '@/lib/http';

const TYPES: Record<string, string> = {
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.avif': 'image/avif',
  '.glb': 'model/gltf-binary', '.pdf': 'application/pdf',
};

export async function GET(_req: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const name = (await params).path.join('/');
  // Uploads are stored flat under generated names; anything else cannot be one of ours.
  if (!/^[a-z0-9-]+\.[a-z0-9]+$/.test(name)) return fail(404, 'Not found.');
  const type = TYPES[path.extname(name)];
  if (!type) return fail(404, 'Not found.');
  try {
    const data = await fs.readFile(path.join(UPLOAD_DIR, name));
    return new Response(new Uint8Array(data), {
      headers: { 'Content-Type': type, 'Cache-Control': 'public, max-age=31536000, immutable', 'X-Content-Type-Options': 'nosniff' },
    });
  } catch {
    return fail(404, 'Not found.');
  }
}
