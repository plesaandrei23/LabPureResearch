'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') ?? '/contul-meu'
  const supabase = createClient()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(searchParams.get('error') === 'link-invalid' ? 'Linkul de confirmare este invalid sau a expirat. Încearcă din nou.' : '')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      if (error.message.toLowerCase().includes('email not confirmed')) {
        setError('Emailul nu a fost confirmat. Verifică inbox-ul și apasă linkul de confirmare.')
      } else {
        setError('Email sau parolă incorectă.')
      }
    } else {
      const dest = data.user?.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL
        ? '/admin/comenzi'
        : redirect
      router.push(dest)
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center pt-28 pb-12 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-semibold text-foreground">
            Peptide<span className="text-[var(--accent)]">Research</span><span className="text-muted-fg">.ro</span>
          </Link>
          <h1 className="mt-4 text-xl font-bold text-foreground">Autentificare</h1>
          <p className="mt-1 text-sm text-muted-fg">
            Nu ai cont?{' '}
            <Link href="/cont/inregistrare" className="text-[var(--accent)] hover:underline font-medium">
              Înregistrează-te
            </Link>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="liquid-glass p-8 space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full rounded-md border border-[var(--border)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
              placeholder="ion@exemplu.ro"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Parolă</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="w-full rounded-md border border-[var(--border)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
              placeholder="••••••••"
            />
          </div>

          {error && <p className="text-sm text-[var(--destructive)] bg-[var(--destructive)]/10 rounded-md p-2">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-md bg-[var(--accent)] text-[var(--accent-fg)] text-sm font-semibold hover:brightness-110 transition-colors disabled:opacity-50"
          >
            {loading ? 'Se procesează...' : 'Autentifică-te'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default function AutentificiarePage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}
