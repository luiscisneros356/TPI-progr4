import { useId } from 'react'
import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from 'react'

interface CampoProps {
  label?: string
  error?: string
  hint?: string
}

const BASE =
  'w-full rounded-lg border bg-white px-3 py-2 text-sm text-stone-800 shadow-sm outline-none transition-colors placeholder:text-stone-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 disabled:bg-stone-100'

function claseBorde(error?: string): string {
  return error ? 'border-red-400' : 'border-stone-300'
}

function Envoltorio({
  id,
  label,
  error,
  hint,
  children,
}: CampoProps & { id: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-stone-700">
          {label}
        </label>
      )}
      {children}
      {error ? (
        <p role="alert" className="text-xs text-red-600">
          {error}
        </p>
      ) : hint ? (
        <p className="text-xs text-stone-500">{hint}</p>
      ) : null}
    </div>
  )
}

export function Input({
  label,
  error,
  hint,
  className = '',
  ...rest
}: CampoProps & InputHTMLAttributes<HTMLInputElement>) {
  const id = useId()
  return (
    <Envoltorio id={id} label={label} error={error} hint={hint}>
      <input id={id} className={`${BASE} ${claseBorde(error)} ${className}`} {...rest} />
    </Envoltorio>
  )
}

export function Textarea({
  label,
  error,
  hint,
  className = '',
  ...rest
}: CampoProps & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const id = useId()
  return (
    <Envoltorio id={id} label={label} error={error} hint={hint}>
      <textarea
        id={id}
        rows={3}
        className={`${BASE} ${claseBorde(error)} ${className}`}
        {...rest}
      />
    </Envoltorio>
  )
}

export function Select({
  label,
  error,
  hint,
  className = '',
  children,
  ...rest
}: CampoProps & SelectHTMLAttributes<HTMLSelectElement>) {
  const id = useId()
  return (
    <Envoltorio id={id} label={label} error={error} hint={hint}>
      <select id={id} className={`${BASE} ${claseBorde(error)} ${className}`} {...rest}>
        {children}
      </select>
    </Envoltorio>
  )
}
