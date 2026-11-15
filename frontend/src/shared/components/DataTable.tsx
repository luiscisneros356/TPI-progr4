import { flexRender } from '@tanstack/react-table'
import type { Table } from '@tanstack/react-table'
import { Button } from '../ui/Button'

interface DataTableProps<T> {
  /** Tabla creada con useReactTable en la pantalla que la usa. */
  table: Table<T>
  mensajeVacio?: string
}

/** Render genérico de una tabla de TanStack Table con paginación del lado del cliente. */
export function DataTable<T>({ table, mensajeVacio = 'No hay datos para mostrar' }: DataTableProps<T>) {
  const filas = table.getRowModel().rows
  const totalFiltradas = table.getFilteredRowModel().rows.length
  const { pageIndex, pageSize } = table.getState().pagination

  return (
    <div className="overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-stone-200 text-sm">
          <thead className="bg-stone-50">
            {table.getHeaderGroups().map((grupo) => (
              <tr key={grupo.id}>
                {grupo.headers.map((header) => (
                  <th
                    key={header.id}
                    scope="col"
                    className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-stone-500"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-stone-100">
            {filas.length === 0 ? (
              <tr>
                <td
                  colSpan={table.getAllLeafColumns().length}
                  className="px-4 py-10 text-center text-stone-500"
                >
                  {mensajeVacio}
                </td>
              </tr>
            ) : (
              filas.map((fila) => (
                <tr key={fila.id} className="hover:bg-stone-50">
                  {fila.getVisibleCells().map((celda) => (
                    <td key={celda.id} className="px-4 py-3 align-middle text-stone-700">
                      {flexRender(celda.column.columnDef.cell, celda.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-stone-200 bg-stone-50 px-4 py-2.5">
        <p className="text-xs text-stone-500">
          {totalFiltradas === 0
            ? '0 resultados'
            : `${pageIndex * pageSize + 1}–${Math.min((pageIndex + 1) * pageSize, totalFiltradas)} de ${totalFiltradas}`}
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            ← Anterior
          </Button>
          <span className="text-xs text-stone-500">
            {table.getPageCount() === 0 ? 0 : pageIndex + 1} / {table.getPageCount()}
          </span>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Siguiente →
          </Button>
        </div>
      </div>
    </div>
  )
}
