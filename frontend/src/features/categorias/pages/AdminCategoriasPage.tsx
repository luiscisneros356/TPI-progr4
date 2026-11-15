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
import { Button } from '../../../shared/ui/Button'
import { Modal } from '../../../shared/ui/Modal'
import { CategoriaForm } from '../components/CategoriaForm'
import { useCategorias, useEliminarCategoria } from '../hooks/useCategorias'
import type { Categoria } from '../types'

const columnHelper = createColumnHelper<Categoria>()

export function AdminCategoriasPage() {
  const categorias = useCategorias()
  const eliminar = useEliminarCategoria()

  const [formAbierto, setFormAbierto] = useState(false)
  const [editando, setEditando] = useState<Categoria | undefined>(undefined)
  const [aEliminar, setAEliminar] = useState<Categoria | null>(null)
  const [mensaje, setMensaje] = useState<{ tipo: 'error' | 'exito'; texto: string } | null>(null)

  const abrirNueva = () => {
    setEditando(undefined)
    setFormAbierto(true)
  }
  const abrirEdicion = (c: Categoria) => {
    setEditando(c)
    setFormAbierto(true)
  }
  const cerrarForm = () => setFormAbierto(false)

  const confirmarEliminar = async () => {
    if (!aEliminar) return
    try {
      await eliminar.mutateAsync(aEliminar.id)
      setMensaje({ tipo: 'exito', texto: `Categoría «${aEliminar.nombre}» dada de baja.` })
    } catch (error) {
      setMensaje({ tipo: 'error', texto: handleApiError(error, 'No se pudo dar de baja') })
    } finally {
      setAEliminar(null)
    }
  }

  const columns = useMemo(
    () => [
      columnHelper.accessor('id', { header: 'ID' }),
      columnHelper.accessor('nombre', {
        header: 'Nombre',
        cell: (info) => <span className="font-medium text-stone-900">{info.getValue()}</span>,
      }),
      columnHelper.accessor('descripcion', {
        header: 'Descripción',
        cell: (info) => info.getValue() ?? <span className="text-stone-400">—</span>,
      }),
      columnHelper.display({
        id: 'acciones',
        header: 'Acciones',
        cell: ({ row }) => (
          <div className="flex gap-2">
            <Button size="sm" variant="secondary" onClick={() => abrirEdicion(row.original)}>
              Editar
            </Button>
            <Button size="sm" variant="danger" onClick={() => setAEliminar(row.original)}>
              Dar de baja
            </Button>
          </div>
        ),
      }),
    ],
    [],
  )

  const table = useReactTable({
    data: categorias.data ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } },
  })

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-stone-900">Categorías</h2>
          <p className="text-sm text-stone-500">Alta, edición y baja lógica de categorías.</p>
        </div>
        <Button onClick={abrirNueva}>+ Nueva categoría</Button>
      </div>

      {mensaje && (
        <Alerta tipo={mensaje.tipo} onCerrar={() => setMensaje(null)}>
          {mensaje.texto}
        </Alerta>
      )}

      {categorias.isPending ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 5 }, (_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : categorias.isError ? (
        <EstadoError
          mensaje={handleApiError(categorias.error, 'No se pudieron cargar las categorías')}
          onReintentar={() => void categorias.refetch()}
        />
      ) : (
        <DataTable table={table} mensajeVacio="Todavía no hay categorías." />
      )}

      <Modal
        open={formAbierto}
        title={editando ? 'Editar categoría' : 'Nueva categoría'}
        onClose={cerrarForm}
      >
        <CategoriaForm
          key={editando?.id ?? 'nueva'}
          categoria={editando}
          onListo={cerrarForm}
          onCancelar={cerrarForm}
        />
      </Modal>

      <ConfirmDialog
        open={aEliminar !== null}
        titulo="Dar de baja la categoría"
        mensaje={`Se dará de baja «${aEliminar?.nombre ?? ''}». La baja no libera el nombre ni oculta sus productos: para retirarla del catálogo, dalos de baja también.`}
        textoConfirmar="Dar de baja"
        cargando={eliminar.isPending}
        onConfirmar={() => void confirmarEliminar()}
        onCancelar={() => setAEliminar(null)}
      />
    </div>
  )
}
