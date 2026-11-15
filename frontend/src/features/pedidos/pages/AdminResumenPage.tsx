import { handleApiError } from '../../../shared/api/handleApiError'
import { EstadoError } from '../../../shared/components/EstadoError'
import { Skeleton } from '../../../shared/components/Skeleton'
import { formatMoneda } from '../../../shared/utils/format'
import { ResumenCard } from '../components/ResumenCard'
import { useResumenPedidos } from '../hooks/usePedidos'

export function AdminResumenPage() {
  const resumen = useResumenPedidos()

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-lg font-semibold text-stone-900">Resumen del negocio</h2>
        <p className="text-sm text-stone-500">Indicadores calculados por el servidor.</p>
      </div>

      {resumen.isPending ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} className="h-28 w-full" />
          ))}
        </div>
      ) : resumen.isError ? (
        <EstadoError
          mensaje={handleApiError(resumen.error, 'No se pudo cargar el resumen')}
          onReintentar={() => void resumen.refetch()}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <ResumenCard
            titulo="Pendientes"
            valor={resumen.data.pendientes}
            detalle="Esperando preparación"
            acento="text-amber-600"
          />
          <ResumenCard
            titulo="En preparación"
            valor={resumen.data.en_preparacion}
            detalle="En la cocina"
            acento="text-sky-600"
          />
          <ResumenCard
            titulo="Entregados"
            valor={resumen.data.entregados}
            detalle="Pedidos finalizados"
            acento="text-emerald-600"
          />
          <ResumenCard
            titulo="Cancelados"
            valor={resumen.data.cancelados}
            detalle="Con stock restituido"
            acento="text-red-600"
          />
          <ResumenCard
            titulo="Pedidos de hoy"
            valor={resumen.data.pedidos_hoy}
            detalle="Creados desde las 00:00 (UTC)"
          />
          <ResumenCard
            titulo="Ingresos"
            valor={formatMoneda(resumen.data.ingresos_entregados)}
            detalle="Suma de pedidos entregados"
            acento="text-orange-700"
          />
        </div>
      )}
    </div>
  )
}
