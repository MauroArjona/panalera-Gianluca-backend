import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import sharp from 'sharp'
import { optimizeImageBuffer } from './optimizeImage'

describe('optimizeImageBuffer', () => {
  it('reduces very large images before upload', async () => {
    const source = await sharp({
      create: {
        width: 3200,
        height: 2400,
        channels: 3,
        background: { r: 255, g: 255, b: 255 },
      },
    })
      .jpeg({ quality: 100 })
      .toBuffer()

    const result = await optimizeImageBuffer(source, 'image.jpg')

    assert.equal(result.contentType, 'image/jpeg')
    assert.equal(result.extension, 'jpg')

    const metadata = await sharp(result.buffer).metadata()
    assert.ok((metadata.width ?? 0) <= 1200)
    assert.ok((metadata.height ?? 0) <= 1200)
    assert.ok(result.buffer.length < source.length)
  })
})
