import { useMemo, useState } from 'react'
import {
  createColumnHelper,
  getCoreRowModel,
  getFilteredRowModel,
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
import { Input } from '../../../shared/ui/Input'
import { Modal } from '../../../shared/ui/Modal'
import { formatMoneda } from '../../../shared/utils/format'
import { useCategorias } from '../../categorias/hooks/useCategorias'
import { ProductoForm } from '../components/ProductoForm'
import { StockForm } from '../components/StockForm'
import { useEliminarProducto, useProductos } from '../hooks/useProductos'
import type { Producto } from '../types'

const columnHelper = createColumnHelper<Producto>()

type Dialogo =
  | { tipo: 'form'; producto?: Producto }
  | { tipo: 'stock'; producto: Producto }
  | { tipo: 'eliminar'; producto: Producto }
  | null

export function AdminProductosPage() {
  // El panel pide la cantidad máxima permitida (100) y pagina del lado del cliente.
  const productos = useProductos({ skip: 0, limit: 100 })
  const categorias = useCategorias()
  const eliminar = useEliminarProducto()

  const [dialogo, setDialogo] = useState<Dialogo>(null)
  const [filtro, setFiltro] = useState('')
  const [mensaje, setMensaje] = useState<{ tipo: 'error' | 'exito'; texto: string } | null>(null)

  const cerrar = () => setDialogo(null)

  const confirmarEliminar = async () => {
    if (dialogo?.tipo !== 'eliminar') return
    const { producto } = dialogo
    try {
      await eliminar.mutateAsync(producto.id)
      setMensaje({ tipo: 'exito', texto: `Producto «${producto.nombre}» dado de baja.` })
    } catch (error) {
      setMensaje({ tipo: 'error', texto: handleApiError(error, 'No se pudo dar de baja') })
    } finally {
      cerrar()
    }
  }

  const columns = useMemo(
    () => [
      columnHelper.accessor('id', { header: 'ID' }),
      columnHelper.accessor('nombre', {
        header: 'Nombre',
        cell: (info) => <span className="font-medium text-stone-900">{info.getValue()}</span>,
      }),
      columnHelper.accessor((p) => p.categoria.nombre, {
        id: 'categoria',
        header: 'Categoría',
      }),
      columnHelper.accessor('precio_base', {
        header: 'Precio',
        cell: (info) => formatMoneda(info.getValue()),
      }),
      columnHelper.accessor('stock', {
        header: 'Stock',
        cell: (info) => (
          <span className={info.getValue() === 0 ? 'font-semibold text-red-600' : ''}>
            {info.getValue()}
          </span>
        ),
      }),
      columnHelper.accessor('disponible', {
        header: 'Disponible',
        cell: (info) =>
          info.getValue() ? (
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800">
              Sí
            </span>
          ) : (
            <span className="rounded-full bg-stone-200 px-2 py-0.5 text-xs font-medium text-stone-700">
              No
            </span>
          ),
      }),
      columnHelper.display({
        id: 'acciones',
        header: 'Acciones',
        cell: ({ row }) => (
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setDialogo({ tipo: 'form', producto: row.original })}
            >
              Editar
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setDialogo({ tipo: 'stock', producto: row.original })}
            >
              Stock
            </Button>
            <Button
              size="sm"
              variant="danger"
              onClick={() => setDialogo({ tipo: 'eliminar', producto: row.original })}
            >
              Dar de baja
            </Button>
          </div>
        ),
      }),
    ],
    [],
  )

  const table = useReactTable({
    data: productos.data?.items ?? [],
    columns,
    state: { globalFilter: filtro },
    onGlobalFilterChange: setFiltro,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } },
  })

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-stone-900">Productos</h2>
          <p className="text-sm text-stone-500">
            Alta, edición, stock, disponibilidad y baja lógica.
          </p>
        </div>
        <Button
          onClick={() => setDialogo({ tipo: 'form' })}
          disabled={!categorias.data || categorias.data.length === 0}
        >
          + Nuevo producto
        </Button>
      </div>

      {categorias.data && categorias.data.length === 0 && (
        <Alerta tipo="info">Creá al menos una categoría antes de cargar productos.</Alerta>
      )}

      {mensaje && (
        <Alerta tipo={mensaje.tipo} onCerrar={() => setMensaje(null)}>
          {mensaje.texto}
        </Alerta>
      )}

      <div className="max-w-sm">
        <Input
          type="search"
          placeholder="Filtrar la tabla…"
          aria-label="Filtrar productos"
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
        />
      </div>

      {productos.isPending ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : productos.isError ? (
        <EstadoError
          mensaje={handleApiError(productos.error, 'No se pudieron cargar los productos')}
          onReintentar={() => void productos.refetch()}
        />
      ) : (
        <DataTable table={table} mensajeVacio="No hay productos que coincidan." />
      )}

      <Modal
        open={dialogo?.tipo === 'form'}
        title={dialogo?.tipo === 'form' && dialogo.producto ? 'Editar producto' : 'Nuevo producto'}
        onClose={cerrar}
        size="lg"
      >
        {dialogo?.tipo === 'form' && (
          <ProductoForm
            key={dialogo.producto?.id ?? 'nuevo'}
            producto={dialogo.producto}
            categorias={categorias.data ?? []}
            onListo={cerrar}
            onCancelar={cerrar}
          />
        )}
      </Modal>

      <Modal open={dialogo?.tipo === 'stock'} title="Stock y disponibilidad" onClose={cerrar}>
        {dialogo?.tipo === 'stock' && (
          <StockForm
            key={dialogo.producto.id}
            producto={dialogo.producto}
            onListo={cerrar}
            onCancelar={cerrar}
          />
        )}
      </Modal>

      <ConfirmDialog
        open={dialogo?.tipo === 'eliminar'}
        titulo="Dar de baja el producto"
        mensaje={`«${dialogo?.tipo === 'eliminar' ? dialogo.producto.nombre : ''}» dejará de mostrarse en el catálogo. Los pedidos ya realizados conservan sus datos.`}
        textoConfirmar="Dar de baja"
        cargando={eliminar.isPending}
        onConfirmar={() => void confirmarEliminar()}
        onCancelar={cerrar}
      />
    </div>
  )
}
