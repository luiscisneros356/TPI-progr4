import { useState } from 'react'
import { useForm } from '@tanstack/react-form'
import { handleApiError } from '../../../shared/api/handleApiError'
import { Alerta } from '../../../shared/ui/Alerta'
import { Button } from '../../../shared/ui/Button'
import { Input, Select, Textarea } from '../../../shared/ui/Input'
import { fieldError } from '../../../shared/utils/formErrors'
import type { Categoria } from '../../categorias/types'
import { useActualizarProducto, useCrearProducto } from '../hooks/useProductos'
import type { Producto, ProductoCreate } from '../types'

interface ProductoFormProps {
  /** Si se pasa, el formulario edita ese producto; si no, crea uno nuevo. */
  producto?: Producto
  categorias: Categoria[]
  onListo: () => void
  onCancelar: () => void
}

export function ProductoForm({ producto, categorias, onListo, onCancelar }: ProductoFormProps) {
  const crear = useCrearProducto()
  const actualizar = useActualizarProducto()
  const [errorApi, setErrorApi] = useState<string | null>(null)

  const form = useForm({
    // Los números se editan como texto y se convierten al enviar.
    defaultValues: {
      nombre: producto?.nombre ?? '',
      descripcion: producto?.descripcion ?? '',
      categoria_id: producto ? String(producto.categoria_id) : '',
      precio_base: producto ? String(producto.precio_base) : '',
      stock: producto ? String(producto.stock) : '0',
      imagen_url: producto?.imagen_url ?? '',
      disponible: producto?.disponible ?? true,
    },
    onSubmit: async ({ value }) => {
      setErrorApi(null)
      const payload: ProductoCreate = {
        nombre: value.nombre.trim(),
        descripcion: value.descripcion.trim() || null,
        categoria_id: Number(value.categoria_id),
        precio_base: Number(value.precio_base),
        stock: Number(value.stock),
        imagen_url: value.imagen_url.trim() || null,
        disponible: value.disponible,
      }
      try {
        if (producto) {
          await actualizar.mutateAsync({ id: producto.id, payload })
        } else {
          await crear.mutateAsync(payload)
        }
        onListo()
      } catch (error) {
        setErrorApi(handleApiError(error, 'No se pudo guardar el producto'))
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
            if (v.length > 150) return 'Máximo 150 caracteres'
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
        name="categoria_id"
        validators={{
          onChange: ({ value }) => (value ? undefined : 'Elegí una categoría'),
        }}
      >
        {(field) => (
          <Select
            label="Categoría"
            value={field.state.value}
            onBlur={field.handleBlur}
            onChange={(e) => field.handleChange(e.target.value)}
            error={field.state.meta.isTouched ? fieldError(field.state.meta.errors) : undefined}
          >
            <option value="">Seleccioná…</option>
            {categorias.map((c) => (
              <option key={c.id} value={String(c.id)}>
                {c.nombre}
              </option>
            ))}
          </Select>
        )}
      </form.Field>

      <div className="grid grid-cols-2 gap-4">
        <form.Field
          name="precio_base"
          validators={{
            onChange: ({ value }) => {
              if (value.trim() === '') return 'Ingresá el precio'
              const n = Number(value)
              if (Number.isNaN(n)) return 'Debe ser un número'
              if (n < 0) return 'Debe ser mayor o igual a 0'
              return undefined
            },
          }}
        >
          {(field) => (
            <Input
              label="Precio base"
              type="number"
              min={0}
              step="0.01"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              error={field.state.meta.isTouched ? fieldError(field.state.meta.errors) : undefined}
            />
          )}
        </form.Field>

        <form.Field
          name="stock"
          validators={{
            onChange: ({ value }) => {
              if (value.trim() === '') return 'Ingresá el stock'
              const n = Number(value)
              if (!Number.isInteger(n)) return 'Debe ser un número entero'
              if (n < 0) return 'Debe ser mayor o igual a 0'
              return undefined
            },
          }}
        >
          {(field) => (
            <Input
              label="Stock"
              type="number"
              min={0}
              step="1"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              error={field.state.meta.isTouched ? fieldError(field.state.meta.errors) : undefined}
            />
          )}
        </form.Field>
      </div>

      <form.Field
        name="imagen_url"
        validators={{
          onChange: ({ value }) => {
            const v = value.trim()
            if (v === '') return undefined
            return /^https?:\/\/\S+$/i.test(v) ? undefined : 'Debe ser una URL http(s) válida'
          },
        }}
      >
        {(field) => (
          <Input
            label="Imagen (URL, opcional)"
            placeholder="https://…"
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
          onChange: ({ value }) => (value.length > 1000 ? 'Máximo 1000 caracteres' : undefined),
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

      <form.Field name="disponible">
        {(field) => (
          <label className="flex items-center gap-2 text-sm text-stone-700">
            <input
              type="checkbox"
              checked={field.state.value}
              onChange={(e) => field.handleChange(e.target.checked)}
              className="h-4 w-4 rounded border-stone-300 text-orange-600 focus:ring-orange-500"
            />
            Disponible para la venta
          </label>
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
              {producto ? 'Guardar cambios' : 'Crear producto'}
            </Button>
          )}
        </form.Subscribe>
      </div>
    </form>
  )
}
