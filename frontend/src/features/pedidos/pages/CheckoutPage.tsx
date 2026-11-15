import { Link } from 'react-router-dom'
import { EstadoVacio } from '../../../shared/components/EstadoVacio'
import { Card } from '../../../shared/ui/Card'
import { formatMoneda } from '../../../shared/utils/format'
import { useCartStore } from '../../../store/cartStore'
import { CheckoutForm } from '../components/CheckoutForm'

export function CheckoutPage() {
  const items = useCartStore((s) => s.items)
  const total = useCartStore((s) => s.total())

  if (items.length === 0) {
    return (
      <EstadoVacio
        titulo="No hay nada para confirmar"
        descripcion="Tu carrito está vacío. Agregá productos desde el catálogo."
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
      <h1 className="text-2xl font-bold text-stone-900">Confirmar pedido</h1>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <Card className="p-6 lg:col-span-3">
          <h2 className="mb-4 text-base font-semibold text-stone-900">Datos de entrega y pago</h2>
          <CheckoutForm />
        </Card>

        <Card className="h-fit p-6 lg:col-span-2">
          <h2 className="mb-4 text-base font-semibold text-stone-900">Tu pedido</h2>
          <ul className="flex flex-col gap-2 text-sm">
            {items.map((i) => (
              <li key={i.producto_id} className="flex justify-between gap-3">
                <span className="text-stone-700">
                  {i.cantidad} × {i.nombre}
                </span>
                <span className="font-medium">{formatMoneda(i.precio_unitario * i.cantidad)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex justify-between border-t border-stone-200 pt-3 text-base">
            <span className="font-semibold">Total</span>
            <span className="font-bold">{formatMoneda(total)}</span>
          </div>
          <Link to="/carrito" className="mt-4 inline-block text-sm text-orange-700 hover:underline">
            ← Volver al carrito
          </Link>
        </Card>
      </div>
    </div>
  )
}
