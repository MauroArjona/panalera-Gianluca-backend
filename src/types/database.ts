import type {
  CategoriaRow,
  ImagenRow,
  ProductoRow,
  SubcategoriaRow,
  TalleRow,
  VentaRow,
} from './index'

export interface Database {
  public: {
    Tables: {
      productos: {
        Row: ProductoRow
        Insert: Omit<ProductoRow, 'id' | 'created_at' | 'subcategoria' | 'imagenes' | 'talles'>
        Update: Partial<Omit<ProductoRow, 'id' | 'created_at' | 'subcategoria' | 'imagenes' | 'talles'>>
      }
      ventas: {
        Row: VentaRow
        Insert: Omit<VentaRow, 'id' | 'created_at'>
        Update: Partial<Pick<VentaRow, 'estado'>>
      }
      categorias: {
        Row: CategoriaRow
        Insert: Pick<CategoriaRow, 'nombre'>
        Update: Partial<Pick<CategoriaRow, 'nombre'>>
      }
      subcategorias: {
        Row: SubcategoriaRow
        Insert: Pick<SubcategoriaRow, 'categoria_id' | 'nombre'>
        Update: Partial<Pick<SubcategoriaRow, 'categoria_id' | 'nombre'>>
      }
      imagenes: {
        Row: ImagenRow
        Insert: Pick<ImagenRow, 'producto_id' | 'url'>
        Update: Partial<Pick<ImagenRow, 'url'>>
      }
      talles: {
        Row: TalleRow
        Insert: Pick<TalleRow, 'producto_id' | 'talle' | 'stock'> & Partial<Pick<TalleRow, 'precio' | 'unidades' | 'imagen_url'>>
        Update: Partial<Pick<TalleRow, 'talle' | 'stock' | 'precio' | 'unidades' | 'imagen_url'>>
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}
