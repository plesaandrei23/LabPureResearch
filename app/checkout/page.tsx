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
  if (!form.full_name.trim() || form.full_name.trim().length < 3) e.full_name = 'Minim 3 caractere.'
  if (!EMAIL_RE.test(form.email)) e.email = 'Adresă de email invalidă.'
  if (!PHONE_RE.test(form.phone.replace(/\s/g, ''))) e.phone = 'Format valid: 07xxxxxxxx sau +40xxxxxxxxx'
  if (!form.address.trim() || form.address.trim().length < 5) e.address = 'Adresa trebuie să aibă minim 5 caractere.'
  if (!form.county) e.county = 'Selectează județul.'
  if (!form.city.trim()) e.city = 'Completează localitatea.'
  if (!POSTAL_RE.test(form.postal_code.trim())) e.postal_code = 'Codul poștal trebuie să aibă exact 6 cifre.'
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
    full_name: '', email: '', phone: '', address: '',
    county: '', city: '', postal_code: '', notes: '',
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

    setLoading(true)
    try {
      const orderId = crypto.randomUUID()

      const { error: orderErr } = await supabase
        .from('orders')
        .insert({
          id: orderId,
          user_id: userId ?? undefined,
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

      if (orderErr) throw orderErr

      const { error: itemsErr } = await supabase.from('order_items').insert(
        items.map(item => ({
          order_id: orderId,
          product_id: item.id,
          product_name: item.name,
          quantity: item.quantity,
          unit_price: item.price,
        })),
      )
      if (itemsErr) throw itemsErr

      await fetch('/api/notify-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
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
      router.push(`/checkout/confirmare?id=${orderId}`)
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : 'A apărut o eroare. Încearcă din nou.')
    } finally {
      setLoading(false)
    }
  }

  function inputClass(name: keyof FormState) {
    const err = touched[name] ? errors[name] : undefined
    return `w-full rounded-md border bg-[var(--surface)]/40 text-foreground px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:border-[var(--accent)] transition-colors ${
      err ? 'border-[var(--destructive)]/60' : 'border-[var(--border)]'
    } placeholder:text-muted-fg/60`
  }
  const labelClass = 'block text-xs font-semibold text-foreground mb-1.5 uppercase tracking-wider font-[family-name:var(--font-roboto-mono)]'
  const errClass = 'mt-1 text-xs text-[var(--destructive)]'

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto pt-32 pb-24 px-4 text-center">
        <p className="text-muted-fg mb-6">Coșul tău este gol.</p>
        <Link href="/produse" className="text-[var(--accent)] hover:underline">← Înapoi la produse</Link>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto pt-28 pb-12 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground mb-8 font-[family-name:var(--font-exo)]">
        Finalizare comandă
      </h1>

      {!userId && (
        <div className="liquid-glass mb-6 p-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
          <span className="inline-flex items-center justify-center h-9 w-9 rounded-full bg-[var(--accent)]/15 border border-[var(--accent)]/30 text-[var(--accent)] flex-shrink-0">
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <p className="text-sm text-foreground flex-1">
            <strong className="font-semibold">Comandă ca invitat.</strong>{' '}
            <span className="text-muted-fg">Niciun cont necesar — completează doar formularul de mai jos.</span>
          </p>
          <Link
            href="/cont/autentificare?redirect=/checkout"
            className="text-sm text-[var(--accent)] hover:underline font-medium whitespace-nowrap"
          >
            Sau autentifică-te →
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-5" noValidate>
          <div className="liquid-glass p-6">
            <h2 className="text-base font-semibold text-foreground mb-5 font-[family-name:var(--font-exo)]">
              Date de contact și livrare
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className={labelClass}>Nume și prenume *</label>
                <input name="full_name" value={form.full_name} onChange={handleChange} onBlur={handleBlur}
                  className={inputClass('full_name')} placeholder="Ion Popescu" />
                {touched.full_name && errors.full_name && <p className={errClass}>{errors.full_name}</p>}
              </div>

              <div>
                <label className={labelClass}>Email *</label>
                <input name="email" type="email" value={form.email} onChange={handleChange} onBlur={handleBlur}
                  className={inputClass('email')} placeholder="ion@exemplu.ro" />
                {touched.email && errors.email && <p className={errClass}>{errors.email}</p>}
              </div>

              <div>
                <label className={labelClass}>Telefon *</label>
                <input name="phone" type="tel" value={form.phone} onChange={handleChange} onBlur={handleBlur}
                  className={inputClass('phone')} placeholder="07xx xxx xxx" />
                {touched.phone && errors.phone && <p className={errClass}>{errors.phone}</p>}
              </div>

              <div className="sm:col-span-2">
                <label className={labelClass}>Țară</label>
                <input value="România" readOnly
                  className="w-full rounded-md border border-[var(--border)] bg-[var(--surface-2)]/40 px-3.5 py-2.5 text-sm text-muted-fg cursor-not-allowed" />
              </div>

              <div>
                <label className={labelClass}>Județ *</label>
                <select name="county" value={form.county} onChange={handleChange} onBlur={handleBlur}
                  className={inputClass('county')}>
                  <option value="">Selectează județul</option>
                  {JUDETE.map(j => <option key={j} value={j}>{j}</option>)}
                </select>
                {touched.county && errors.county && <p className={errClass}>{errors.county}</p>}
              </div>

              <div>
                <label className={labelClass}>Localitate *</label>
                <input name="city" value={form.city} onChange={handleChange} onBlur={handleBlur}
                  list="city-options" className={inputClass('city')}
                  placeholder={form.county ? 'Alege sau scrie' : 'Selectează mai întâi județul'} />
                <datalist id="city-options">
                  {cityOptions.map(c => <option key={c} value={c} />)}
                </datalist>
                {touched.city && errors.city && <p className={errClass}>{errors.city}</p>}
              </div>

              <div className="sm:col-span-2">
                <label className={labelClass}>Adresă *</label>
                <input name="address" value={form.address} onChange={handleChange} onBlur={handleBlur}
                  className={inputClass('address')} placeholder="Str. Exemplu nr. 1, Ap. 2" />
                {touched.address && errors.address && <p className={errClass}>{errors.address}</p>}
              </div>

              <div>
                <label className={labelClass}>Cod poștal *</label>
                <input name="postal_code" value={form.postal_code} onChange={handleChange} onBlur={handleBlur}
                  className={inputClass('postal_code')} placeholder="400000" maxLength={6} />
                {touched.postal_code && errors.postal_code && <p className={errClass}>{errors.postal_code}</p>}
              </div>

              <div className="sm:col-span-2">
                <label className={labelClass}>Observații (opțional)</label>
                <textarea name="notes" value={form.notes} onChange={handleChange} rows={2}
                  className="w-full rounded-md border border-[var(--border)] bg-[var(--surface)]/40 text-foreground px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:border-[var(--accent)] transition-colors placeholder:text-muted-fg/60"
                  placeholder="Instrucțiuni speciale de livrare..." />
              </div>
            </div>
          </div>

          {submitError && (
            <p className="liquid-glass text-sm text-[var(--destructive)] p-4">{submitError}</p>
          )}

          <button type="submit" disabled={loading}
            className="w-full py-3.5 rounded-full bg-[var(--accent)] text-[var(--accent-fg)] text-sm font-semibold hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed glow-accent">
            {loading ? 'Se procesează...' : `Plasează comanda — ${total.toFixed(2)} RON`}
          </button>

          <p className="text-xs text-center text-muted-fg">
            Plata se face la livrare (ramburs) sau prin transfer bancar după confirmare.
          </p>
        </form>

        <div className="liquid-glass p-6 h-fit lg:sticky lg:top-24">
          <h2 className="text-base font-semibold text-foreground mb-4 font-[family-name:var(--font-exo)]">
            Sumar comandă
          </h2>
          <ul className="divide-y divide-[var(--border)] mb-4">
            {items.map(item => (
              <li key={item.id} className="py-3 flex justify-between text-sm gap-3">
                <span className="text-foreground">
                  {item.name} <span className="text-muted-fg font-[family-name:var(--font-roboto-mono)]">×{item.quantity}</span>
                </span>
                <span className="font-semibold text-foreground font-[family-name:var(--font-roboto-mono)] whitespace-nowrap">
                  {(item.price * item.quantity).toFixed(2)} RON
                </span>
              </li>
            ))}
          </ul>
          <div className="border-t border-[var(--border)] pt-3 flex justify-between font-extrabold text-foreground text-lg font-[family-name:var(--font-exo)]">
            <span>Total</span>
            <span className="font-[family-name:var(--font-roboto-mono)]">{total.toFixed(2)} <span className="text-sm text-muted-fg">RON</span></span>
          </div>
        </div>
      </div>
    </div>
  )
}
