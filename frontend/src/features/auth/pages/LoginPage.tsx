import { useState } from 'react'
import { Link, Navigate, useLocation } from 'react-router-dom'
import { useForm } from '@tanstack/react-form'
import { handleApiError } from '../../../shared/api/handleApiError'
import { Button } from '../../../shared/ui/Button'
import { Card } from '../../../shared/ui/Card'
import { Input } from '../../../shared/ui/Input'
import { fieldError } from '../../../shared/utils/formErrors'
import { useAuthStore } from '../../../store/authStore'

interface LocationState {
  from?: { pathname?: string }
}

export function LoginPage() {
  const usuario = useAuthStore((s) => s.usuario)
  const login = useAuthStore((s) => s.login)
  const location = useLocation()
  const [errorApi, setErrorApi] = useState<string | null>(null)

  const desde = (location.state as LocationState | null)?.from?.pathname

  const form = useForm({
    defaultValues: { username: '', password: '' },
    onSubmit: async ({ value }) => {
      setErrorApi(null)
      try {
        await login(value.username.trim(), value.password)
      } catch (error) {
        setErrorApi(handleApiError(error, 'No se pudo iniciar sesión'))
      }
    },
  })

  // Con sesión iniciada se sale del login (al destino original o según el rol).
  if (usuario) {
    const destino = desde ?? (usuario.role === 'admin' ? '/admin/resumen' : '/')
    return <Navigate to={destino} replace />
  }

  return (
    <div className="mx-auto max-w-md">
      <Card className="p-6">
        <h1 className="text-xl font-bold text-stone-900">Ingresar</h1>
        <p className="mt-1 text-sm text-stone-500">Accedé a tu cuenta para hacer pedidos.</p>

        <form
          className="mt-5 flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault()
            e.stopPropagation()
            void form.handleSubmit()
          }}
        >
          <form.Field
            name="username"
            validators={{
              onChange: ({ value }) => (value.trim() ? undefined : 'Ingresá tu usuario'),
            }}
          >
            {(field) => (
              <Input
                label="Usuario"
                autoComplete="username"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                error={field.state.meta.isTouched ? fieldError(field.state.meta.errors) : undefined}
              />
            )}
          </form.Field>

          <form.Field
            name="password"
            validators={{
              onChange: ({ value }) => (value ? undefined : 'Ingresá tu contraseña'),
            }}
          >
            {(field) => (
              <Input
                label="Contraseña"
                type="password"
                autoComplete="current-password"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                error={field.state.meta.isTouched ? fieldError(field.state.meta.errors) : undefined}
              />
            )}
          </form.Field>

          {errorApi && (
            <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {errorApi}
            </p>
          )}

          <form.Subscribe selector={(s) => s.isSubmitting}>
            {(isSubmitting) => (
              <Button type="submit" loading={isSubmitting}>
                Ingresar
              </Button>
            )}
          </form.Subscribe>
        </form>

        <p className="mt-4 text-center text-sm text-stone-500">
          ¿No tenés cuenta?{' '}
          <Link to="/register" className="font-medium text-orange-700 hover:underline">
            Registrate
          </Link>
        </p>
      </Card>
    </div>
  )
}
