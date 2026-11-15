import { useState } from 'react'
import { useCartStore } from '../../../store/cartStore'
import { Button } from '../../../shared/ui/Button'
import { Card } from '../../../shared/ui/Card'
import { Skeleton } from '../../../shared/components/Skeleton'
import { formatMoneda } from '../../../shared/utils/format'
import type { Producto } from '../types'

export function ProductoCard({ producto }: { producto: Producto }) {
  const agregar = useCartStore((s) => s.agregar)
  const enCarrito = useCartStore(
    (s) => s.items.find((i) => i.producto_id === producto.id)?.cantidad ?? 0,
  )
  const [imagenRota, setImagenRota] = useState(false)

  const sinStock = producto.stock <= 0
  const noDisponible = !producto.disponible
  const alMaximo = enCarrito >= producto.stock
  const bloqueado = sinStock || noDisponible || alMaximo

  let textoBoton = 'Agregar al carrito'
  if (noDisponible) textoBoton = 'No disponible'
  else if (sinStock) textoBoton = 'Sin stock'
  else if (alMaximo) textoBoton = 'Máximo en el carrito'

  return (
    <Card className="flex flex-col overflow-hidden">
      <div className="aspect-[3/2] bg-stone-100">
        {producto.imagen_url && !imagenRota ? (
          <img
            src={producto.imagen_url}
            alt={producto.nombre}
            loading="lazy"
            onError={() => setImagenRota(true)}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-5xl" aria-hidden="true">
            🍽️
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <span className="w-fit rounded-full bg-orange-50 px-2 py-0.5 text-xs font-medium text-orange-700">
          {producto.categoria.nombre}
        </span>
        <h3 className="font-semibold text-stone-900">{producto.nombre}</h3>
        {producto.descripcion && (
          <p className="line-clamp-2 text-sm text-stone-500">{producto.descripcion}</p>
        )}

        <div className="mt-auto flex items-end justify-between pt-2">
          <div>
            <p className="text-lg font-bold text-stone-900">{formatMoneda(producto.precio_base)}</p>
            <p className={`text-xs ${sinStock ? 'text-red-600' : 'text-stone-500'}`}>
              {sinStock ? 'Sin stock' : `Stock: ${producto.stock}`}
            </p>
          </div>
          {enCarrito > 0 && (
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800">
              {enCarrito} en el carrito
            </span>
          )}
        </div>

        <Button disabled={bloqueado} onClick={() => agregar(producto, 1)} className="w-full">
          {textoBoton}
        </Button>
      </div>
    </Card>
  )
}

/** Marcador de posición con la misma forma que ProductoCard mientras carga. */
export function ProductoCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <Skeleton className="aspect-[3/2] w-full rounded-none" />
      <div className="flex flex-col gap-3 p-4">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-6 w-1/3" />
        <Skeleton className="h-9 w-full" />
      </div>
    </Card>
  )
}
