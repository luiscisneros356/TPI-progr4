import { useRef, useState } from 'react'
import { EstadoError } from '../../../shared/components/EstadoError'
import { EstadoVacio } from '../../../shared/components/EstadoVacio'
import { Paginacion } from '../../../shared/components/Paginacion'
import { handleApiError } from '../../../shared/api/handleApiError'
import { Button } from '../../../shared/ui/Button'
import { Input } from '../../../shared/ui/Input'
import { useCategorias } from '../../categorias/hooks/useCategorias'
import { ProductoCard, ProductoCardSkeleton } from '../components/ProductoCard'
import { useProductos } from '../hooks/useProductos'

const POR_PAGINA = 12

export function CatalogoPage() {
  const [pagina, setPagina] = useState(1)
  const [textoBusqueda, setTextoBusqueda] = useState('')
  const [search, setSearch] = useState('')
  const [categoriaId, setCategoriaId] = useState<number | undefined>(undefined)
  const temporizador = useRef<number | undefined>(undefined)

  const categorias = useCategorias()
  const productos = useProductos({
    // Paginación en el servidor: skip = (página − 1) × limit.
    skip: (pagina - 1) * POR_PAGINA,
    limit: POR_PAGINA,
    search: search || undefined,
    categoria_id: categoriaId,
  })

  const alEscribir = (valor: string) => {
    setTextoBusqueda(valor)
    // Espera a que el usuario deje de escribir antes de consultar al servidor.
    window.clearTimeout(temporizador.current)
    temporizador.current = window.setTimeout(() => {
      setSearch(valor.trim())
      setPagina(1)
    }, 400)
  }

  const elegirCategoria = (id: number | undefined) => {
    setCategoriaId(id)
    setPagina(1)
  }

  const limpiarFiltros = () => {
    window.clearTimeout(temporizador.current)
    setTextoBusqueda('')
    setSearch('')
    setCategoriaId(undefined)
    setPagina(1)
  }

  const hayFiltros = search !== '' || categoriaId !== undefined
  const totalPaginas = productos.data ? Math.max(1, Math.ceil(productos.data.total / POR_PAGINA)) : 1

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">Catálogo</h1>
        <p className="text-sm text-stone-500">Elegí tus platos y armá tu pedido.</p>
      </div>

      <div className="flex flex-col gap-4">
        <div className="max-w-md">
          <Input
            type="search"
            placeholder="Buscar por nombre…"
            aria-label="Buscar productos"
            value={textoBusqueda}
            onChange={(e) => alEscribir(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar por categoría">
          <Button
            size="sm"
            variant={categoriaId === undefined ? 'primary' : 'secondary'}
            onClick={() => elegirCategoria(undefined)}
          >
            Todas
          </Button>
          {categorias.data?.map((c) => (
            <Button
              key={c.id}
              size="sm"
              variant={categoriaId === c.id ? 'primary' : 'secondary'}
              onClick={() => elegirCategoria(c.id)}
            >
              {c.nombre}
            </Button>
          ))}
        </div>
      </div>

      {productos.isPending ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }, (_, i) => (
            <ProductoCardSkeleton key={i} />
          ))}
        </div>
      ) : productos.isError ? (
        <EstadoError
          mensaje={handleApiError(productos.error, 'No se pudo cargar el catálogo')}
          onReintentar={() => void productos.refetch()}
        />
      ) : productos.data.items.length === 0 ? (
        <EstadoVacio
          titulo="No encontramos productos"
          descripcion={
            hayFiltros
              ? 'Probá con otra búsqueda o quitá los filtros.'
              : 'Todavía no hay productos cargados en el catálogo.'
          }
          accion={
            hayFiltros ? (
              <Button variant="secondary" onClick={limpiarFiltros}>
                Limpiar filtros
              </Button>
            ) : undefined
          }
        />
      ) : (
        <>
          <div
            className={`grid grid-cols-1 gap-5 transition-opacity sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 ${
              productos.isFetching ? 'opacity-60' : ''
            }`}
          >
            {productos.data.items.map((p) => (
              <ProductoCard key={p.id} producto={p} />
            ))}
          </div>
          <Paginacion
            pagina={pagina}
            totalPaginas={totalPaginas}
            total={productos.data.total}
            onCambiar={setPagina}
          />
        </>
      )}
    </div>
  )
}
