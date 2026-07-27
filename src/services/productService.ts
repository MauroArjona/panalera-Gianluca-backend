import { supabase } from '../db/supabase'
import { httpError } from '../middlewares/auth'
import type { ProductoApi, ProductoInsert, ProductoRow, ProductoUpdate } from '../types'

export interface ProductFilters {
  category?: string
  categoriaId?: number
  subcategoriaId?: number
  search?: string
  minPrice?: number
  maxPrice?: number
  sortBy?: 'price_asc' | 'price_desc' | 'name_asc' | 'newest'
  soloPromo?: boolean
  soloDestacados?: boolean
  soloCarrusel?: boolean
  page?: number
  perPage?: number
}

const PRODUCT_SELECT = `
  *,
  subcategoria:subcategorias(id,categoria_id,nombre,created_at,categoria:categorias(id,nombre,created_at)),
  imagenes(id,producto_id,url,created_at),
  talles(id,producto_id,talle,stock,precio,unidades,imagen_url,created_at)
`

function toApi(p: ProductoRow): ProductoApi {
  const images = (p.imagenes ?? [])
    .sort((a, b) => a.id - b.id)
    .map((image) => image.url)
  const talles = (p.talles ?? [])
    .sort((a, b) => a.id - b.id)
    .map((item) => ({
      id: item.id,
      talle: item.talle,
      stock: Number(item.stock ?? 0),
      price: Number(item.precio ?? p.price),
      units: item.unidades ?? '',
      image: item.imagen_url ?? '',
    }))
  const stock = talles.reduce((sum, item) => sum + item.stock, 0)

  return {
    id: p.id,
    name: p.name,
    price: Number(p.price),
    image: images[0] ?? '',
    images,
    category: p.subcategoria?.categoria?.nombre ?? '',
    categoriaId: p.subcategoria?.categoria_id ?? null,
    subcategoriaId: p.subcategoria_id,
    subcategory: p.subcategoria?.nombre ?? '',
    stock,
    talle: Array.from(new Set(talles.map((item) => item.talle))).join(', ') || null,
    talles,
    isPromo: p.is_promo,
    oldPrice: p.old_price ? Number(p.old_price) : null,
    marca: null,
    enCarrusel: p.en_carrusel,
    destacado: p.destacado,
    createdAt: p.created_at,
  }
}

async function resolveCategoriaId(category?: string, categoriaId?: number) {
  if (categoriaId) return categoriaId
  if (!category) return undefined

  const { data, error } = await supabase
    .from('categorias')
    .select('id')
    .ilike('nombre', category)
    .maybeSingle()

  if (error) throw new Error(error.message)
  return data?.id as number | undefined
}

async function resolveSubcategoriaId(subcategory?: string, subcategoriaId?: number) {
  if (subcategoriaId) return subcategoriaId
  if (!subcategory) return undefined

  const { data, error } = await supabase
    .from('subcategorias')
    .select('id')
    .ilike('nombre', subcategory)
    .maybeSingle()

  if (error) throw new Error(error.message)
  return data?.id as number | undefined
}

async function listSubcategoriaIdsByCategoria(categoriaId?: number) {
  if (!categoriaId) return undefined

  const { data, error } = await supabase
    .from('subcategorias')
    .select('id')
    .eq('categoria_id', categoriaId)

  if (error) throw new Error(error.message)
  return (data ?? []).map((item) => item.id as number)
}

async function replaceImages(productId: number, images: string[]) {
  await supabase.from('imagenes').delete().eq('producto_id', productId)
  const cleaned = images.map((url) => url.trim()).filter(Boolean)
  if (cleaned.length === 0) return

  const { error } = await supabase
    .from('imagenes')
    .insert(cleaned.map((url) => ({ producto_id: productId, url })))

  if (error) throw new Error(error.message)
}

async function replaceTalles(
  productId: number,
  talles: Array<{ talle: string; stock: number; price?: number | null; units?: string | null; image?: string | null }>,
) {
  await supabase.from('talles').delete().eq('producto_id', productId)
  const cleaned = talles
    .map((item) => ({
      talle: item.talle.trim(),
      stock: Number(item.stock ?? 0),
      precio: item.price ?? null,
      unidades: item.units?.trim() || null,
      imagen_url: item.image?.trim() || null,
    }))
    .filter((item) => item.talle)
  if (cleaned.length === 0) return

  const { error } = await supabase
    .from('talles')
    .insert(cleaned.map((item) => ({ producto_id: productId, ...item })))

  if (error) throw new Error(error.message)
}

