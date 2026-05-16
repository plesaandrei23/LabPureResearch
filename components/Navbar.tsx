'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { useCart } from './CartProvider'
import { createClient } from '@/lib/supabase'
import ThemeToggle from './ThemeToggle'

export default function Navbar() {
  const pathname = usePathname()
  const { count } = useCart()
  const [menuOpen, setMenuOpen] = useState(false)
  const [user, setUser] = useState<{ email?: string } | null>(null)
  const [scrolled, setScrolled] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user ?? null))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null)
    })
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      subscription.unsubscribe()
      window.removeEventListener('scroll', onScroll)
    }
  }, [])

  if (pathname.startsWith('/admin')) return null

  async function handleSignOut() {
    await supabase.auth.signOut()
  }

  return (
    <nav
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled ? 'glass shadow-[0_8px_30px_-12px_rgba(0,0,0,0.15)]' : 'bg-transparent border-b border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link href="/" className="text-xl font-semibold tracking-tight text-foreground">
            <span className="font-[family-name:var(--font-exo)]">Peptide</span>
            <span className="text-gradient">Research</span>
            <span className="text-muted-fg text-base">.ro</span>
          </Link>

          <div className="hidden md:flex space-x-6">
            <Link href="/produse" className="text-muted-fg hover:text-[var(--accent)] px-3 py-2 text-sm font-medium transition-colors">
              Produse
            </Link>
            <Link href="/calitate" className="text-muted-fg hover:text-[var(--accent)] px-3 py-2 text-sm font-medium transition-colors">
              Calitate
            </Link>
            <Link href="/contact" className="text-muted-fg hover:text-[var(--accent)] px-3 py-2 text-sm font-medium transition-colors">
              Contact
            </Link>
          </div>

          <div className="flex items-center space-x-3">
            {user ? (
              <div className="hidden md:flex items-center space-x-3">
                <Link href="/contul-meu" className="text-sm text-foreground hover:text-[var(--accent)] font-medium">
                  Contul meu
                </Link>
                <button onClick={handleSignOut} className="text-sm text-muted-fg hover:text-[var(--destructive)] font-medium">
                  Ieși
                </button>
              </div>
            ) : (
              <div className="hidden md:flex items-center space-x-3">
                <Link href="/cont/autentificare" className="text-sm text-foreground hover:text-[var(--accent)] font-medium">
                  Autentificare
                </Link>
                <Link
                  href="/cont/inregistrare"
                  className="text-sm bg-[var(--accent)] text-[var(--accent-fg)] px-3 py-1.5 rounded-md font-medium hover:brightness-110 transition-all glow-accent"
                >
                  Înregistrare
                </Link>
              </div>
            )}

            <ThemeToggle />

            <Link href="/cos" className="relative p-2 text-muted-fg hover:text-[var(--accent)] transition-colors" aria-label="Coș de cumpărături">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {count > 0 && (
                <span className="absolute -top-1 -right-1 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-[var(--accent-fg)] bg-[var(--accent)] rounded-full">
                  {count}
                </span>
              )}
            </Link>

            <button
              className="md:hidden p-2 rounded-md text-muted-fg hover:text-foreground hover:bg-[var(--surface-2)]"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden glass px-2 pt-2 pb-3 space-y-1">
          <Link href="/produse" className="block px-3 py-2 rounded-md text-base font-medium text-foreground hover:bg-[var(--surface-2)]" onClick={() => setMenuOpen(false)}>Produse</Link>
          <Link href="/calitate" className="block px-3 py-2 rounded-md text-base font-medium text-foreground hover:bg-[var(--surface-2)]" onClick={() => setMenuOpen(false)}>Calitate</Link>
          <Link href="/contact" className="block px-3 py-2 rounded-md text-base font-medium text-foreground hover:bg-[var(--surface-2)]" onClick={() => setMenuOpen(false)}>Contact</Link>
          {user ? (
            <>
              <Link href="/contul-meu" className="block px-3 py-2 rounded-md text-base font-medium text-foreground hover:bg-[var(--surface-2)]" onClick={() => setMenuOpen(false)}>Contul meu</Link>
              <button onClick={handleSignOut} className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-[var(--destructive)] hover:bg-[var(--surface-2)]">Ieși din cont</button>
            </>
          ) : (
            <>
              <Link href="/cont/autentificare" className="block px-3 py-2 rounded-md text-base font-medium text-foreground hover:bg-[var(--surface-2)]" onClick={() => setMenuOpen(false)}>Autentificare</Link>
              <Link href="/cont/inregistrare" className="block px-3 py-2 rounded-md text-base font-medium text-[var(--accent)] hover:bg-[var(--surface-2)]" onClick={() => setMenuOpen(false)}>Înregistrare</Link>
            </>
          )}
        </div>
      )}
    </nav>
  )
}
