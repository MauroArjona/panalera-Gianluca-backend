import sharp from 'sharp'

export interface OptimizedImage {
  buffer: Buffer
  contentType: string
  extension: 'jpg' | 'png' | 'webp'
}

const MAX_SIDE = 1200

function resolveTargetFormat(originalName: string, mimeType?: string): 'jpg' | 'png' | 'webp' {
  const name = originalName.toLowerCase()
  const type = mimeType?.toLowerCase() ?? ''

  if (name.endsWith('.png') || type.includes('png')) return 'png'
  if (name.endsWith('.webp') || type.includes('webp')) return 'webp'
  return 'jpg'
}

export async function optimizeImageBuffer(
  input: Buffer,
  originalName: string,
  maxWidth = MAX_SIDE,
  maxHeight = MAX_SIDE,
): Promise<OptimizedImage> {
  const targetFormat = resolveTargetFormat(originalName)
  const transformer = sharp(input).resize({
    width: maxWidth,
    height: maxHeight,
    fit: 'inside',
    withoutEnlargement: true,
  })

  let buffer: Buffer
  switch (targetFormat) {
    case 'png':
      buffer = await transformer.png({
        quality: 80,
        compressionLevel: 9,
        progressive: true,
      }).toBuffer()
      break
    case 'webp':
      buffer = await transformer.webp({ quality: 72, effort: 4 }).toBuffer()
      break
    default:
      buffer = await transformer.jpeg({
        quality: 72,
        mozjpeg: true,
        progressive: true,
      }).toBuffer()
      break
  }

  return {
    buffer,
    extension: targetFormat,
    contentType:
      targetFormat === 'png'
        ? 'image/png'
        : targetFormat === 'webp'
          ? 'image/webp'
          : 'image/jpeg',
  }
}
