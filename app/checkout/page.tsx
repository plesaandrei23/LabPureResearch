'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useCart } from '@/components/CartProvider'
import { createClient } from '@/lib/supabase'
import { JUDETE, ORASE } from '@/lib/ro-geo'

type FormState = {
  full_name: string
  email: string
  phone: string
  address: string
  county: string
  city: string
  postal_code: string
  notes: string
}

type Errors = Partial<Record<keyof FormState, string>>

const PHONE_RE = /^(\+40|0)[0-9]{9}$/
const POSTAL_RE = /^[0-9]{6}$/
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validate(form: FormState): Errors {
  const e: Errors = {}
  if (!form.full_name.trim() || form.full_name.trim().length < 3)
    e.full_name = 'Minim 3 caractere.'
  if (!EMAIL_RE.test(form.email))
    e.email = 'Adresă de email invalidă.'
  if (!PHONE_RE.test(form.phone.replace(/\s/g, '')))
    e.phone = 'Format valid: 07xxxxxxxx sau +40xxxxxxxxx'
  if (!form.address.trim() || form.address.trim().length < 5)
    e.address = 'Adresa trebuie să aibă minim 5 caractere.'
  if (!form.county)
    e.county = 'Selectează județul.'
  if (!form.city.trim())
    e.city = 'Completează localitatea.'
  if (!POSTAL_RE.test(form.postal_code.trim()))
    e.postal_code = 'Codul poștal trebuie să aibă exact 6 cifre.'
  return e
}

