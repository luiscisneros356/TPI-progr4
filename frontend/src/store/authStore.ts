import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  loginRequest,
  logoutRequest,
  meRequest,
} from '../features/auth/api/auth'
import type { Usuario } from '../features/auth/types'
import { registrarAlPerderSesion } from '../shared/api/axiosInstance'
import { queryClient } from '../shared/api/queryClient'

interface AuthState {
  usuario: Usuario | null
  /** true mientras checkSession confirma la sesión con el backend. */
  cargando: boolean
  login: (username: string, password: string) => Promise<Usuario>
  logout: () => Promise<void>
  checkSession: () => Promise<void>
  /** Limpia la sesión local (sin llamar al backend). */
  clear: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      usuario: null,
      cargando: true,

      login: async (username, password) => {
        await loginRequest(username, password)
        const usuario = await meRequest()
        set({ usuario })
        return usuario
      },

      logout: async () => {
        try {
          await logoutRequest()
        } finally {
          set({ usuario: null })
          // Los datos en caché (pedidos, etc.) pertenecen al usuario anterior.
          queryClient.clear()
        }
      },

      checkSession: async () => {
        set({ cargando: true })
        try {
          const usuario = await meRequest()
          set({ usuario })
        } catch {
          set({ usuario: null })
        } finally {
          set({ cargando: false })
        }
      },

      clear: () => {
        set({ usuario: null })
        queryClient.clear()
      },
    }),
    {
      name: 'foodstore-auth',
      // Solo se guarda el usuario (nombre, email y rol). Nunca el token: viaja en la cookie.
      partialize: (state) => ({ usuario: state.usuario }),
    },
  ),
)

registrarAlPerderSesion(() => useAuthStore.getState().clear())
