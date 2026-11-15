import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Producto } from '../features/productos/types'

export interface CartItem {
  producto_id: number
  nombre: string
  precio_unitario: number
  cantidad: number
  imagen_url: string | null
  /** Stock conocido al agregar: limita la cantidad máxima en el carrito. */
  stock: number
}

interface CartState {
  items: CartItem[]
  agregar: (producto: Producto, cantidad?: number) => void
  quitar: (productoId: number) => void
  cambiarCantidad: (productoId: number, cantidad: number) => void
  vaciar: () => void
  total: () => number
  cantidadTotal: () => number
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      agregar: (producto, cantidad = 1) =>
        set((state) => {
          const existente = state.items.find((i) => i.producto_id === producto.id)
          if (existente) {
            const nueva = Math.min(existente.cantidad + cantidad, producto.stock)
            return {
              items: state.items.map((i) =>
                i.producto_id === producto.id
                  ? {
                      ...i,
                      cantidad: nueva,
                      stock: producto.stock,
                      precio_unitario: producto.precio_base,
                    }
                  : i,
              ),
            }
          }
          const item: CartItem = {
            producto_id: producto.id,
            nombre: producto.nombre,
            precio_unitario: producto.precio_base,
            cantidad: Math.min(cantidad, producto.stock),
            imagen_url: producto.imagen_url,
            stock: producto.stock,
          }
          return { items: [...state.items, item] }
        }),

      quitar: (productoId) =>
        set((state) => ({ items: state.items.filter((i) => i.producto_id !== productoId) })),

      cambiarCantidad: (productoId, cantidad) =>
        set((state) => ({
          items:
            cantidad <= 0
              ? state.items.filter((i) => i.producto_id !== productoId)
              : state.items.map((i) =>
                  i.producto_id === productoId
                    ? { ...i, cantidad: Math.min(cantidad, i.stock) }
                    : i,
                ),
        })),

      vaciar: () => set({ items: [] }),

      total: () => get().items.reduce((acc, i) => acc + i.precio_unitario * i.cantidad, 0),

      cantidadTotal: () => get().items.reduce((acc, i) => acc + i.cantidad, 0),
    }),
    {
      name: 'foodstore-cart',
      partialize: (state) => ({ items: state.items }),
    },
  ),
)
