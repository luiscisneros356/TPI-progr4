import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { useCartStore } from '../../store/cartStore'
import { Button } from '../ui/Button'

const linkClase = ({ isActive }: { isActive: boolean }) =>
  `rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
    isActive ? 'bg-orange-100 text-orange-800' : 'text-stone-600 hover:bg-stone-100'
  }`

export function Navbar() {
  const usuario = useAuthStore((s) => s.usuario)
  const logout = useAuthStore((s) => s.logout)
  const cantidad = useCartStore((s) => s.cantidadTotal())
  const navigate = useNavigate()
  const [cerrando, setCerrando] = useState(false)

  const cerrarSesion = async () => {
    setCerrando(true)
    try {
      await logout()
    } finally {
      setCerrando(false)
      navigate('/login')
    }
  }

  return (
    <header className="sticky top-0 z-40 border-b border-stone-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <Link to="/" className="flex items-center gap-2 text-lg font-bold text-orange-700">
          <span aria-hidden="true">🍔</span> Food Store
        </Link>

        <nav className="flex flex-wrap items-center gap-1" aria-label="Principal">
          <NavLink to="/" end className={linkClase}>
            Catálogo
          </NavLink>
          <NavLink to="/carrito" className={linkClase}>
            Carrito
            {cantidad > 0 && (
              <span className="ml-1.5 rounded-full bg-orange-600 px-1.5 py-0.5 text-xs text-white">
                {cantidad}
              </span>
            )}
          </NavLink>
          {usuario && (
            <NavLink to="/mis-pedidos" className={linkClase}>
              Mis pedidos
            </NavLink>
          )}
          {usuario?.role === 'admin' && (
            <NavLink to="/admin/resumen" className={linkClase}>
              Panel admin
            </NavLink>
          )}
        </nav>

        <div className="flex items-center gap-3">
          {usuario ? (
            <>
              <div className="text-right leading-tight">
                <p className="text-sm font-medium text-stone-800">{usuario.full_name}</p>
                <p className="text-xs text-stone-500">
                  {usuario.role === 'admin' ? 'Administrador' : 'Cliente'}
                </p>
              </div>
              <Button variant="secondary" size="sm" loading={cerrando} onClick={cerrarSesion}>
                Cerrar sesión
              </Button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="rounded-lg px-3 py-1.5 text-sm font-medium text-stone-700 hover:bg-stone-100"
              >
                Ingresar
              </Link>
              <Link
                to="/register"
                className="rounded-lg bg-orange-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-orange-700"
              >
                Registrarme
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
