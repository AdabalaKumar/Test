import { randomBytes } from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { UPLOAD_DIR } from '@/lib/db';
import { HttpError, ok, requireAdmin, route } from '@/lib/http';

export const runtime = 'nodejs';

const KINDS: Record<string, { ext: string[]; max: number }> = {
  image: { ext: ['.jpg', '.jpeg', '.png', '.webp', '.avif'], max: 12 * 1024 * 1024 },
  model: { ext: ['.glb'], max: 60 * 1024 * 1024 },
  plan: { ext: ['.jpg', '.jpeg', '.png', '.webp', '.pdf'], max: 12 * 1024 * 1024 },
};
/** Leading bytes for each accepted type, so a renamed file is rejected. */
const MAGIC: Record<string, number[][]> = {
  '.jpg': [[0xff, 0xd8, 0xff]], '.jpeg': [[0xff, 0xd8, 0xff]], '.png': [[0x89, 0x50, 0x4e, 0x47]], '.webp': [[0x52, 0x49, 0x46, 0x46]],
  '.avif': [], '.glb': [[0x67, 0x6c, 0x54, 0x46]], '.pdf': [[0x25, 0x50, 0x44, 0x46]],
};

/** POST multipart/form-data { file, kind: image | model | plan } -> { url } */
export const POST = route(async (req: Request) => {
  await requireAdmin();
  const form = await req.formData().catch(() => null);
  const file = form?.get('file');
  const kind = KINDS[String(form?.get('kind') ?? 'image')];
  if (!(file instanceof File) || !kind) throw new HttpError(400, 'Attach a file and a valid kind (image, model or plan).');
  const ext = path.extname(file.name).toLowerCase();
  if (!kind.ext.includes(ext)) throw new HttpError(415, `Unsupported file type. Allowed: ${kind.ext.join(', ')}`);
  if (file.size > kind.max) throw new HttpError(413, `File is too large (max ${Math.round(kind.max / 1048576)} MB).`);
  const buf = Buffer.from(await file.arrayBuffer());
  const sigs = MAGIC[ext] ?? [];
  if (sigs.length && !sigs.some((sig) => sig.every((b, i) => buf[i] === b))) throw new HttpError(415, 'File contents do not match the file extension.');
  const name = `${Date.now().toString(36)}-${randomBytes(6).toString('hex')}${ext}`;
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  await fs.writeFile(path.join(UPLOAD_DIR, name), buf);
  return ok({ url: `/api/files/${name}`, name: file.name, size: file.size }, 201);
});
