'use client'

import Link from 'next/link'
import Image from 'next/image'
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

  function NavLink({ href, label }: { href: string; label: string }) {
    const active = pathname.startsWith(href)
    return (
      <Link
        href={href}
        className={`px-3 sm:px-4 py-1.5 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
          active
            ? 'bg-[var(--accent)] text-[var(--accent-fg)] glow-accent'
            : 'text-muted-fg hover:text-foreground hover:bg-[color-mix(in_oklab,var(--accent)_10%,transparent)]'
        }`}
      >
        {label}
      </Link>
    )
  }

  return (
    <header className="liquid-glass sticky top-0 z-50 rounded-none border-x-0 border-t-0">
      <div className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 flex items-center justify-between gap-2 h-14">

        {/* Left: logo + brand (brand text hides on mobile) */}
        <Link href="/admin/comenzi" className="flex items-center gap-2 flex-shrink-0">
          <Image src="/images/logo.png" alt="" width={28} height={28} className="object-contain h-7 w-7" priority />
          <span className="hidden sm:inline text-[11px] font-semibold tracking-[0.25em] uppercase text-muted-fg font-[family-name:var(--font-roboto-mono,monospace)]">
            Admin
          </span>
        </Link>

        {/* Center: tabs */}
        <nav className="flex items-center gap-1">
          <NavLink href="/admin/comenzi" label="Comenzi" />
          <NavLink href="/admin/produse" label="Produse" />
        </nav>

        {/* Right: sign-out (icon only on mobile) */}
        <button
          onClick={handleSignOut}
          aria-label="Ieși din cont"
          className="flex items-center gap-1.5 px-2 sm:px-3 h-9 rounded-full text-sm text-muted-fg hover:text-[var(--destructive)] hover:bg-[color-mix(in_oklab,var(--destructive)_10%,transparent)] transition-all font-medium"
        >
          <span className="hidden sm:inline">Ieși</span>
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </button>
      </div>
    </header>
  )
}
