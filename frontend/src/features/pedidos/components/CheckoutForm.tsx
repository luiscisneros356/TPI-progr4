import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from '@tanstack/react-form'
import { handleApiError } from '../../../shared/api/handleApiError'
import { Alerta } from '../../../shared/ui/Alerta'
import { Button } from '../../../shared/ui/Button'
import { Input, Select, Textarea } from '../../../shared/ui/Input'
import { ETIQUETA_PAGO } from '../../../shared/utils/format'
import { fieldError } from '../../../shared/utils/formErrors'
import { useCartStore } from '../../../store/cartStore'
import { useCrearPedido } from '../hooks/usePedidoMutations'
import { FORMAS_PAGO } from '../types'
import type { FormaPago } from '../types'

function esFormaPago(valor: string): valor is FormaPago {
  return FORMAS_PAGO.some((f) => f === valor)
}

/** Formulario de checkout: envía POST /pedidos con el carrito y vacía el carrito al terminar. */
export function CheckoutForm() {
  const navigate = useNavigate()
  const items = useCartStore((s) => s.items)
  const vaciar = useCartStore((s) => s.vaciar)
  const crear = useCrearPedido()
  const [errorApi, setErrorApi] = useState<string | null>(null)

  const form = useForm({
    defaultValues: {
      direccion_entrega: '',
      forma_pago: 'EFECTIVO' as FormaPago,
      notas: '',
    },
    onSubmit: async ({ value }) => {
      setErrorApi(null)
      try {
        await crear.mutateAsync({
          items: items.map((i) => ({ producto_id: i.producto_id, cantidad: i.cantidad })),
          forma_pago: value.forma_pago,
          direccion_entrega: value.direccion_entrega.trim(),
          notas: value.notas.trim() || null,
        })
        vaciar()
        navigate('/mis-pedidos')
      } catch (error) {
        setErrorApi(handleApiError(error, 'No se pudo confirmar el pedido'))
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
        name="direccion_entrega"
        validators={{
          onChange: ({ value }) => {
            const v = value.trim()
            if (v.length < 5) return 'La dirección debe tener al menos 5 caracteres'
            if (v.length > 200) return 'La dirección admite hasta 200 caracteres'
            return undefined
          },
        }}
      >
        {(field) => (
          <Input
            label="Dirección de entrega"
            placeholder="Calle, número, piso, localidad"
            autoComplete="street-address"
            value={field.state.value}
            onBlur={field.handleBlur}
            onChange={(e) => field.handleChange(e.target.value)}
            error={field.state.meta.isTouched ? fieldError(field.state.meta.errors) : undefined}
          />
        )}
      </form.Field>

      <form.Field name="forma_pago">
        {(field) => (
          <Select
            label="Forma de pago"
            value={field.state.value}
            onBlur={field.handleBlur}
            onChange={(e) => {
              if (esFormaPago(e.target.value)) field.handleChange(e.target.value)
            }}
          >
            {FORMAS_PAGO.map((f) => (
              <option key={f} value={f}>
                {ETIQUETA_PAGO[f]}
              </option>
            ))}
          </Select>
        )}
      </form.Field>

      <form.Field
        name="notas"
        validators={{
          onChange: ({ value }) => (value.length > 500 ? 'Las notas admiten hasta 500 caracteres' : undefined),
        }}
      >
        {(field) => (
          <Textarea
            label="Notas (opcional)"
            placeholder="Ej.: sin cebolla, tocar timbre 2B…"
            value={field.state.value}
            onBlur={field.handleBlur}
            onChange={(e) => field.handleChange(e.target.value)}
            error={field.state.meta.isTouched ? fieldError(field.state.meta.errors) : undefined}
          />
        )}
      </form.Field>

      {errorApi && <Alerta>{errorApi}</Alerta>}

      <form.Subscribe selector={(s) => s.isSubmitting}>
        {(isSubmitting) => (
          <Button type="submit" loading={isSubmitting} disabled={items.length === 0}>
            Confirmar pedido
          </Button>
        )}
      </form.Subscribe>
    </form>
  )
}
