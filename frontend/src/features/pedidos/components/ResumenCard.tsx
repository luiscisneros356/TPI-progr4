import type { ReactNode } from 'react'
import { Card } from '../../../shared/ui/Card'

interface ResumenCardProps {
  titulo: string
  valor: ReactNode
  detalle?: string
  /** Clases de color para el valor, por ejemplo "text-amber-600". */
  acento?: string
}

/** Tarjeta con un indicador del resumen del panel. */
export function ResumenCard({ titulo, valor, detalle, acento = 'text-stone-900' }: ResumenCardProps) {
  return (
    <Card className="p-5">
      <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">{titulo}</p>
      <p className={`mt-2 text-3xl font-bold ${acento}`}>{valor}</p>
      {detalle && <p className="mt-1 text-xs text-stone-500">{detalle}</p>}
    </Card>
  )
}
