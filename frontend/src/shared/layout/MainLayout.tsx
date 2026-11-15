import { Outlet } from 'react-router-dom'
import { Navbar } from './Navbar'

/** Reúne la Navbar y el contenido de la ruta activa. */
export function MainLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">
        <Outlet />
      </main>
      <footer className="border-t border-stone-200 py-4 text-center text-xs text-stone-500">
        Food Store · Trabajo Práctico Integrador · Programación 4 · UTN
      </footer>
    </div>
  )
}
