import { useState } from 'react'
import { useForm } from '@tanstack/react-form'
import { handleApiError } from '../../../shared/api/handleApiError'
import { Alerta } from '../../../shared/ui/Alerta'
import { Button } from '../../../shared/ui/Button'
import { Input, Textarea } from '../../../shared/ui/Input'
import { fieldError } from '../../../shared/utils/formErrors'
import { useActualizarCategoria, useCrearCategoria } from '../hooks/useCategorias'
import type { Categoria } from '../types'

interface CategoriaFormProps {
  /** Si se pasa, el formulario edita esa categoría; si no, crea una nueva. */
  categoria?: Categoria
  onListo: () => void
  onCancelar: () => void
}

export function CategoriaForm({ categoria, onListo, onCancelar }: CategoriaFormProps) {
  const crear = useCrearCategoria()
  const actualizar = useActualizarCategoria()
  const [errorApi, setErrorApi] = useState<string | null>(null)

  const form = useForm({
    defaultValues: {
      nombre: categoria?.nombre ?? '',
      descripcion: categoria?.descripcion ?? '',
    },
    onSubmit: async ({ value }) => {
      setErrorApi(null)
      const payload = {
        nombre: value.nombre.trim(),
        descripcion: value.descripcion.trim() || null,
      }
      try {
        if (categoria) {
          await actualizar.mutateAsync({ id: categoria.id, payload })
        } else {
          await crear.mutateAsync(payload)
        }
        onListo()
      } catch (error) {
        setErrorApi(handleApiError(error, 'No se pudo guardar la categoría'))
      }
    },
  })

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(e) => {
        e.preventDefault()
        e.stopPropagation()
        void form.handleSubmit()
      }}
    >
      <form.Field
        name="nombre"
        validators={{
          onChange: ({ value }) => {
            const v = value.trim()
            if (v.length < 2) return 'Mínimo 2 caracteres'
            if (v.length > 100) return 'Máximo 100 caracteres'
            return undefined
          },
        }}
      >
        {(field) => (
          <Input
            label="Nombre"
            value={field.state.value}
            onBlur={field.handleBlur}
            onChange={(e) => field.handleChange(e.target.value)}
            error={field.state.meta.isTouched ? fieldError(field.state.meta.errors) : undefined}
          />
        )}
      </form.Field>

      <form.Field
        name="descripcion"
        validators={{
          onChange: ({ value }) => (value.length > 500 ? 'Máximo 500 caracteres' : undefined),
        }}
      >
        {(field) => (
          <Textarea
            label="Descripción (opcional)"
            value={field.state.value}
            onBlur={field.handleBlur}
            onChange={(e) => field.handleChange(e.target.value)}
            error={field.state.meta.isTouched ? fieldError(field.state.meta.errors) : undefined}
          />
        )}
      </form.Field>

      {errorApi && <Alerta>{errorApi}</Alerta>}

      <div className="flex justify-end gap-2">
        <Button variant="secondary" onClick={onCancelar}>
          Cancelar
        </Button>
        <form.Subscribe selector={(s) => s.isSubmitting}>
          {(isSubmitting) => (
            <Button type="submit" loading={isSubmitting}>
              {categoria ? 'Guardar cambios' : 'Crear categoría'}
            </Button>
          )}
        </form.Subscribe>
      </div>
    </form>
  )
}
