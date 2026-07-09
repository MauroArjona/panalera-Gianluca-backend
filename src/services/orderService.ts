import { supabase } from '../db/supabase'
import type { VentaInsert, VentaItem } from '../types'

// ─── Tipos de entrada ─────────────────────────────────────────────────────────
export interface CreateVentaPayload {
  items: VentaItem[]
  total: number
  estado?: string
}

// ─── ventaService / orderService ──────────────────────────────────────────────
export const orderService = {

  // ── Listar todas las ventas (admin) ────────────────────────────────────────
  async listAll() {
    const { data, error } = await supabase
      .from('ventas')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw new Error(error.message)
    return data ?? []
  },

  // ── Obtener venta por ID ──────────────────────────────────────────────────
  async getById(ventaId: number) {
    const { data, error } = await supabase
      .from('ventas')
      .select('*')
      .eq('id', ventaId)
      .single()

    if (error || !data) {
      const err = Object.assign(new Error('Venta no encontrada.'), { statusCode: 404 })
      throw err
    }

    return data
  },

  // ── Crear venta (orden) ───────────────────────────────────────────────────
  async create(payload: CreateVentaPayload) {
    const ventaInsert: VentaInsert = {
      items: payload.items,
      total: payload.total,
      estado: payload.estado ?? 'pendiente',
    }

    const { data, error } = await supabase
      .from('ventas')
      .insert(ventaInsert)
      .select()
      .single()

    if (error) throw new Error(error.message)
    return data
  },

  // ── Actualizar estado de la venta (admin) ─────────────────────────────────
  async updateStatus(ventaId: number, estado: string) {
    const validStates = ['pendiente', 'procesando', 'enviado', 'entregado', 'cancelado']
    if (!validStates.includes(estado)) {
      const err = Object.assign(new Error(`Estado inválido: ${estado}`), { statusCode: 400 })
      throw err
    }

    const { data, error } = await supabase
      .from('ventas')
      .update({ estado })
      .eq('id', ventaId)
      .select()
      .single()

    if (error || !data) {
      const err = Object.assign(new Error('Venta no encontrada.'), { statusCode: 404 })
      throw err
    }

    return data
  },

  // ── Listar por estado ─────────────────────────────────────────────────────
  async listByEstado(estado: string) {
    const { data, error } = await supabase
      .from('ventas')
      .select('*')
      .eq('estado', estado)
      .order('created_at', { ascending: false })

    if (error) throw new Error(error.message)
    return data ?? []
  },
}
