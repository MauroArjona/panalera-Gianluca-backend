import { supabase } from '../db/supabase'

export const categoriaService = {
  async list() {
    const { data, error } = await supabase
      .from('categorias')
      .select('*, subcategorias(id,categoria_id,nombre,created_at)')
      .order('nombre', { ascending: true })

    if (error) throw new Error(error.message)
    return data ?? []
  },

  async create(nombre: string) {
    const { data, error } = await supabase
      .from('categorias')
      .insert({ nombre })
      .select()
      .single()

    if (error) throw new Error(error.message)
    return data
  },

  async update(id: number, nombre: string) {
    const { data, error } = await supabase
      .from('categorias')
      .update({ nombre })
      .eq('id', id)
      .select()
      .single()

    if (error) throw new Error(error.message)
    return data
  },

  async delete(id: number) {
    const { error } = await supabase.from('categorias').delete().eq('id', id)
    if (error) throw new Error(error.message)
  },
}

export const subcategoriaService = {
  async list(categoriaId?: number) {
    let query = supabase
      .from('subcategorias')
      .select('*, categoria:categorias(id,nombre,created_at)')
      .order('nombre', { ascending: true })

    if (categoriaId) query = query.eq('categoria_id', categoriaId)

    const { data, error } = await query
    if (error) throw new Error(error.message)
    return data ?? []
  },

  async create(nombre: string, categoriaId: number) {
    const { data, error } = await supabase
      .from('subcategorias')
      .insert({ nombre, categoria_id: categoriaId })
      .select()
      .single()

    if (error) throw new Error(error.message)
    return data
  },

  async update(id: number, payload: { nombre?: string; categoria_id?: number }) {
    const { data, error } = await supabase
      .from('subcategorias')
      .update(payload)
      .eq('id', id)
      .select()
      .single()

    if (error) throw new Error(error.message)
    return data
  },

  async delete(id: number) {
    const { error } = await supabase.from('subcategorias').delete().eq('id', id)
    if (error) throw new Error(error.message)
  },
}
