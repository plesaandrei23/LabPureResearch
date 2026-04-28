'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

export default function AdminNav() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  function navLink(href: string, label: string) {
    const active = pathname.startsWith(href)
    return (
      <Link
        href={href}
        className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
          active
            ? 'bg-white text-neutral-900'
            : 'text-neutral-300 hover:text-white hover:bg-neutral-800'
        }`}
      >
        {label}
      </Link>
    )
  }

  return (
    <header className="bg-neutral-900 border-b border-neutral-700 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-14">

        {/* Left: brand */}
        <span className="text-sm font-semibold text-neutral-300 tracking-wide uppercase">
          Admin Panel
        </span>

        {/* Center: section tabs */}
        <nav className="flex items-center gap-1">
          {navLink('/admin/comenzi', 'Comenzi')}
          {navLink('/admin/produse', 'Produse')}
        </nav>

        {/* Right: sign out */}
        <button
          onClick={handleSignOut}
          className="flex items-center gap-1.5 text-sm text-neutral-400 hover:text-red-400 transition-colors font-medium"
        >
          Ieși
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </button>

      </div>
    </header>
  )
}
