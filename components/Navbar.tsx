'use client'

import Link from 'next/link'
import { useEffect, useState, type ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import { useCart } from './CartProvider'
import { createClient } from '@/lib/supabase'
import ThemeToggle from './ThemeToggle'

export default function Navbar() {
  const pathname = usePathname()
  const { count } = useCart()
  const [menuOpen, setMenuOpen] = useState(false)
  const [user, setUser] = useState<{ email?: string } | null>(null)
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user ?? null))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  if (pathname.startsWith('/admin')) return null

  async function handleSignOut() {
    await supabase.auth.signOut()
  }

  return (
    <>
      {/* Desktop floating pill */}
      <nav className="hidden md:block fixed top-3 left-1/2 -translate-x-1/2 z-50 w-[min(96vw,1040px)]">
        <div className="liquid-glass liquid-glass-strong liquid-glass-pill flex items-center px-2 py-1.5 gap-1">
          <Link
            href="/"
            className="px-3 py-1.5 text-sm font-semibold tracking-tight text-foreground font-[family-name:var(--font-exo)] whitespace-nowrap"
          >
            Peptide<span className="text-gradient">Research</span>
            <span className="text-muted-fg">.ro</span>
          </Link>

          <span className="h-5 w-px bg-[var(--border)] mx-2" />

          <div className="flex items-center gap-0.5">
            <NavLink href="/produse" current={pathname === '/produse'}>Produse</NavLink>
            <NavLink href="/calitate" current={pathname === '/calitate'}>Calitate</NavLink>
            <NavLink href="/contact" current={pathname === '/contact'}>Contact</NavLink>
          </div>

          <div className="flex-1" />

          <div className="flex items-center gap-1">
            <ThemeToggle />

            <Link
              href="/cos"
              className="relative inline-flex items-center justify-center h-9 w-9 rounded-full text-muted-fg hover:text-[var(--accent)] hover:bg-[color-mix(in_oklab,var(--accent)_15%,transparent)] transition-colors"
              aria-label="Coș"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                <path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {count > 0 && (
                <span className="absolute -top-0.5 -right-0.5 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-[var(--accent-fg)] bg-[var(--accent)] rounded-full">
                  {count}
                </span>
              )}
            </Link>

            {user ? (
              <div className="flex items-center gap-1 ml-1">
                <Link
                  href="/contul-meu"
                  className="px-3 h-9 inline-flex items-center text-sm font-medium text-foreground hover:text-[var(--accent)] transition-colors"
                >
                  Cont
                </Link>
                <button
                  onClick={handleSignOut}
                  className="px-3 h-9 inline-flex items-center text-sm font-medium text-muted-fg hover:text-[var(--destructive)] transition-colors"
                >
                  Ieși
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1 ml-1">
                <Link
                  href="/cont/autentificare"
                  className="px-3 h-9 inline-flex items-center text-sm font-medium text-foreground hover:text-[var(--accent)] transition-colors"
                >
                  Intră
                </Link>
                <Link
                  href="/cont/inregistrare"
                  className="px-4 h-9 inline-flex items-center rounded-full bg-[var(--accent)] text-[var(--accent-fg)] text-sm font-semibold hover:brightness-110 transition-all glow-accent"
                >
                  Cont nou
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile compact pill */}
      <nav className="md:hidden fixed top-3 left-1/2 -translate-x-1/2 z-50 w-[min(96vw,520px)]">
        <div className="liquid-glass liquid-glass-strong liquid-glass-pill flex items-center pl-3 pr-2 py-1.5 gap-1.5">
          <Link href="/" className="text-[13px] font-semibold tracking-tight text-foreground font-[family-name:var(--font-exo)] whitespace-nowrap">
            Peptide<span className="text-gradient">Research</span>
            <span className="text-muted-fg">.ro</span>
          </Link>
          <div className="flex-1" />
          <ThemeToggle />
          <Link href="/cos" className="relative p-1.5 text-foreground" aria-label="Coș">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {count > 0 && (
              <span className="absolute -top-0.5 -right-0.5 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-[var(--accent-fg)] bg-[var(--accent)] rounded-full">
                {count}
              </span>
            )}
          </Link>
          <button onClick={() => setMenuOpen(!menuOpen)} aria-label="Meniu" className="p-1.5 text-foreground">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
        {menuOpen && (
          <div className="liquid-glass mt-2 p-3 space-y-0.5 rounded-2xl">
            <MobileLink href="/produse" onClick={() => setMenuOpen(false)}>Produse</MobileLink>
            <MobileLink href="/calitate" onClick={() => setMenuOpen(false)}>Calitate</MobileLink>
            <MobileLink href="/contact" onClick={() => setMenuOpen(false)}>Contact</MobileLink>
            <span className="block h-px bg-[var(--border)] my-2" />
            {user ? (
              <>
                <MobileLink href="/contul-meu" onClick={() => setMenuOpen(false)}>Contul meu</MobileLink>
                <button
                  onClick={() => { handleSignOut(); setMenuOpen(false) }}
                  className="block w-full text-left px-3 py-2 rounded-md text-sm font-medium text-[var(--destructive)] hover:bg-[var(--surface-2)]"
                >
                  Ieși din cont
                </button>
              </>
            ) : (
              <>
                <MobileLink href="/cont/autentificare" onClick={() => setMenuOpen(false)}>Autentificare</MobileLink>
                <MobileLink href="/cont/inregistrare" onClick={() => setMenuOpen(false)} accent>Înregistrare</MobileLink>
              </>
            )}
          </div>
        )}
      </nav>
    </>
  )
}

function NavLink({ href, current, children }: { href: string; current?: boolean; children: ReactNode }) {
  return (
    <Link
      href={href}
      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
        current
          ? 'text-[var(--accent)] bg-[color-mix(in_oklab,var(--accent)_15%,transparent)]'
          : 'text-muted-fg hover:text-foreground hover:bg-[color-mix(in_oklab,var(--accent)_8%,transparent)]'
      }`}
    >
      {children}
    </Link>
  )
}

function MobileLink({
  href,
  onClick,
  children,
  accent,
}: {
  href: string
  onClick: () => void
  children: ReactNode
  accent?: boolean
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
        accent ? 'text-[var(--accent)]' : 'text-foreground hover:text-[var(--accent)]'
      } hover:bg-[var(--surface-2)]`}
    >
      {children}
    </Link>
  )
}
