'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import type { Database } from '@/lib/supabase'

type Order = Database['public']['Tables']['orders']['Row'] & {
  order_items: Array<Database['public']['Tables']['order_items']['Row']>
}

type Profile = Database['public']['Tables']['profiles']['Row']

const STATUS_LABELS: Record<string, string> = {
  in_asteptare: 'În așteptare',
  confirmata: 'Confirmată',
  expediata: 'Expediată',
  livrata: 'Livrată',
  anulata: 'Anulată',
}

const STATUS_COLORS: Record<string, string> = {
  in_asteptare: 'bg-[var(--warning)]/15 text-[var(--warning)]',
  confirmata: 'bg-[var(--accent)]/15 text-[var(--accent)]',
  expediata: 'bg-[var(--accent-2)]/15 text-[var(--accent-2)]',
  livrata: 'bg-[var(--success)]/15 text-[var(--success)]',
  anulata: 'bg-[var(--destructive)]/15 text-[var(--destructive)]',
}

export default function ContulMeuPage() {
  const router = useRouter()
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [editMode, setEditMode] = useState(false)
  const [form, setForm] = useState({ full_name: '', phone: '', address: '', city: '', county: '', postal_code: '' })
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState('')

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) { router.push('/cont/autentificare'); return }

      const [{ data: prof }, { data: ords }] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', data.user.id).single(),
        supabase.from('orders').select('*, order_items(*)').eq('user_id', data.user.id).order('created_at', { ascending: false }),
      ])

      if (prof) {
        setProfile(prof)
        setForm({
          full_name: prof.full_name ?? '',
          phone: prof.phone ?? '',
          address: prof.address ?? '',
          city: prof.city ?? '',
          county: prof.county ?? '',
          postal_code: prof.postal_code ?? '',
        })
      }
      setOrders((ords ?? []) as Order[])
      setLoading(false)
    })
  }, [])

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  async function saveProfile() {
    if (!profile) return
    setSaving(true)
    await supabase.from('profiles').update(form).eq('id', profile.id)
    setProfile(p => p ? { ...p, ...form } : p)
    setEditMode(false)
    setSaveMsg('Profil actualizat!')
    setTimeout(() => setSaveMsg(''), 3000)
    setSaving(false)
  }

  if (loading) return <div className="pt-32 pb-24 text-center text-muted-fg">Se încarcă...</div>

  return (
    <div className="max-w-4xl mx-auto pt-28 pb-12 px-4 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-foreground mb-8">Contul meu</h1>

      {/* Profile section */}
      <div className="liquid-glass p-6 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-base font-semibold text-foreground">Date personale</h2>
          <button onClick={() => setEditMode(!editMode)} className="text-sm text-[var(--accent)] hover:underline">
            {editMode ? 'Anulează' : 'Editează'}
          </button>
        </div>

        {saveMsg && <p className="text-sm text-[var(--success)] mb-3">{saveMsg}</p>}

        {editMode ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { name: 'full_name', label: 'Nume complet', placeholder: 'Ion Popescu' },
              { name: 'phone', label: 'Telefon', placeholder: '07xx xxx xxx' },
              { name: 'address', label: 'Adresă', placeholder: 'Str. Exemplu nr. 1' },
              { name: 'city', label: 'Oraș', placeholder: 'Cluj-Napoca' },
              { name: 'county', label: 'Județ', placeholder: 'Cluj' },
              { name: 'postal_code', label: 'Cod poștal', placeholder: '400000' },
            ].map(f => (
              <div key={f.name} className={f.name === 'address' ? 'sm:col-span-2' : ''}>
                <label className="block text-sm font-medium text-foreground mb-1">{f.label}</label>
                <input
                  name={f.name}
                  value={(form as Record<string, string>)[f.name]}
                  onChange={handleChange}
                  placeholder={f.placeholder}
                  className="w-full rounded-md border border-[var(--border)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
                />
              </div>
            ))}
            <div className="sm:col-span-2">
              <button onClick={saveProfile} disabled={saving}
                className="px-5 py-2 rounded-md bg-[var(--accent)] text-[var(--accent-fg)] text-sm font-semibold hover:brightness-110 disabled:opacity-50">
                {saving ? 'Se salvează...' : 'Salvează'}
              </button>
            </div>
          </div>
        ) : (
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div><dt className="text-muted-fg">Nume</dt><dd className="font-medium">{profile?.full_name || '—'}</dd></div>
            <div><dt className="text-muted-fg">Telefon</dt><dd className="font-medium">{profile?.phone || '—'}</dd></div>
            <div><dt className="text-muted-fg">Adresă</dt><dd className="font-medium">{profile?.address || '—'}</dd></div>
            <div><dt className="text-muted-fg">Oraș</dt><dd className="font-medium">{profile?.city || '—'}</dd></div>
            <div><dt className="text-muted-fg">Județ</dt><dd className="font-medium">{profile?.county || '—'}</dd></div>
            <div><dt className="text-muted-fg">Cod poștal</dt><dd className="font-medium">{profile?.postal_code || '—'}</dd></div>
          </dl>
        )}
      </div>

      {/* Orders */}
      <div className="liquid-glass p-6">
        <h2 className="text-base font-semibold text-foreground mb-4">Istoricul comenzilor</h2>
        {orders.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-sm text-muted-fg mb-4">Nu ai nicio comandă încă.</p>
            <Link href="/produse" className="text-[var(--accent)] text-sm hover:underline">Explorează produsele →</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map(order => (
              <div key={order.id} className="border border-[var(--border)] rounded-md p-4">
                <div className="flex flex-wrap justify-between items-start gap-2 mb-3">
                  <div>
                    <p className="text-xs text-muted-fg font-mono">#{order.id.slice(0, 8).toUpperCase()}</p>
                    <p className="text-xs text-muted-fg">{new Date(order.created_at).toLocaleDateString('ro-RO')}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_COLORS[order.status] ?? 'bg-[var(--surface-2)] text-muted-fg'}`}>
                      {STATUS_LABELS[order.status] ?? order.status}
                    </span>
                    <span className="text-sm font-bold text-foreground">{order.total_amount.toFixed(2)} RON</span>
                  </div>
                </div>
                <ul className="text-sm text-foreground space-y-1">
                  {order.order_items.map(item => (
                    <li key={item.id} className="flex justify-between">
                      <span>{item.product_name} × {item.quantity}</span>
                      <span>{(item.unit_price * item.quantity).toFixed(2)} RON</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
