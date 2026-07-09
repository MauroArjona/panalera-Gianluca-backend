import type { Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { categoriaService, subcategoriaService } from '../services/catalogService'

const categoriaSchema = z.object({ nombre: z.string().min(1, 'El nombre es obligatorio') })
const subcategoriaSchema = z.object({
  nombre: z.string().min(1, 'El nombre es obligatorio'),
  categoria_id: z.number().int().positive('La categoria es obligatoria'),
})

export const categoriaController = {
  async list(_req: Request, res: Response, next: NextFunction) {
    try {
      res.json({ success: true, data: await categoriaService.list() })
    } catch (err) {
      next(err)
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = categoriaSchema.safeParse(req.body)
      if (!parsed.success) {
        res.status(400).json({ success: false, message: parsed.error.errors[0]?.message })
        return
      }
      res.status(201).json({ success: true, data: await categoriaService.create(parsed.data.nombre) })
    } catch (err) {
      next(err)
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = categoriaSchema.safeParse(req.body)
      if (!parsed.success) {
        res.status(400).json({ success: false, message: parsed.error.errors[0]?.message })
        return
      }
      res.json({ success: true, data: await categoriaService.update(Number(req.params.id), parsed.data.nombre) })
    } catch (err) {
      next(err)
    }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      await categoriaService.delete(Number(req.params.id))
      res.json({ success: true, message: 'Categoria eliminada.' })
    } catch (err) {
      next(err)
    }
  },
}

export const subcategoriaController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const categoriaId = req.query.categoria_id ? Number(req.query.categoria_id) : undefined
      res.json({ success: true, data: await subcategoriaService.list(categoriaId) })
    } catch (err) {
      next(err)
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = subcategoriaSchema.safeParse(req.body)
      if (!parsed.success) {
        res.status(400).json({ success: false, message: parsed.error.errors[0]?.message })
        return
      }
      res.status(201).json({
        success: true,
        data: await subcategoriaService.create(parsed.data.nombre, parsed.data.categoria_id),
      })
    } catch (err) {
      next(err)
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = subcategoriaSchema.partial().safeParse(req.body)
      if (!parsed.success) {
        res.status(400).json({ success: false, message: parsed.error.errors[0]?.message })
        return
      }
      res.json({ success: true, data: await subcategoriaService.update(Number(req.params.id), parsed.data) })
    } catch (err) {
      next(err)
    }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      await subcategoriaService.delete(Number(req.params.id))
      res.json({ success: true, message: 'Subcategoria eliminada.' })
    } catch (err) {
      next(err)
    }
  },
}
