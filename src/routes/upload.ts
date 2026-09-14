import { Router, Request, Response } from 'express'
import multer from 'multer'
import { supabase } from '../db/supabase'

const router = Router()
const STORAGE_BUCKET = process.env.SUPABASE_STORAGE_BUCKET ?? 'fotos_productos'

function resolveStoragePath(rawUrl: string) {
  const trimmed = rawUrl.trim()
  if (!trimmed) return null
  if (!trimmed.startsWith('http')) return trimmed.replace(/^\/+/, '')

  const url = new URL(trimmed)
  const publicMarker = `/storage/v1/object/public/${STORAGE_BUCKET}/`
  const objectMarker = `/storage/v1/object/${STORAGE_BUCKET}/`
  const marker = url.pathname.includes(publicMarker) ? publicMarker : objectMarker
  const index = url.pathname.indexOf(marker)

  if (index === -1) return null
  return decodeURIComponent(url.pathname.slice(index + marker.length))
}

function contentTypeFromPath(path: string, fallback = 'image/jpeg') {
  const cleanPath = path.toLowerCase().split('?')[0]
  if (cleanPath.endsWith('.png')) return 'image/png'
  if (cleanPath.endsWith('.webp')) return 'image/webp'
  if (cleanPath.endsWith('.gif')) return 'image/gif'
  if (cleanPath.endsWith('.svg')) return 'image/svg+xml'
  if (cleanPath.endsWith('.jpg') || cleanPath.endsWith('.jpeg')) return 'image/jpeg'
  return fallback
}

function imageContentType(type: string | null | undefined, path: string) {
  return type?.startsWith('image/') ? type : contentTypeFromPath(path)
}

// Multer en memoria (no guarda en disco)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB máximo
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (allowed.includes(file.mimetype)) cb(null, true)
    else cb(new Error('Solo se permiten imágenes (jpg, png, webp, gif)'))
  },
})

/**
 * POST /v1/upload/imagen
 * Body: multipart/form-data con campo "imagen"
 * Respuesta: { success: true, url: "https://..." }
 */
router.post('/imagen', upload.single('imagen'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No se recibió ningún archivo.' })
    }

    const ext      = req.file.originalname.split('.').pop()
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    const path     = `productos/${filename}`

    // Subir al bucket "productos" de Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(path, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: true,
      })

      if (uploadError) {
        console.error('Supabase upload error:', uploadError)
        throw new Error(uploadError.message)
      }
    // if (uploadError) throw new Error(uploadError.message)

    // Obtener URL pública
    const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path)

    return res.json({ success: true, url: data.publicUrl })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Error al subir imagen'
    return res.status(500).json({ success: false, message: msg })
  }
})

router.get('/imagen', async (req: Request, res: Response) => {
  try {
    const rawUrl = String(req.query.url ?? '')
    const path = resolveStoragePath(rawUrl)

    if (!path) {
      return res.status(400).json({ success: false, message: 'URL de imagen invalida.' })
    }

    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .download(path)

    if (error || !data) {
      if (rawUrl.startsWith('http')) {
        const response = await fetch(rawUrl)
        const contentType = imageContentType(response.headers.get('content-type'), rawUrl)

        if (response.ok) {
          const buffer = Buffer.from(await response.arrayBuffer())
          res.setHeader('Content-Type', contentType)
          res.setHeader('Cache-Control', 'public, max-age=31536000, immutable')
          return res.send(buffer)
        }
      }

      return res.status(404).json({ success: false, message: error?.message ?? 'Imagen no encontrada.' })
    }

    const buffer = Buffer.from(await data.arrayBuffer())
    res.setHeader('Content-Type', imageContentType(data.type, path))
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable')
    return res.send(buffer)
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Error al obtener imagen'
    return res.status(500).json({ success: false, message: msg })
  }
})

export default router
