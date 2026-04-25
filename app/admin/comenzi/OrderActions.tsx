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

const TRANSITIONS: Record<string, { label: string; next: string; color: string }[]> = {
  in_asteptare: [
    { label: 'Confirmă', next: 'confirmata', color: 'bg-blue-600 hover:bg-blue-700' },
    { label: 'Anulează', next: 'anulata', color: 'bg-red-600 hover:bg-red-700' },
  ],
  confirmata: [
    { label: 'Marchează expediată', next: 'expediata', color: 'bg-purple-600 hover:bg-purple-700' },
    { label: 'Anulează', next: 'anulata', color: 'bg-red-600 hover:bg-red-700' },
  ],
  expediata: [
    { label: 'Marchează livrată', next: 'livrata', color: 'bg-green-600 hover:bg-green-700' },
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
    <div className="flex flex-wrap gap-2 mt-3">
      {actions.map(a => (
        <button
          key={a.next}
          onClick={() => update(a.next)}
          disabled={!!loading}
          className={`px-4 py-1.5 rounded-md text-white text-xs font-semibold transition-colors disabled:opacity-50 ${a.color}`}
        >
          {loading === a.next ? 'Se actualizează...' : a.label}
        </button>
      ))}
      {error && <p className="w-full text-xs text-red-600 mt-1">{error}</p>}
    </div>
  )
}
