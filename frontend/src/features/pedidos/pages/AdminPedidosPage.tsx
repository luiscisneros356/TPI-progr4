import { useMemo, useState } from 'react'
import {
  createColumnHelper,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { handleApiError } from '../../../shared/api/handleApiError'
import { ConfirmDialog } from '../../../shared/components/ConfirmDialog'
import { DataTable } from '../../../shared/components/DataTable'
import { EstadoError } from '../../../shared/components/EstadoError'
import { Skeleton } from '../../../shared/components/Skeleton'
import { Alerta } from '../../../shared/ui/Alerta'
import { BadgeEstado } from '../../../shared/ui/BadgeEstado'
import { Button } from '../../../shared/ui/Button'
import { Modal } from '../../../shared/ui/Modal'
import { Select } from '../../../shared/ui/Input'
import {
  ETIQUETA_ESTADO,
  ETIQUETA_PAGO,
  formatFecha,
  formatMoneda,
} from '../../../shared/utils/format'
import { PedidoDetalle } from '../components/PedidoDetalle'
import { useCambiarEstadoPedido } from '../hooks/usePedidoMutations'
import { usePedidos } from '../hooks/usePedidos'
import { ESTADOS_PEDIDO, TRANSICIONES } from '../types'
import type { EstadoPedido, Pedido } from '../types'

const columnHelper = createColumnHelper<Pedido>()

const TEXTO_ACCION: Record<EstadoPedido, string> = {
  PENDIENTE: 'Pendiente',
  EN_PREPARACION: 'Pasar a preparación',
  ENTREGADO: 'Marcar entregado',
  CANCELADO: 'Cancelar',
}

function esEstado(valor: string): valor is EstadoPedido {
  return ESTADOS_PEDIDO.some((e) => e === valor)
}

export function AdminPedidosPage() {
  const [filtroEstado, setFiltroEstado] = useState<EstadoPedido | undefined>(undefined)
  const [detalle, setDetalle] = useState<Pedido | null>(null)
  const [aCancelar, setACancelar] = useState<Pedido | null>(null)
  const [enCurso, setEnCurso] = useState<number | null>(null)
  const [mensaje, setMensaje] = useState<{ tipo: 'error' | 'exito'; texto: string } | null>(null)

  // El panel pide el máximo permitido (100) y pagina del lado del cliente.
  const pedidos = usePedidos({ skip: 0, limit: 100, estado: filtroEstado })
  const cambiarEstado = useCambiarEstadoPedido()

  const aplicarEstado = async (pedido: Pedido, estado: EstadoPedido) => {
    setMensaje(null)
    setEnCurso(pedido.id)
    try {
      await cambiarEstado.mutateAsync({ id: pedido.id, estado })
      setMensaje({
        tipo: 'exito',
        texto: `Pedido #${pedido.id}: ${ETIQUETA_ESTADO[pedido.estado]} → ${ETIQUETA_ESTADO[estado]}.`,
      })
    } catch (error) {
      setMensaje({ tipo: 'error', texto: handleApiError(error, 'No se pudo cambiar el estado') })
    } finally {
      setEnCurso(null)
      setACancelar(null)
    }
  }

  const columns = useMemo(
    () => [
      columnHelper.accessor('id', {
        header: '#',
        cell: (info) => <span className="font-semibold text-stone-900">#{info.getValue()}</span>,
      }),
      columnHelper.accessor('created_at', {
        header: 'Fecha',
        cell: (info) => formatFecha(info.getValue()),
      }),
      columnHelper.accessor('usuario_id', {
        header: 'Cliente',
        cell: (info) => `Usuario ${info.getValue()}`,
      }),
      columnHelper.accessor('estado', {
        header: 'Estado',
        cell: (info) => <BadgeEstado estado={info.getValue()} />,
      }),
      columnHelper.accessor('forma_pago', {
        header: 'Pago',
        cell: (info) => ETIQUETA_PAGO[info.getValue()] ?? info.getValue(),
      }),
      columnHelper.accessor('total', {
        header: 'Total',
        cell: (info) => <span className="font-medium">{formatMoneda(info.getValue())}</span>,
      }),
      columnHelper.display({
        id: 'acciones',
        header: 'Acciones',
        cell: ({ row }) => {
          const pedido = row.original
          const siguientes = TRANSICIONES[pedido.estado]
          return (
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="secondary" onClick={() => setDetalle(pedido)}>
                Ver
              </Button>
              {siguientes.map((destino) =>
                destino === 'CANCELADO' ? (
                  <Button
                    key={destino}
                    size="sm"
                    variant="danger"
                    disabled={enCurso === pedido.id}
                    onClick={() => setACancelar(pedido)}
                  >
                    {TEXTO_ACCION[destino]}
                  </Button>
                ) : (
                  <Button
                    key={destino}
                    size="sm"
                    loading={enCurso === pedido.id}
                    onClick={() => void aplicarEstado(pedido, destino)}
                  >
                    {TEXTO_ACCION[destino]}
                  </Button>
                ),
              )}
            </div>
          )
        },
      }),
    ],
    // aplicarEstado solo usa setters y mutateAsync (estables); lo que cambia es enCurso.
    [enCurso],
  )

  const table = useReactTable({
    data: pedidos.data?.items ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } },
  })

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-stone-900">Pedidos</h2>
          <p className="text-sm text-stone-500">
            Avanzá o cancelá pedidos según la máquina de estados.
          </p>
        </div>
        <div className="w-56">
          <Select
            label="Filtrar por estado"
            value={filtroEstado ?? ''}
            onChange={(e) => {
              const valor = e.target.value
              setFiltroEstado(esEstado(valor) ? valor : undefined)
              table.setPageIndex(0)
            }}
          >
            <option value="">Todos</option>
            {ESTADOS_PEDIDO.map((e) => (
              <option key={e} value={e}>
                {ETIQUETA_ESTADO[e]}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {mensaje && (
        <Alerta tipo={mensaje.tipo} onCerrar={() => setMensaje(null)}>
          {mensaje.texto}
        </Alerta>
      )}

      {pedidos.isPending ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : pedidos.isError ? (
        <EstadoError
          mensaje={handleApiError(pedidos.error, 'No se pudieron cargar los pedidos')}
          onReintentar={() => void pedidos.refetch()}
        />
      ) : (
        <DataTable table={table} mensajeVacio="No hay pedidos con ese filtro." />
      )}

      <Modal
        open={detalle !== null}
        title={detalle ? `Pedido #${detalle.id}` : 'Pedido'}
        onClose={() => setDetalle(null)}
        size="lg"
      >
        {detalle && <PedidoDetalle pedido={detalle} />}
      </Modal>

      <ConfirmDialog
        open={aCancelar !== null}
        titulo="Cancelar pedido"
        mensaje={`¿Cancelar el pedido #${aCancelar?.id ?? ''}? El stock de sus líneas se restituirá y el estado CANCELADO es terminal.`}
        textoConfirmar="Cancelar pedido"
        cargando={cambiarEstado.isPending}
        onConfirmar={() => {
          if (aCancelar) void aplicarEstado(aCancelar, 'CANCELADO')
        }}
        onCancelar={() => setACancelar(null)}
      />
    </div>
  )
}
