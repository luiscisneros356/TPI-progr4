import axios from 'axios'
import { getErrorDetail } from './handleApiError'

const baseURL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api/v1'

/**
 * Cliente HTTP único. `withCredentials` hace que el navegador adjunte la cookie
 * HttpOnly con el JWT en cada petición: el frontend nunca lee ni guarda el token.
 */
export const api = axios.create({
  baseURL,
  withCredentials: true,
})

const CUENTA_DESACTIVADA = 'Cuenta de usuario desactivada'
const RUTAS_DE_SESION = ['/auth/token', '/auth/me']

let alPerderSesion: (() => void) | null = null

/** El authStore registra aquí cómo limpiarse (evita un import circular). */
export function registrarAlPerderSesion(handler: () => void): void {
  alPerderSesion = handler
}

api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError(error) && error.response) {
      const { status, data } = error.response
      const url = error.config?.url ?? ''
      const esRutaDeSesion = RUTAS_DE_SESION.some((ruta) => url.endsWith(ruta))
      const cuentaDesactivada =
        status === 400 && getErrorDetail(data) === CUENTA_DESACTIVADA
      // 401 fuera del login y de /auth/me, o cuenta desactivada: la sesión ya no sirve.
      // ProtectedRoute redirige a /login al quedar el authStore sin usuario.
      if ((status === 401 && !esRutaDeSesion) || cuentaDesactivada) {
        alPerderSesion?.()
      }
    }
    return Promise.reject(error)
  },
)
