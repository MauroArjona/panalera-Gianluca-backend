import type { Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { productService } from '../services/productService'

const talleSchema = z.object({
  talle: z.string().min(1, 'El talle es obligatorio'),
  stock: z.number().int().min(0, 'El stock no puede ser negativo'),
  price: z.number().positive('El precio de la variante debe ser positivo').nullable().optional(),
  units: z.string().nullable().optional(),
  image: z.string().url('La imagen de la variante debe ser una URL valida').nullable().optional().or(z.literal('')),
})

const productoSchema = z.object({
  name: z.string().min(2, 'El nombre es demasiado corto'),
  price: z.number().positive('El precio debe ser positivo'),
  subcategoria_id: z.number().int().positive('La subcategoria es obligatoria').nullable().optional(),
  images: z.array(z.string().url('La imagen debe ser una URL valida')).default([]),
  talles: z.array(talleSchema).default([]),
  is_promo: z.boolean().optional().default(false),
  destacado: z.boolean().optional().default(false),
  en_carrusel: z.boolean().optional().default(false),
  old_price: z
    .preprocess((val) => (val === '' ? undefined : val), z.number().positive().optional().nullable())
    .optional()
    .nullable(),
})

export const productController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await productService.list({
        category: req.query.category as string | undefined,
        categoriaId: req.query.categoriaId ? Number(req.query.categoriaId) : undefined,
        subcategoriaId: req.query.subcategoriaId ? Number(req.query.subcategoriaId) : undefined,
        search: req.query.search as string | undefined,
        sortBy: req.query.sortBy as any,
        minPrice: req.query.minPrice ? Number(req.query.minPrice) : undefined,
        maxPrice: req.query.maxPrice ? Number(req.query.maxPrice) : undefined,
        soloPromo: req.query.promo === 'true',
        page: req.query.page ? Number(req.query.page) : 1,
        perPage: req.query.perPage ? Number(req.query.perPage) : 12,
      })
      res.json({ success: true, ...result })
    } catch (err) {
      next(err)
    }
  },

  async promos(_req: Request, res: Response, next: NextFunction) {
    try {
      res.json({ success: true, data: await productService.getPromos() })
    } catch (err) {
      next(err)
    }
  },

  async destacados(_req: Request, res: Response, next: NextFunction) {
    try {
      res.json({ success: true, data: await productService.getDestacados() })
    } catch (err) {
      next(err)
    }
  },

  async carrusel(_req: Request, res: Response, next: NextFunction) {
    try {
      res.json({ success: true, data: await productService.getCarrusel() })
    } catch (err) {
      next(err)
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id)
      if (Number.isNaN(id)) {
        res.status(400).json({ success: false, message: 'ID invalido' })
        return
      }
      res.json({ success: true, data: await productService.getById(id) })
    } catch (err) {
      next(err)
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = productoSchema.safeParse(req.body)
      if (!parsed.success) {
        res.status(400).json({ success: false, message: parsed.error.errors[0]?.message })
        return
      }
      const data = await productService.create(parsed.data)
      res.status(201).json({ success: true, data, message: 'Producto creado.' })
    } catch (err) {
      next(err)
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id)
      if (Number.isNaN(id)) {
        res.status(400).json({ success: false, message: 'ID invalido' })
        return
      }
      const parsed = productoSchema.partial().safeParse(req.body)
      if (!parsed.success) {
        res.status(400).json({ success: false, message: parsed.error.errors[0]?.message })
        return
      }
      res.json({ success: true, data: await productService.update(id, parsed.data), message: 'Producto actualizado.' })
    } catch (err) {
      next(err)
    }
  },

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id)
      if (Number.isNaN(id)) {
        res.status(400).json({ success: false, message: 'ID invalido' })
        return
      }
      await productService.delete(id)
      res.json({ success: true, message: 'Producto eliminado.' })
    } catch (err) {
      next(err)
    }
  },
}
