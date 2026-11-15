import { api } from '../../../shared/api/axiosInstance'
import type {
  FiltrosProductos,
  Producto,
  ProductoCreate,
  ProductosPaginados,
  ProductoStockUpdate,
  ProductoUpdate,
} from '../types'

export async function listarProductos(filtros: FiltrosProductos): Promise<ProductosPaginados> {
  const params: Record<string, string | number | boolean> = {
    skip: filtros.skip,
    limit: filtros.limit,
  }
  if (filtros.search) params.search = filtros.search
  if (filtros.categoria_id !== undefined) params.categoria_id = filtros.categoria_id
  if (filtros.disponible !== undefined) params.disponible = filtros.disponible
  const { data } = await api.get<ProductosPaginados>('/productos', { params })
  return data
}

export async function crearProducto(payload: ProductoCreate): Promise<Producto> {
  const { data } = await api.post<Producto>('/productos', payload)
  return data
}

export async function actualizarProducto(id: number, payload: ProductoUpdate): Promise<Producto> {
  const { data } = await api.put<Producto>(`/productos/${id}`, payload)
  return data
}

export async function actualizarStock(
  id: number,
  payload: ProductoStockUpdate,
): Promise<Producto> {
  const { data } = await api.patch<Producto>(`/productos/${id}/stock`, payload)
  return data
}

export async function eliminarProducto(id: number): Promise<void> {
  await api.delete(`/productos/${id}`)
}