export default function CheckoutPage() {
  const { items, total, clearCart } = useCart()
  const router = useRouter()
  const supabase = createClient()

  const [loading, setLoading] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [userId, setUserId] = useState<string | null>(null)
  const [errors, setErrors] = useState<Errors>({})
  const [touched, setTouched] = useState<Partial<Record<keyof FormState, boolean>>>({})

  const [form, setForm] = useState<FormState>({
    full_name: '',
    email: '',
    phone: '',
    address: '',
    county: '',
    city: '',
    postal_code: '',
    notes: '',
  })

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) return
      setUserId(data.user.id)
      setForm(f => ({ ...f, email: data.user!.email ?? '' }))
      supabase.from('profiles').select('*').eq('id', data.user.id).single().then(({ data: p }) => {
        if (!p) return
        setForm(f => ({
          ...f,
          full_name: p.full_name ?? f.full_name,
          phone: p.phone ?? f.phone,
          address: p.address ?? f.address,
          county: p.county ?? f.county,
          city: p.city ?? f.city,
          postal_code: p.postal_code ?? f.postal_code,
        }))
      })
    })
  }, [])

  const cityOptions = useMemo(() => ORASE[form.county] ?? [], [form.county])

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value, ...(name === 'county' ? { city: '' } : {}) }))
    if (touched[name as keyof FormState]) {
      setErrors(prev => ({ ...prev, [name]: validate({ ...form, [name]: value })[name as keyof FormState] }))
    }
  }

  function handleBlur(e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name } = e.target
    setTouched(t => ({ ...t, [name]: true }))
    setErrors(prev => ({ ...prev, [name]: validate(form)[name as keyof FormState] }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitError('')
    const allTouched = Object.fromEntries(Object.keys(form).map(k => [k, true])) as typeof touched
    setTouched(allTouched)
    const errs = validate(form)
    setErrors(errs)
    if (Object.keys(errs).length > 0) return
    if (items.length === 0) { setSubmitError('Coșul tău este gol.'); return }
    if (!userId) { router.push('/cont/autentificare?redirect=/checkout'); return }

    setLoading(true)
    try {
      const { data: order, error: orderErr } = await supabase
        .from('orders')
        .insert({
          user_id: userId,
          status: 'in_asteptare',
          total_amount: total,
          shipping_name: form.full_name,
          shipping_email: form.email,
          shipping_phone: form.phone.replace(/\s/g, ''),
          shipping_address: form.address,
          shipping_city: form.city,
          shipping_county: form.county,
          shipping_postal: form.postal_code,
          notes: form.notes || null,
        })
        .select()
        .single()

      if (orderErr || !order) throw orderErr ?? new Error('Eroare la crearea comenzii')

      await supabase.from('order_items').insert(
        items.map(item => ({
          order_id: order.id,
          product_id: item.id,
          product_name: item.name,
          quantity: item.quantity,
          unit_price: item.price,
        }))
      )

      await fetch('/api/notify-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: order.id,
          items: items.map(i => ({ name: i.name, quantity: i.quantity, price: i.price })),
          total,
          shipping: {
            name: form.full_name,
            email: form.email,
            phone: form.phone,
            address: form.address,
            city: form.city,
            county: form.county,
            postal: form.postal_code,
          },
        }),
      })

      clearCart()
      router.push(`/checkout/confirmare?id=${order.id}`)
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : 'A apărut o eroare. Încearcă din nou.')
    } finally {
      setLoading(false)
    }
  }

  function field(name: keyof FormState) {
    const err = touched[name] ? errors[name] : undefined
    const base = 'w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
    return { className: `${base} ${err ? 'border-red-400 bg-red-50' : 'border-neutral-300'}` }
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
          <Link href="/cont/autentificare?redirect=/checkout" className="font-semibold underline">Autentifică-te</Link> pentru a salva comanda în contul tău.
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-5" noValidate>
          <div className="bg-white border border-neutral-200 rounded-lg p-6">
            <h2 className="text-base font-semibold text-neutral-900 mb-5">Date de contact și livrare</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Nume complet */}
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-neutral-700 mb-1">Nume și prenume *</label>
                <input name="full_name" value={form.full_name} onChange={handleChange} onBlur={handleBlur}
                  {...field('full_name')} placeholder="Ion Popescu" />
                {touched.full_name && errors.full_name && <p className="mt-1 text-xs text-red-600">{errors.full_name}</p>}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Email *</label>
                <input name="email" type="email" value={form.email} onChange={handleChange} onBlur={handleBlur}
                  {...field('email')} placeholder="ion@exemplu.ro" />
                {touched.email && errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
              </div>

              {/* Telefon */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Număr telefon *</label>
                <input name="phone" type="tel" value={form.phone} onChange={handleChange} onBlur={handleBlur}
                  {...field('phone')} placeholder="07xx xxx xxx" />
                {touched.phone && errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone}</p>}
              </div>

              {/* Tara - fixed */}
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-neutral-700 mb-1">Țară</label>
                <input value="România" readOnly
                  className="w-full rounded-md border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-500 cursor-not-allowed" />
              </div>

              {/* Județ */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Județ *</label>
                <select name="county" value={form.county} onChange={handleChange} onBlur={handleBlur}
                  {...field('county')}>
                  <option value="">Selectează județul</option>
                  {JUDETE.map(j => <option key={j} value={j}>{j}</option>)}
                </select>
                {touched.county && errors.county && <p className="mt-1 text-xs text-red-600">{errors.county}</p>}
              </div>

              {/* Localitate */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Localitate *</label>
                <input name="city" value={form.city} onChange={handleChange} onBlur={handleBlur}
                  list="city-options" {...field('city')}
                  placeholder={form.county ? 'Alege sau scrie' : 'Selectează mai întâi județul'} />
                <datalist id="city-options">
                  {cityOptions.map(c => <option key={c} value={c} />)}
                </datalist>
                {touched.city && errors.city && <p className="mt-1 text-xs text-red-600">{errors.city}</p>}
              </div>

              {/* Adresa */}
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-neutral-700 mb-1">Adresă (stradă, număr, bloc, apartament) *</label>
                <input name="address" value={form.address} onChange={handleChange} onBlur={handleBlur}
                  {...field('address')} placeholder="Str. Exemplu nr. 1, Ap. 2" />
                {touched.address && errors.address && <p className="mt-1 text-xs text-red-600">{errors.address}</p>}
              </div>

              {/* Cod postal */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Cod poștal *</label>
                <input name="postal_code" value={form.postal_code} onChange={handleChange} onBlur={handleBlur}
                  {...field('postal_code')} placeholder="400000" maxLength={6} />
                {touched.postal_code && errors.postal_code && <p className="mt-1 text-xs text-red-600">{errors.postal_code}</p>}
              </div>

              {/* Observatii */}
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-neutral-700 mb-1">Observații (opțional)</label>
                <textarea name="notes" value={form.notes} onChange={handleChange} rows={2}
                  className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Instrucțiuni speciale de livrare..." />
              </div>
            </div>
          </div>

          {submitError && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-3">{submitError}</p>
          )}

          <button type="submit" disabled={loading}
            className="w-full py-3 rounded-md bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            {loading ? 'Se procesează...' : `Plasează comanda – ${total.toFixed(2)} RON`}
          </button>

          <p className="text-xs text-center text-neutral-400">
            Plata se face la livrare (ramburs) sau prin transfer bancar după confirmare.
          </p>
        </form>

        {/* Order summary */}
        <div className="bg-white border border-neutral-200 rounded-lg p-6 h-fit sticky top-4">
          <h2 className="text-base font-semibold text-neutral-900 mb-4">Sumar comandă</h2>
          <ul className="divide-y divide-neutral-100 mb-4">
            {items.map(item => (
              <li key={item.id} className="py-2.5 flex justify-between text-sm">
                <span className="text-neutral-700">{item.name} <span className="text-neutral-400">×{item.quantity}</span></span>
                <span className="font-medium">{(item.price * item.quantity).toFixed(2)} RON</span>
              </li>
            ))}
          </ul>
          <div className="border-t border-neutral-200 pt-3 flex justify-between font-bold text-neutral-900 text-base">
            <span>Total</span>
            <span>{total.toFixed(2)} RON</span>
          </div>
        </div>
      </div>
    </div>
  )
}
