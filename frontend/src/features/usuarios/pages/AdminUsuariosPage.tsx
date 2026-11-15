import { useMemo, useState } from 'react'
import {
  createColumnHelper,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { handleApiError } from '../../../shared/api/handleApiError'
import { DataTable } from '../../../shared/components/DataTable'
import { EstadoError } from '../../../shared/components/EstadoError'
import { Skeleton } from '../../../shared/components/Skeleton'
import { Alerta } from '../../../shared/ui/Alerta'
import { Button } from '../../../shared/ui/Button'
import { formatFecha } from '../../../shared/utils/format'
import { useAuthStore } from '../../../store/authStore'
import type { Usuario } from '../../auth/types'
import { useActivarUsuario, useDesactivarUsuario, useUsuarios } from '../hooks/useUsuarios'

const columnHelper = createColumnHelper<Usuario>()

export function AdminUsuariosPage() {
  const usuarios = useUsuarios()
  const activar = useActivarUsuario()
  const desactivar = useDesactivarUsuario()
  const usuarioSesion = useAuthStore((s) => s.usuario)

  const [error, setError] = useState<string | null>(null)
  const [enCurso, setEnCurso] = useState<number | null>(null)

  const cambiarEstado = async (usuario: Usuario) => {
    setError(null)
    setEnCurso(usuario.id)
    try {
      if (usuario.disabled) await activar.mutateAsync(usuario.id)
      else await desactivar.mutateAsync(usuario.id)
    } catch (e) {
      setError(handleApiError(e, 'No se pudo cambiar el estado del usuario'))
    } finally {
      setEnCurso(null)
    }
  }

  const sesionId = usuarioSesion?.id

  const columns = useMemo(
    () => [
      columnHelper.accessor('username', {
        header: 'Usuario',
        cell: (info) => <span className="font-medium text-stone-900">{info.getValue()}</span>,
      }),
      columnHelper.accessor('full_name', { header: 'Nombre' }),
      columnHelper.accessor('email', { header: 'Email' }),
      columnHelper.accessor('role', {
        header: 'Rol',
        cell: (info) => (
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-medium ${
              info.getValue() === 'admin'
                ? 'bg-violet-100 text-violet-800'
                : 'bg-stone-100 text-stone-700'
            }`}
          >
            {info.getValue() === 'admin' ? 'Administrador' : 'Cliente'}
          </span>
        ),
      }),
      columnHelper.accessor('disabled', {
        header: 'Estado',
        cell: (info) =>
          info.getValue() ? (
            <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800">
              Desactivado
            </span>
          ) : (
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800">
              Activo
            </span>
          ),
      }),
      columnHelper.accessor('created_at', {
        header: 'Alta',
        cell: (info) => formatFecha(info.getValue()),
      }),
      columnHelper.display({
        id: 'acciones',
        header: 'Acciones',
        cell: ({ row }) => {
          const u = row.original
          if (u.disabled) {
            return (
              <Button
                size="sm"
                variant="secondary"
                loading={enCurso === u.id}
                onClick={() => void cambiarEstado(u)}
              >
                Activar
              </Button>
            )
          }
          // El botón Desactivar no se muestra en la fila del usuario de la sesión.
          if (u.id === sesionId) {
            return <span className="text-xs text-stone-400">Tu cuenta</span>
          }
          return (
            <Button
              size="sm"
              variant="danger"
              loading={enCurso === u.id}
              onClick={() => void cambiarEstado(u)}
            >
              Desactivar
            </Button>
          )
        },
      }),
    ],
    // cambiarEstado se recrea en cada render; las dependencias relevantes son estas.
    [enCurso, sesionId],
  )

  const table = useReactTable({
    data: usuarios.data ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } },
  })

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-lg font-semibold text-stone-900">Usuarios</h2>
        <p className="text-sm text-stone-500">
          Los usuarios desactivados no pueden iniciar sesión ni operar.
        </p>
      </div>

      {error && (
        <Alerta onCerrar={() => setError(null)}>{error}</Alerta>
      )}

      {usuarios.isPending ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 5 }, (_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : usuarios.isError ? (
        <EstadoError
          mensaje={handleApiError(usuarios.error, 'No se pudieron cargar los usuarios')}
          onReintentar={() => void usuarios.refetch()}
        />
      ) : (
        <DataTable table={table} mensajeVacio="No hay usuarios." />
      )}
    </div>
  )
}
