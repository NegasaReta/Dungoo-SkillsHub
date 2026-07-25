/**
 * Turns the large source images in src/assets/landing into AVIF and WebP at the
 * widths the layout actually requests, so low-bandwidth visitors are not sent a
 * multi-hundred-kilobyte PNG.
 *
 * Build-time only: sharp is a devDependency and never reaches the browser.
 * Run with `npm run images` after adding or replacing a *-source.png.
 *
 * Sources are never upscaled; a requested width larger than the original is
 * skipped, because inventing pixels only costs bytes.
 */
import { readdir, stat } from 'node:fs/promises'
import { basename, join } from 'node:path'

import sharp from 'sharp'

const DIR = new URL('../src/assets/landing/', import.meta.url).pathname.replace(/^\//, '')
const WIDTHS = [480, 768, 1152]
const SUFFIX = '-source.png'

const files = (await readdir(DIR)).filter((name) => name.endsWith(SUFFIX))

if (files.length === 0) {
  console.log(`No *${SUFFIX} files in ${DIR}`)
  process.exit(0)
}

for (const file of files) {
  const name = basename(file, SUFFIX)
  const input = join(DIR, file)
  const { width: nativeWidth } = await sharp(input).metadata()
  const sourceBytes = (await stat(input)).size

  console.log(`\n${file} (${nativeWidth}px, ${(sourceBytes / 1024).toFixed(0)}KB)`)

  // Always emit the native width as the largest variant, so a source that sits
  // just under a requested width still gets a full-resolution version.
  const widths = [...new Set([...WIDTHS.filter((width) => width < nativeWidth), nativeWidth])]

  for (const width of widths) {
    for (const [format, options] of [
      ['avif', { quality: 55, effort: 6 }],
      ['webp', { quality: 78 }],
    ]) {
      const output = join(DIR, `${name}-${width}.${format}`)
      const { size } = await sharp(input)
        .resize({ width, withoutEnlargement: true })
        [format](options)
        .toFile(output)

      console.log(`  ${width}w ${format}: ${(size / 1024).toFixed(0)}KB`)
    }
  }
}
