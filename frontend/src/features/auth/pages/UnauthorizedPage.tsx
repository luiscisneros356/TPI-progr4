import { Link } from 'react-router-dom'
import { EstadoVacio } from '../../../shared/components/EstadoVacio'

export function UnauthorizedPage() {
  return (
    <EstadoVacio
      titulo="No tenés permiso para ver esta pantalla"
      descripcion="Tu cuenta no tiene el rol necesario para acceder a esta sección."
      accion={
        <Link
          to="/"
          className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700"
        >
          Volver al inicio
        </Link>
      }
    />
  )
}
