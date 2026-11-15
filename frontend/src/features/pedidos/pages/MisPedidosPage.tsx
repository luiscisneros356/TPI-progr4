import { useState } from 'react'
import { Link } from 'react-router-dom'
import { handleApiError } from '../../../shared/api/handleApiError'
import { ConfirmDialog } from '../../../shared/components/ConfirmDialog'
import { EstadoError } from '../../../shared/components/EstadoError'
import { EstadoVacio } from '../../../shared/components/EstadoVacio'
import { Paginacion } from '../../../shared/components/Paginacion'
import { Skeleton } from '../../../shared/components/Skeleton'
import { Alerta } from '../../../shared/ui/Alerta'
import { BadgeEstado } from '../../../shared/ui/BadgeEstado'
import { Button } from '../../../shared/ui/Button'
import { Card } from '../../../shared/ui/Card'
import { formatFecha, formatMoneda } from '../../../shared/utils/format'
import { PedidoDetalle } from '../components/PedidoDetalle'
import { useCancelarPedido } from '../hooks/usePedidoMutations'
import { usePedidos } from '../hooks/usePedidos'
import type { Pedido } from '../types'

const POR_PAGINA = 10

export function MisPedidosPage() {
  const [pagina, setPagina] = useState(1)
  const [abierto, setAbierto] = useState<number | null>(null)
  const [aCancelar, setACancelar] = useState<Pedido | null>(null)
  const [mensaje, setMensaje] = useState<{ tipo: 'error' | 'exito'; texto: string } | null>(null)

  const pedidos = usePedidos({ skip: (pagina - 1) * POR_PAGINA, limit: POR_PAGINA })
  const cancelar = useCancelarPedido()

  const confirmarCancelacion = async () => {
    if (!aCancelar) return
    try {
      await cancelar.mutateAsync(aCancelar.id)
      setMensaje({
        tipo: 'exito',
        texto: `Pedido #${aCancelar.id} cancelado. El stock fue restituido.`,
      })
    } catch (error) {
      setMensaje({ tipo: 'error', texto: handleApiError(error, 'No se pudo cancelar el pedido') })
    } finally {
      setACancelar(null)
    }
  }

  const totalPaginas = pedidos.data ? Math.max(1, Math.ceil(pedidos.data.total / POR_PAGINA)) : 1

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">Mis pedidos</h1>
        <p className="text-sm text-stone-500">
          Solo podés cancelar un pedido mientras está pendiente.
        </p>
      </div>

      {mensaje && (
        <Alerta tipo={mensaje.tipo} onCerrar={() => setMensaje(null)}>
          {mensaje.texto}
        </Alerta>
      )}

      {pedidos.isPending ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }, (_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      ) : pedidos.isError ? (
        <EstadoError
          mensaje={handleApiError(pedidos.error, 'No se pudieron cargar tus pedidos')}
          onReintentar={() => void pedidos.refetch()}
        />
      ) : pedidos.data.items.length === 0 ? (
        <EstadoVacio
          titulo="Todavía no hiciste pedidos"
          descripcion="Cuando confirmes uno, lo vas a ver acá."
          accion={
            <Link
              to="/"
              className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700"
            >
              Ir al catálogo
            </Link>
          }
        />
      ) : (
        <>
          <div className={`flex flex-col gap-3 ${pedidos.isFetching ? 'opacity-60' : ''}`}>
            {pedidos.data.items.map((pedido) => {
              const expandido = abierto === pedido.id
              return (
                <Card key={pedido.id} className="p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-stone-900">Pedido #{pedido.id}</p>
                      <p className="text-xs text-stone-500">{formatFecha(pedido.created_at)}</p>
                    </div>
                    <BadgeEstado estado={pedido.estado} />
                    <p className="text-lg font-bold text-stone-900">{formatMoneda(pedido.total)}</p>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        aria-expanded={expandido}
                        onClick={() => setAbierto(expandido ? null : pedido.id)}
                      >
                        {expandido ? 'Ocultar detalle' : 'Ver detalle'}
                      </Button>
                      {pedido.estado === 'PENDIENTE' && (
                        <Button size="sm" variant="danger" onClick={() => setACancelar(pedido)}>
                          Cancelar
                        </Button>
                      )}
                    </div>
                  </div>
                  {expandido && (
                    <div className="mt-4 border-t border-stone-200 pt-4">
                      <PedidoDetalle pedido={pedido} />
                    </div>
                  )}
                </Card>
              )
            })}
          </div>
          <Paginacion
            pagina={pagina}
            totalPaginas={totalPaginas}
            total={pedidos.data.total}
            onCambiar={setPagina}
          />
        </>
      )}

      <ConfirmDialog
        open={aCancelar !== null}
        titulo="Cancelar pedido"
        mensaje={`¿Cancelar el pedido #${aCancelar?.id ?? ''}? Esta acción no se puede deshacer.`}
        textoConfirmar="Cancelar pedido"
        cargando={cancelar.isPending}
        onConfirmar={() => void confirmarCancelacion()}
        onCancelar={() => setACancelar(null)}
      />
    </div>
  )
}
