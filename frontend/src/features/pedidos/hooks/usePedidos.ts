import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { useAuthStore } from '../../../store/authStore'
import { listarPedidos, obtenerResumen } from '../api/pedidos'
import type { FiltrosPedidos } from '../types'

/** Pedidos propios (user) o todos (admin): lo decide el backend según el rol. */
export function usePedidos(filtros: FiltrosPedidos) {
  const usuarioId = useAuthStore((s) => s.usuario?.id)
  return useQuery({
    // El id del usuario en la clave evita mezclar cachés entre sesiones distintas.
    queryKey: ['pedidos', 'lista', usuarioId, filtros],
    queryFn: () => listarPedidos(filtros),
    placeholderData: keepPreviousData,
  })
}

export function useResumenPedidos() {
  return useQuery({ queryKey: ['pedidos', 'resumen'], queryFn: obtenerResumen })
}
