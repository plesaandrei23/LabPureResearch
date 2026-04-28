'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { useCart } from './CartProvider'
import { createClient } from '@/lib/supabase'

export default function Navbar() {
  const pathname = usePathname()
  const { count } = useCart()

  if (pathname.startsWith('/admin')) return null
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

  async function handleSignOut() {
    await supabase.auth.signOut()
  }

  return (
    <nav className="bg-white border-b border-neutral-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link href="/" className="text-xl font-semibold tracking-tight text-neutral-900">
            Peptide<span className="text-blue-600">Research</span><span className="text-neutral-400 text-base">.ro</span>
          </Link>

          <div className="hidden md:flex space-x-6">
            <Link href="/produse" className="text-neutral-500 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors">
              Produse
            </Link>
            <Link href="/calitate" className="text-neutral-500 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors">
              Calitate
            </Link>
            <Link href="/contact" className="text-neutral-500 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors">
              Contact
            </Link>
          </div>

          <div className="flex items-center space-x-3">
            {user ? (
              <div className="hidden md:flex items-center space-x-3">
                <Link href="/contul-meu" className="text-sm text-neutral-600 hover:text-blue-600 font-medium">
                  Contul meu
                </Link>
                <button onClick={handleSignOut} className="text-sm text-neutral-400 hover:text-red-500 font-medium">
                  Ieși
                </button>
              </div>
            ) : (
              <div className="hidden md:flex items-center space-x-3">
                <Link href="/cont/autentificare" className="text-sm text-neutral-600 hover:text-blue-600 font-medium">
                  Autentificare
                </Link>
                <Link href="/cont/inregistrare" className="text-sm bg-blue-600 text-white px-3 py-1.5 rounded-md font-medium hover:bg-blue-700 transition-colors">
                  Înregistrare
                </Link>
              </div>
            )}

            <Link href="/cos" className="relative p-2 text-neutral-500 hover:text-blue-600 transition-colors" aria-label="Coș de cumpărături">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {count > 0 && (
                <span className="absolute -top-1 -right-1 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-blue-600 rounded-full">
                  {count}
                </span>
              )}
            </Link>

            <button
              className="md:hidden p-2 rounded-md text-neutral-400 hover:text-neutral-500 hover:bg-neutral-100"
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
        <div className="md:hidden border-t border-neutral-200 bg-white px-2 pt-2 pb-3 space-y-1">
          <Link href="/produse" className="block px-3 py-2 rounded-md text-base font-medium text-neutral-700 hover:bg-neutral-50" onClick={() => setMenuOpen(false)}>Produse</Link>
          <Link href="/calitate" className="block px-3 py-2 rounded-md text-base font-medium text-neutral-700 hover:bg-neutral-50" onClick={() => setMenuOpen(false)}>Calitate</Link>
          <Link href="/contact" className="block px-3 py-2 rounded-md text-base font-medium text-neutral-700 hover:bg-neutral-50" onClick={() => setMenuOpen(false)}>Contact</Link>
          {user ? (
            <>
              <Link href="/contul-meu" className="block px-3 py-2 rounded-md text-base font-medium text-neutral-700 hover:bg-neutral-50" onClick={() => setMenuOpen(false)}>Contul meu</Link>
              <button onClick={handleSignOut} className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-500 hover:bg-neutral-50">Ieși din cont</button>
            </>
          ) : (
            <>
              <Link href="/cont/autentificare" className="block px-3 py-2 rounded-md text-base font-medium text-neutral-700 hover:bg-neutral-50" onClick={() => setMenuOpen(false)}>Autentificare</Link>
              <Link href="/cont/inregistrare" className="block px-3 py-2 rounded-md text-base font-medium text-blue-600 hover:bg-neutral-50" onClick={() => setMenuOpen(false)}>Înregistrare</Link>
            </>
          )}
        </div>
      )}
    </nav>
  )
}
