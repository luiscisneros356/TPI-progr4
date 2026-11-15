import { Button } from '../ui/Button'
import { Modal } from '../ui/Modal'

interface ConfirmDialogProps {
  open: boolean
  titulo: string
  mensaje: string
  textoConfirmar?: string
  cargando?: boolean
  onConfirmar: () => void
  onCancelar: () => void
}

export function ConfirmDialog({
  open,
  titulo,
  mensaje,
  textoConfirmar = 'Confirmar',
  cargando = false,
  onConfirmar,
  onCancelar,
}: ConfirmDialogProps) {
  return (
    <Modal open={open} title={titulo} onClose={onCancelar}>
      <p className="text-sm text-stone-600">{mensaje}</p>
      <div className="mt-5 flex justify-end gap-2">
        <Button variant="secondary" onClick={onCancelar} disabled={cargando}>
          Volver
        </Button>
        <Button variant="danger" onClick={onConfirmar} loading={cargando}>
          {textoConfirmar}
        </Button>
      </div>
    </Modal>
  )
}
