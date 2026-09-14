import { readdir, stat } from 'node:fs/promises';
import { join } from 'node:path';
import sharp from 'sharp';

// Import an ordered set of 16 generated source photos, four per practice area.
const folder = process.argv[2];
const since = new Date(process.argv[3]).getTime();
if (!folder || !Number.isFinite(since)) throw new Error('Usage: node scripts/import-service-photos.mjs <source-directory> <since-ISO-date>');
const files = (await Promise.all((await readdir(folder)).filter((name) => name.endsWith('.png')).map(async (name) => ({ name, time: (await stat(join(folder, name))).mtimeMs })))).filter((item) => item.time > since).sort((a, b) => a.time - b.time);
if (files.length !== 16) throw new Error(`Expected 16 source photos, found ${files.length}`);
for (const [index, file] of files.entries()) {
  const area = ['penal', 'familia', 'civil', 'transito'][Math.floor(index / 4)];
  await sharp(join(folder, file.name)).resize(1200, 800, { fit: 'cover' }).webp({ quality: 82 }).toFile(`public/images/services/${area}-${index % 4 + 1}.webp`);
}
console.log('Imported 16 optimized service photographs.');
