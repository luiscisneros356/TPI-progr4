import type { Categoria } from '../../categorias/types'

/** Igual que ProductoRead del backend. */
export interface Producto {
  id: number
  nombre: string
  descripcion: string | null
  precio_base: number
  imagen_url: string | null
  stock: number
  disponible: boolean
  categoria_id: number
  activo: boolean
  categoria: Categoria
}

export interface ProductoCreate {
  nombre: string
  descripcion?: string | null
  precio_base: number
  imagen_url?: string | null
  stock: number
  disponible: boolean
  categoria_id: number
}

export type ProductoUpdate = Partial<ProductoCreate>

export interface ProductoStockUpdate {
  stock?: number
  disponible?: boolean
}

/** Igual que ProductosPaginados del backend. */
export interface ProductosPaginados {
  total: number
  items: Producto[]
  page: number | null
  size: number | null
  pages: number | null
}

export interface FiltrosProductos {
  skip: number
  limit: number
  search?: string
  categoria_id?: number
  disponible?: boolean
}
