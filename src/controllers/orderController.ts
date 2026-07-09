import type { Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { orderService } from '../services/orderService'

// ─── Schemas ──────────────────────────────────────────────────────────────────
const ventaItemSchema = z.object({
  productId: z.number().int().positive('productId debe ser un número positivo'),
  quantity: z.number().int().positive('quantity debe ser un número positivo'),
  price: z.number().positive('price debe ser positivo'),
  size: z.string().optional(),
})

const createVentaSchema = z.object({
  items: z.array(ventaItemSchema).min(1, 'Se requiere al menos un ítem'),
  total: z.number().positive('El total debe ser positivo'),
  estado: z.string().optional().default('pendiente'),
})

// ─── Controllers ──────────────────────────────────────────────────────────────
export const orderController = {

  // GET /orders  (lista todas las ventas - admin)
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await orderService.listAll()
      res.json({ success: true, data })
    } catch (err) {
      next(err)
    }
  },

  // GET /orders/:id
  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id)
      if (isNaN(id)) {
        res.status(400).json({ success: false, message: 'ID inválido' })
        return
      }
      const data = await orderService.getById(id)
      res.json({ success: true, data })
    } catch (err) {
      next(err)
    }
  },

  // POST /orders
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = createVentaSchema.safeParse(req.body)
      if (!parsed.success) {
        res.status(400).json({ success: false, message: parsed.error.errors[0]?.message })
        return
      }

      const data = await orderService.create(parsed.data)
      res.status(201).json({ success: true, data, message: 'Venta creada correctamente.' })
    } catch (err) {
      next(err)
    }
  },

  // PATCH /orders/:id/status  (admin)
  async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id)
      if (isNaN(id)) {
        res.status(400).json({ success: false, message: 'ID inválido' })
        return
      }

      const { estado } = req.body
      if (!estado) {
        res.status(400).json({ success: false, message: 'Se requiere el campo "estado".' })
        return
      }

      const data = await orderService.updateStatus(id, estado)
      res.json({ success: true, data, message: 'Estado actualizado.' })
    } catch (err) {
      next(err)
    }
  },

  // GET /orders/estado/:estado  (filtrar por estado)
  async listByEstado(req: Request, res: Response, next: NextFunction) {
    try {
      const { estado } = req.params
      const data = await orderService.listByEstado(estado)
      res.json({ success: true, data })
    } catch (err) {
      next(err)
    }
  },
}
