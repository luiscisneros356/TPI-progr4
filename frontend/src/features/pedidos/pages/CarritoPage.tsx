import { Link, useNavigate } from 'react-router-dom'
import { EstadoVacio } from '../../../shared/components/EstadoVacio'
import { Button } from '../../../shared/ui/Button'
import { Card } from '../../../shared/ui/Card'
import { formatMoneda } from '../../../shared/utils/format'
import { useAuthStore } from '../../../store/authStore'
import { useCartStore } from '../../../store/cartStore'

export function CarritoPage() {
  const navigate = useNavigate()
  const usuario = useAuthStore((s) => s.usuario)
  const items = useCartStore((s) => s.items)
  const total = useCartStore((s) => s.total())
  const cambiarCantidad = useCartStore((s) => s.cambiarCantidad)
  const quitar = useCartStore((s) => s.quitar)
  const vaciar = useCartStore((s) => s.vaciar)

  const continuar = () => {
    if (usuario) {
      navigate('/checkout')
    } else {
      // Sin sesión: se pide iniciarla y se vuelve al checkout.
      navigate('/login', { state: { from: { pathname: '/checkout' } } })
    }
  }

  if (items.length === 0) {
    return (
      <EstadoVacio
        titulo="Tu carrito está vacío"
        descripcion="Agregá productos desde el catálogo para armar tu pedido."
        accion={
          <Link
            to="/"
            className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700"
          >
            Ver el catálogo
          </Link>
        }
      />
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-stone-900">Tu carrito</h1>
        <Button variant="ghost" size="sm" onClick={vaciar}>
          Vaciar carrito
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-3 lg:col-span-2">
          {items.map((item) => (
            <Card key={item.producto_id} className="flex items-center gap-4 p-4">
              <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-stone-100">
                {item.imagen_url ? (
                  <img src={item.imagen_url} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-2xl">🍽️</div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-stone-900">{item.nombre}</p>
                <p className="text-sm text-stone-500">{formatMoneda(item.precio_unitario)} c/u</p>
              </div>

              <div className="flex items-center gap-1" role="group" aria-label={`Cantidad de ${item.nombre}`}>
                <Button
                  variant="secondary"
                  size="sm"
                  aria-label="Restar uno"
                  onClick={() => cambiarCantidad(item.producto_id, item.cantidad - 1)}
                >
                  −
                </Button>
                <span className="w-8 text-center text-sm font-medium">{item.cantidad}</span>
                <Button
                  variant="secondary"
                  size="sm"
                  aria-label="Sumar uno"
                  disabled={item.cantidad >= item.stock}
                  onClick={() => cambiarCantidad(item.producto_id, item.cantidad + 1)}
                >
                  +
                </Button>
              </div>

              <p className="w-28 text-right font-semibold text-stone-900">
                {formatMoneda(item.precio_unitario * item.cantidad)}
              </p>

              <Button
                variant="ghost"
                size="sm"
                aria-label={`Quitar ${item.nombre}`}
                onClick={() => quitar(item.producto_id)}
              >
                ✕
              </Button>
            </Card>
          ))}
        </div>

        <Card className="h-fit p-5">
          <h2 className="text-base font-semibold text-stone-900">Resumen</h2>
          <dl className="mt-4 flex flex-col gap-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-stone-500">Productos</dt>
              <dd>{items.reduce((acc, i) => acc + i.cantidad, 0)}</dd>
            </div>
            <div className="flex justify-between border-t border-stone-200 pt-2 text-base">
              <dt className="font-semibold">Total</dt>
              <dd className="font-bold">{formatMoneda(total)}</dd>
            </div>
          </dl>
          <Button className="mt-5 w-full" onClick={continuar}>
            {usuario ? 'Continuar con el pedido' : 'Ingresar para pedir'}
          </Button>
          <p className="mt-3 text-xs text-stone-500">
            El precio final se confirma al crear el pedido. Pago en efectivo o transferencia.
          </p>
        </Card>
      </div>
    </div>
  )
}
