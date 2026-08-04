// scripts/optimize-images.mjs
// Re-compress every JPEG in public/images: cap width at 1600px, quality 78.
// Run after adding new images: node scripts/optimize-images.mjs
import sharp from 'sharp'
import { readdirSync, statSync, renameSync, unlinkSync } from 'fs'
import path from 'path'

const dir = 'public/images'
for (const f of readdirSync(dir)) {
  if (!f.endsWith('.jpg')) continue
  const src = path.join(dir, f)
  const before = statSync(src).size
  const tmp = src + '.tmp'
  const img = sharp(src)
  const meta = await img.metadata()
  await img
    .rotate() // apply EXIF orientation before metadata is stripped
    .resize({ width: Math.min(meta.width ?? 1600, 1600), withoutEnlargement: true })
    .jpeg({ quality: 78, mozjpeg: true })
    .toFile(tmp)
  const after = statSync(tmp).size
  if (after < before) {
    unlinkSync(src)
    renameSync(tmp, src)
  } else {
    unlinkSync(tmp)
  }
  console.log(`${f}: ${(before / 1024).toFixed(0)}KB -> ${(Math.min(after, before) / 1024).toFixed(0)}KB`)
}
