import type { ReactNode } from 'react'

interface AlertaProps {
  tipo?: 'error' | 'exito' | 'info'
  children: ReactNode
  onCerrar?: () => void
}

const ESTILOS = {
  error: 'bg-red-50 text-red-700 border-red-200',
  exito: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  info: 'bg-sky-50 text-sky-700 border-sky-200',
}

export function Alerta({ tipo = 'error', children, onCerrar }: AlertaProps) {
  return (
    <div
      role={tipo === 'error' ? 'alert' : 'status'}
      className={`flex items-start justify-between gap-3 rounded-lg border px-3 py-2 text-sm ${ESTILOS[tipo]}`}
    >
      <span>{children}</span>
      {onCerrar && (
        <button
          type="button"
          onClick={onCerrar}
          aria-label="Cerrar mensaje"
          className="shrink-0 opacity-60 hover:opacity-100"
        >
          ✕
        </button>
      )}
    </div>
  )
}
