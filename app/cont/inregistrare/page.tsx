'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

export default function InregistrarePage() {
  const router = useRouter()
  const supabase = createClient()

  const [form, setForm] = useState({ full_name: '', email: '', password: '', confirm: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (form.password !== form.confirm) {
      setError('Parolele nu coincid.')
      return
    }
    if (form.password.length < 6) {
      setError('Parola trebuie să aibă minim 6 caractere.')
      return
    }

    setLoading(true)
    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: { data: { full_name: form.full_name } },
    })
    setLoading(false)

    if (error) {
      setError(error.message === 'User already registered' ? 'Există deja un cont cu acest email.' : error.message)
    } else {
      setSuccess(true)
    }
  }

  if (success) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-sm text-center">
          <div className="mx-auto h-14 w-14 rounded-full bg-green-100 flex items-center justify-center mb-4">
            <svg className="h-7 w-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-neutral-900 mb-2">Cont creat cu succes!</h2>
          <p className="text-sm text-neutral-500 mb-6">Verifică-ți emailul pentru a confirma adresa, apoi autentifică-te.</p>
          <Link href="/cont/autentificare" className="text-blue-600 hover:underline text-sm font-medium">
            Mergi la autentificare →
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-semibold text-neutral-900">
            Peptid<span className="text-blue-600">Lab</span>
          </Link>
          <h1 className="mt-4 text-xl font-bold text-neutral-900">Creează cont</h1>
          <p className="mt-1 text-sm text-neutral-500">
            Ai deja cont?{' '}
            <Link href="/cont/autentificare" className="text-blue-600 hover:underline font-medium">
              Autentifică-te
            </Link>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white border border-neutral-200 rounded-lg p-8 shadow-sm space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Nume complet</label>
            <input name="full_name" value={form.full_name} onChange={handleChange} required
              className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ion Popescu" />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Email</label>
            <input name="email" type="email" value={form.email} onChange={handleChange} required
              className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="ion@exemplu.ro" />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Parolă</label>
            <input name="password" type="password" value={form.password} onChange={handleChange} required
              className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="minim 6 caractere" />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Confirmă parola</label>
            <input name="confirm" type="password" value={form.confirm} onChange={handleChange} required
              className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••" />
          </div>

          {error && <p className="text-sm text-red-600 bg-red-50 rounded-md p-2">{error}</p>}

          <p className="text-xs text-neutral-400">
            Prin înregistrare confirmi că ai minim 18 ani și că vei utiliza produsele exclusiv în scopuri de cercetare.
          </p>

          <button type="submit" disabled={loading}
            className="w-full py-2.5 rounded-md bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50">
            {loading ? 'Se procesează...' : 'Creează cont'}
          </button>
        </form>
      </div>
    </div>
  )
}
