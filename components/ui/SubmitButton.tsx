'use client'

import { useFormStatus } from 'react-dom'
import { LoaderCircle } from 'lucide-react'

export function SubmitButton({
  idleLabel,
  pendingLabel = 'PROCESSANDO...',
  className = 'btn',
  disabled = false,
}: {
  idleLabel: string
  pendingLabel?: string
  className?: string
  disabled?: boolean
}) {
  const { pending } = useFormStatus()
  const busy = pending || disabled

  return (
    <button
      type="submit"
      className={`${className}${pending ? ' is-loading' : ''}`}
      disabled={busy}
      aria-busy={pending}
    >
      {pending && <LoaderCircle className="button-spinner" size={15} aria-hidden="true" />}
      <span>{pending ? pendingLabel : idleLabel}</span>
    </button>
  )
}
