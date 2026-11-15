import { Button } from '../ui/Button'

interface PaginacionProps {
  /** Página actual, empezando en 1. */
  pagina: number
  totalPaginas: number
  total: number
  onCambiar: (pagina: number) => void
}

export function Paginacion({ pagina, totalPaginas, total, onCambiar }: PaginacionProps) {
  if (totalPaginas <= 1) {
    return <p className="text-xs text-stone-500">{total} resultado(s)</p>
  }
  return (
    <nav
      aria-label="Paginación"
      className="flex flex-wrap items-center justify-between gap-3"
    >
      <p className="text-xs text-stone-500">
        Página {pagina} de {totalPaginas} · {total} resultado(s)
      </p>
      <div className="flex gap-2">
        <Button
          variant="secondary"
          size="sm"
          disabled={pagina <= 1}
          onClick={() => onCambiar(pagina - 1)}
        >
          ← Anterior
        </Button>
        <Button
          variant="secondary"
          size="sm"
          disabled={pagina >= totalPaginas}
          onClick={() => onCambiar(pagina + 1)}
        >
          Siguiente →
        </Button>
      </div>
    </nav>
  )
}
