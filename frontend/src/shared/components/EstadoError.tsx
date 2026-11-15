import { Button } from '../ui/Button'

interface EstadoErrorProps {
  mensaje: string
  onReintentar?: () => void
}

export function EstadoError({ mensaje, onReintentar }: EstadoErrorProps) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center justify-center rounded-xl border border-red-200 bg-red-50 px-6 py-10 text-center"
    >
      <div className="mb-2 text-3xl" aria-hidden="true">
        ⚠️
      </div>
      <p className="max-w-md text-sm text-red-800">{mensaje}</p>
      {onReintentar && (
        <Button variant="secondary" size="sm" className="mt-4" onClick={onReintentar}>
          Reintentar
        </Button>
      )}
    </div>
  )
}
