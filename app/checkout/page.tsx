'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useCart } from '@/components/CartProvider'
import { createClient } from '@/lib/supabase'

export default function CheckoutPage() {
  const { items, total, clearCart } = useCart()
  const router = useRouter()
  const supabase = createClient()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [userId, setUserId] = useState<string | null>(null)

  const [form, setForm] = useState({
    full_name: '',
    phone: '',
    address: '',
    city: '',
    county: '',
    postal_code: '',
    notes: '',
  })

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUserId(data.user.id)
        supabase.from('profiles').select('*').eq('id', data.user.id).single().then(({ data: profile }) => {
          if (profile) {
            setForm(f => ({
              ...f,
              full_name: profile.full_name ?? '',
              phone: profile.phone ?? '',
              address: profile.address ?? '',
              city: profile.city ?? '',
              county: profile.county ?? '',
              postal_code: profile.postal_code ?? '',
            }))
          }
        })
      }
    })
  }, [])

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!form.full_name || !form.phone || !form.address || !form.city || !form.county) {
      setError('Completează toate câmpurile obligatorii.')
      return
    }
    if (items.length === 0) {
      setError('Coșul tău este gol.')
      return
    }
    if (!userId) {
      router.push('/cont/autentificare?redirect=/checkout')
      return
    }

    setLoading(true)
    try {
      const { data: order, error: orderErr } = await supabase
        .from('orders')
        .insert({
          user_id: userId,
          status: 'in_asteptare',
          total_amount: total,
          shipping_name: form.full_name,
          shipping_address: form.address,
          shipping_city: form.city,
          shipping_county: form.county,
          shipping_postal: form.postal_code,
          shipping_phone: form.phone,
          notes: form.notes || null,
        })
        .select()
        .single()

      if (orderErr || !order) throw orderErr ?? new Error('Eroare la crearea comenzii')

      const orderItems = items.map(item => ({
        order_id: order.id,
        product_id: item.id,
        product_name: item.name,
        quantity: item.quantity,
        unit_price: item.price,
      }))

      const { error: itemsErr } = await supabase.from('order_items').insert(orderItems)
      if (itemsErr) throw itemsErr

      clearCart()
      router.push(`/checkout/confirmare?id=${order.id}`)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'A apărut o eroare. Încearcă din nou.')
    } finally {
      setLoading(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto py-24 px-4 text-center">
        <p className="text-neutral-500 mb-6">Coșul tău este gol.</p>
        <Link href="/produse" className="text-blue-600 hover:underline">← Înapoi la produse</Link>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-neutral-900 mb-8">Finalizare comandă</h1>

      {!userId && (
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-md p-4 text-sm text-blue-800">
          <Link href="/cont/autentificare?redirect=/checkout" className="font-semibold underline">Autentifică-te</Link> pentru a salva comanda în istoricul contului tău, sau continuă ca oaspete.
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-5">
          <div className="bg-white border border-neutral-200 rounded-lg p-6">
            <h2 className="text-base font-semibold text-neutral-900 mb-4">Date de livrare</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-neutral-700 mb-1">Nume complet *</label>
                <input name="full_name" value={form.full_name} onChange={handleChange} required
                  className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Ion Popescu" />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Telefon *</label>
                <input name="phone" value={form.phone} onChange={handleChange} required
                  className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="07xx xxx xxx" />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Județ *</label>
                <input name="county" value={form.county} onChange={handleChange} required
                  className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Cluj" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-neutral-700 mb-1">Adresă *</label>
                <input name="address" value={form.address} onChange={handleChange} required
                  className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Str. Exemplu nr. 1" />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Oraș *</label>
                <input name="city" value={form.city} onChange={handleChange} required
                  className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Cluj-Napoca" />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Cod poștal</label>
                <input name="postal_code" value={form.postal_code} onChange={handleChange}
                  className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="400000" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-neutral-700 mb-1">Observații</label>
                <textarea name="notes" value={form.notes} onChange={handleChange} rows={2}
                  className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Instrucțiuni speciale..." />
              </div>
            </div>
          </div>

          {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-3">{error}</p>}

          <button type="submit" disabled={loading}
            className="w-full py-3 rounded-md bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            {loading ? 'Se procesează...' : 'Plasează comanda'}
          </button>
        </form>

        {/* Order summary */}
        <div className="bg-white border border-neutral-200 rounded-lg p-6 h-fit">
          <h2 className="text-base font-semibold text-neutral-900 mb-4">Sumar comandă</h2>
          <ul className="divide-y divide-neutral-100 mb-4">
            {items.map(item => (
              <li key={item.id} className="py-2 flex justify-between text-sm">
                <span className="text-neutral-700">{item.name} × {item.quantity}</span>
                <span className="font-medium">{(item.price * item.quantity).toFixed(2)} RON</span>
              </li>
            ))}
          </ul>
          <div className="border-t border-neutral-200 pt-3 flex justify-between font-bold text-neutral-900">
            <span>Total</span>
            <span>{total.toFixed(2)} RON</span>
          </div>
          <p className="mt-3 text-xs text-neutral-400">Plata se face la livrare (ramburs) sau prin transfer bancar.</p>
        </div>
      </div>
    </div>
  )
}
