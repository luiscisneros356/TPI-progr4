import axios from 'axios'

interface ErrorDeValidacion {
  loc?: unknown
  msg?: unknown
}

/** Extrae el campo `detail` del cuerpo de una respuesta de error de la API. */
export function getErrorDetail(data: unknown): unknown {
  if (typeof data === 'object' && data !== null && 'detail' in data) {
    return (data as { detail: unknown }).detail
  }
  return undefined
}

function formatearValidacion(errores: unknown[]): string {
  const mensajes = errores.map((e) => {
    const err = e as ErrorDeValidacion
    const campo = Array.isArray(err.loc) ? String(err.loc[err.loc.length - 1] ?? '') : ''
    const msg = typeof err.msg === 'string' ? err.msg : 'valor inválido'
    return campo && campo !== 'body' ? `${campo}: ${msg}` : msg
  })
  return mensajes.join('. ')
}

/** Convierte cualquier error (Axios u otro) en un mensaje legible para la pantalla. */
export function handleApiError(error: unknown, fallback = 'Ocurrió un error inesperado'): string {
  if (axios.isAxiosError(error)) {
    if (!error.response) {
      return 'No se pudo conectar con el servidor. Verificá que el backend esté en ejecución.'
    }
    const detail = getErrorDetail(error.response.data)
    if (typeof detail === 'string') return detail
    if (Array.isArray(detail)) return formatearValidacion(detail)
    return fallback
  }
  if (error instanceof Error && error.message) return error.message
  return fallback
}
