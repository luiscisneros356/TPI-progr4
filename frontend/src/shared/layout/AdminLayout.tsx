import { NavLink, Outlet } from 'react-router-dom'

const SECCIONES = [
  { to: '/admin/resumen', etiqueta: 'Resumen' },
  { to: '/admin/pedidos', etiqueta: 'Pedidos' },
  { to: '/admin/productos', etiqueta: 'Productos' },
  { to: '/admin/categorias', etiqueta: 'Categorías' },
  { to: '/admin/usuarios', etiqueta: 'Usuarios' },
]

/** Navegación interna del panel de administración. */
export function AdminLayout() {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">Panel de administración</h1>
        <nav className="mt-3 flex flex-wrap gap-1 border-b border-stone-200" aria-label="Panel">
          {SECCIONES.map((s) => (
            <NavLink
              key={s.to}
              to={s.to}
              className={({ isActive }) =>
                `-mb-px border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'border-orange-600 text-orange-700'
                    : 'border-transparent text-stone-500 hover:text-stone-800'
                }`
              }
            >
              {s.etiqueta}
            </NavLink>
          ))}
        </nav>
      </div>
      <Outlet />
    </div>
  )
}
