export interface CategoriaRow {
  id: number
  nombre: string
  created_at: string
}

export interface SubcategoriaRow {
  id: number
  categoria_id: number
  nombre: string
  created_at: string
  categoria?: CategoriaRow
}

export interface ImagenRow {
  id: number
  producto_id: number
  url: string
  created_at: string
}

export interface TalleRow {
  id: number
  producto_id: number
  talle: string
  stock: number
  precio: number | null
  unidades: string | null
  imagen_url: string | null
  created_at: string
}

export interface ProductoRow {
  id: number
  name: string
  price: number
  created_at: string
  is_promo: boolean
  en_carrusel: boolean
  destacado: boolean
  old_price: number | null
  subcategoria_id: number | null
  subcategoria?: SubcategoriaRow | null
  imagenes?: ImagenRow[]
  talles?: TalleRow[]
}

export interface ProductoApi {
  id: number
  name: string
  price: number
  image: string
  images: string[]
  category: string
  categoriaId: number | null
  subcategoriaId: number | null
  subcategory: string
  stock: number
  talle: string | null
  talles: Array<{ id?: number; talle: string; stock: number; price: number; units: string; image: string }>
  isPromo: boolean
  oldPrice: number | null
  marca: string | null
  enCarrusel: boolean
  destacado: boolean
  createdAt: string
}

export interface ProductoInsert {
  name: string
  price: number
  subcategoria_id?: number | null
  is_promo?: boolean
  destacado?: boolean
  en_carrusel?: boolean
  old_price?: number | null
  images?: string[]
  talles?: Array<{ talle: string; stock: number; price?: number | null; units?: string | null; image?: string | null }>
}

export type ProductoUpdate = Partial<ProductoInsert>

export interface VentaRow {
  id: number
  created_at: string
  items: VentaItem[]
  total: number
  estado: string
}

export interface VentaItem {
  id?: number
  productId: number
  quantity: number
  price: number
  size?: string
}

export type VentaInsert = Omit<VentaRow, 'id' | 'created_at'>
export type VentaUpdate = Partial<Pick<VentaRow, 'estado'>>

export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  perPage: number
  totalPages: number
}

export interface JwtPayload {
  sub: string
  email: string
  role: 'customer' | 'admin'
}
