import type { EstadoPedido } from '../../features/pedidos/types'
import { ETIQUETA_ESTADO } from '../utils/format'

const COLORES: Record<EstadoPedido, string> = {
  PENDIENTE: 'bg-amber-100 text-amber-800 ring-amber-200',
  EN_PREPARACION: 'bg-sky-100 text-sky-800 ring-sky-200',
  ENTREGADO: 'bg-emerald-100 text-emerald-800 ring-emerald-200',
  CANCELADO: 'bg-red-100 text-red-800 ring-red-200',
}

/** Colorea los cuatro estados del pedido. */
export function BadgeEstado({ estado }: { estado: EstadoPedido }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${COLORES[estado]}`}
    >
      {ETIQUETA_ESTADO[estado] ?? estado}
    </span>
  )
}
