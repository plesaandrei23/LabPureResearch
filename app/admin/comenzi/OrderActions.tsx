'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  orderId: string
  currentStatus: string
  customerEmail: string
  customerName: string
  shortId: string
}

type Variant = 'accent' | 'accent2' | 'success' | 'destructive'

const VARIANT_CLASS: Record<Variant, string> = {
  accent:      'bg-[var(--accent)]      text-[var(--accent-fg)] hover:brightness-110 glow-accent',
  accent2:     'bg-[var(--accent-2)]    text-white              hover:brightness-110',
  success:     'bg-[var(--success)]     text-white              hover:brightness-110',
  destructive: 'bg-[var(--destructive)] text-white              hover:brightness-110',
}

const TRANSITIONS: Record<string, { label: string; next: string; variant: Variant }[]> = {
  in_asteptare: [
    { label: 'Confirmă',             next: 'confirmata', variant: 'accent' },
    { label: 'Anulează',             next: 'anulata',    variant: 'destructive' },
  ],
  confirmata: [
    { label: 'Marchează expediată',  next: 'expediata',  variant: 'accent2' },
    { label: 'Anulează',             next: 'anulata',    variant: 'destructive' },
  ],
  expediata: [
    { label: 'Marchează livrată',    next: 'livrata',    variant: 'success' },
  ],
}

export default function OrderActions({ orderId, currentStatus, customerEmail, customerName, shortId }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState('')

  const actions = TRANSITIONS[currentStatus] ?? []
  if (actions.length === 0) return null

  async function update(newStatus: string) {
    setLoading(newStatus)
    setError('')
    const res = await fetch('/api/update-order-status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId, newStatus, customerEmail, customerName, shortId }),
    })
    if (res.ok) {
      router.refresh()
    } else {
      const data = await res.json()
      setError(data.error ?? 'Eroare la actualizare.')
    }
    setLoading(null)
  }

  return (
    <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t border-[var(--border)]">
      {actions.map((a) => (
        <button
          key={a.next}
          onClick={() => update(a.next)}
          disabled={!!loading}
          className={`flex-1 sm:flex-initial min-w-[120px] px-4 py-2 rounded-full text-xs font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${VARIANT_CLASS[a.variant]}`}
        >
          {loading === a.next ? 'Se actualizează…' : a.label}
        </button>
      ))}
      {error && <p className="w-full text-xs text-[var(--destructive)] mt-1">{error}</p>}
    </div>
  )
}
