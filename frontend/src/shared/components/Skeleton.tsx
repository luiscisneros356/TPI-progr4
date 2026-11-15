/** Bloque gris animado que se muestra mientras cargan los datos. */
export function Skeleton({ className = '' }: { className?: string }) {
  return <div aria-hidden="true" className={`animate-pulse rounded-md bg-stone-200 ${className}`} />
}
