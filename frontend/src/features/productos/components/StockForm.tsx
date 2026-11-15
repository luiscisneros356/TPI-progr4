import { useState } from 'react'
import { useForm } from '@tanstack/react-form'
import { handleApiError } from '../../../shared/api/handleApiError'
import { Alerta } from '../../../shared/ui/Alerta'
import { Button } from '../../../shared/ui/Button'
import { Input } from '../../../shared/ui/Input'
import { fieldError } from '../../../shared/utils/formErrors'
import { useActualizarStock } from '../hooks/useProductos'
import type { Producto } from '../types'

interface StockFormProps {
  producto: Producto
  onListo: () => void
  onCancelar: () => void
}

/** Cambio rápido de stock y disponibilidad (PATCH /productos/{id}/stock). */
export function StockForm({ producto, onListo, onCancelar }: StockFormProps) {
  const actualizar = useActualizarStock()
  const [errorApi, setErrorApi] = useState<string | null>(null)

  const form = useForm({
    defaultValues: { stock: String(producto.stock), disponible: producto.disponible },
    onSubmit: async ({ value }) => {
      setErrorApi(null)
      try {
        await actualizar.mutateAsync({
          id: producto.id,
          payload: { stock: Number(value.stock), disponible: value.disponible },
        })
        onListo()
      } catch (error) {
        setErrorApi(handleApiError(error, 'No se pudo actualizar el stock'))
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
      <p className="text-sm text-stone-600">
        Producto: <strong>{producto.nombre}</strong>
      </p>

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
              Guardar
            </Button>
          )}
        </form.Subscribe>
      </div>
    </form>
  )
}
