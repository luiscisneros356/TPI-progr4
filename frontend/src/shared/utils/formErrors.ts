/** Convierte la lista de errores de un campo de TanStack Form en un texto. */
export function fieldError(errors: ReadonlyArray<unknown>): string | undefined {
  const mensajes = errors
    .map((e) => {
      if (typeof e === 'string') return e
      if (typeof e === 'object' && e !== null && 'message' in e) {
        return String((e as { message: unknown }).message)
      }
      return undefined
    })
    .filter((m): m is string => Boolean(m))
  return mensajes.length > 0 ? mensajes.join(', ') : undefined
}