export const productService = {
  async list(filters: ProductFilters = {}) {
    const page = Math.max(1, filters.page ?? 1)
    const perPage = Math.min(1000, filters.perPage ?? 12)
    const from = (page - 1) * perPage
    const to = from + perPage - 1
    const categoriaId = await resolveCategoriaId(filters.category, filters.categoriaId)
    const subcategoriaId = await resolveSubcategoriaId(undefined, filters.subcategoriaId)
    const subcategoriaIds = await listSubcategoriaIdsByCategoria(categoriaId)

    let query = supabase
      .from('productos')
      .select(PRODUCT_SELECT, { count: 'exact' })

    if (subcategoriaId) query = query.eq('subcategoria_id', subcategoriaId)
    else if (subcategoriaIds) query = subcategoriaIds.length > 0
      ? query.in('subcategoria_id', subcategoriaIds)
      : query.eq('subcategoria_id', -1)
    if (filters.search) query = query.ilike('name', `%${filters.search}%`)
    if (filters.soloPromo) query = query.eq('is_promo', true)
    if (filters.soloDestacados) query = query.eq('destacado', true)
    if (filters.soloCarrusel) query = query.eq('en_carrusel', true)
    if (filters.minPrice !== undefined) query = query.gte('price', filters.minPrice)
    if (filters.maxPrice !== undefined) query = query.lte('price', filters.maxPrice)

    switch (filters.sortBy) {
      case 'price_asc':
        query = query.order('price', { ascending: true })
        break
      case 'price_desc':
        query = query.order('price', { ascending: false })
        break
      case 'name_asc':
        query = query.order('name', { ascending: true })
        break
      default:
        query = query.order('created_at', { ascending: false })
    }

    const { data, error, count } = await query.range(from, to)
    if (error) throw new Error(`Error al obtener productos: ${error.message}`)

    const total = count ?? 0
    return {
      data: ((data ?? []) as ProductoRow[]).map(toApi),
      total,
      page,
      perPage,
      totalPages: Math.ceil(total / perPage),
    }
  },

  async getById(id: number): Promise<ProductoApi> {
    const { data, error } = await supabase
      .from('productos')
      .select(PRODUCT_SELECT)
      .eq('id', id)
      .single()

    if (error || !data) throw httpError('Producto no encontrado.', 404)
    return toApi(data as ProductoRow)
  },

  async getPromos(): Promise<ProductoApi[]> {
    return (await this.list({ soloPromo: true, perPage: 10 })).data
  },

  async getDestacados(): Promise<ProductoApi[]> {
    return (await this.list({ soloDestacados: true, perPage: 10 })).data
  },

  async getCarrusel(): Promise<ProductoApi[]> {
    return (await this.list({ soloCarrusel: true, perPage: 10 })).data
  },

  
  async create(payload: ProductoInsert): Promise<ProductoApi> {
    const { images = [], talles = [], ...productPayload } = payload
    const { data, error } = await supabase
      .from('productos')
      .insert(productPayload)
      .select('id')
      .single()

    if (error || !data) throw new Error(error?.message ?? 'No se pudo crear el producto.')

    await replaceImages(data.id, images)
    await replaceTalles(data.id, talles)
    return this.getById(data.id)
  },

  async update(id: number, payload: ProductoUpdate): Promise<ProductoApi> {
    const { images, talles, ...productPayload } = payload

    if (Object.keys(productPayload).length > 0) {
      const { error } = await supabase.from('productos').update(productPayload).eq('id', id)
      if (error) throw new Error(error.message)
    }

    if (images) await replaceImages(id, images)
    if (talles) await replaceTalles(id, talles)
    return this.getById(id)
  },

  async delete(id: number): Promise<void> {
    await supabase.from('imagenes').delete().eq('producto_id', id)
    await supabase.from('talles').delete().eq('producto_id', id)
    const { error } = await supabase.from('productos').delete().eq('id', id)
    if (error) throw new Error(error.message)
  },
}
