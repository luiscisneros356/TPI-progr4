import { BadgeEstado } from '../../../shared/ui/BadgeEstado'
import { ETIQUETA_PAGO, formatFecha, formatMoneda } from '../../../shared/utils/format'
import type { Pedido } from '../types'

/** Detalle de un pedido: datos de entrega y líneas (copia inmutable de nombre y precio). */
export function PedidoDetalle({ pedido }: { pedido: Pedido }) {
  return (
    <div className="flex flex-col gap-4">
      <dl className="grid grid-cols-1 gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-xs uppercase tracking-wide text-stone-500">Estado</dt>
          <dd className="mt-0.5">
            <BadgeEstado estado={pedido.estado} />
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-stone-500">Forma de pago</dt>
          <dd className="mt-0.5 text-stone-800">
            {ETIQUETA_PAGO[pedido.forma_pago] ?? pedido.forma_pago}
          </dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="text-xs uppercase tracking-wide text-stone-500">Dirección de entrega</dt>
          <dd className="mt-0.5 text-stone-800">{pedido.direccion_entrega}</dd>
        </div>
        {pedido.notas && (
          <div className="sm:col-span-2">
            <dt className="text-xs uppercase tracking-wide text-stone-500">Notas</dt>
            <dd className="mt-0.5 text-stone-800">{pedido.notas}</dd>
          </div>
        )}
        <div>
          <dt className="text-xs uppercase tracking-wide text-stone-500">Creado</dt>
          <dd className="mt-0.5 text-stone-800">{formatFecha(pedido.created_at)}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-stone-500">Última actualización</dt>
          <dd className="mt-0.5 text-stone-800">{formatFecha(pedido.updated_at)}</dd>
        </div>
      </dl>

      <div className="overflow-x-auto rounded-lg border border-stone-200">
        <table className="min-w-full divide-y divide-stone-200 text-sm">
          <thead className="bg-stone-50 text-xs uppercase tracking-wide text-stone-500">
            <tr>
              <th className="px-3 py-2 text-left font-semibold">Producto</th>
              <th className="px-3 py-2 text-right font-semibold">Precio</th>
              <th className="px-3 py-2 text-right font-semibold">Cant.</th>
              <th className="px-3 py-2 text-right font-semibold">Subtotal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {pedido.items.map((item) => (
              <tr key={item.producto_id}>
                <td className="px-3 py-2 text-stone-800">{item.nombre_producto}</td>
                <td className="px-3 py-2 text-right">{formatMoneda(item.precio_unitario)}</td>
                <td className="px-3 py-2 text-right">{item.cantidad}</td>
                <td className="px-3 py-2 text-right font-medium">{formatMoneda(item.subtotal)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-stone-50">
              <td colSpan={3} className="px-3 py-2 text-right text-sm font-semibold text-stone-700">
                Total
              </td>
              <td className="px-3 py-2 text-right text-base font-bold text-stone-900">
                {formatMoneda(pedido.total)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}
