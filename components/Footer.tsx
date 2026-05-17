'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Footer() {
  const pathname = usePathname()
  if (pathname.startsWith('/admin')) return null

  return (
    <footer className="bg-[var(--surface-2)] border-t border-[var(--border)] mt-auto">
      <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <p className="text-lg font-semibold text-foreground font-[family-name:var(--font-exo)]">Peptide<span className="text-gradient">Research</span><span className="text-muted-fg">.ro</span></p>
            <p className="mt-2 text-sm text-muted-fg">Produse de înaltă puritate, exclusiv pentru cercetare în laborator.</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-foreground uppercase tracking-[0.2em] mb-3 font-[family-name:var(--font-roboto-mono)]">Navigare</p>
            <ul className="space-y-2 text-sm text-muted-fg">
              <li><Link href="/produse" className="hover:text-[var(--accent)] transition-colors">Produse</Link></li>
              <li><Link href="/calitate" className="hover:text-[var(--accent)] transition-colors">Calitate &amp; CoA</Link></li>
              <li><Link href="/contact" className="hover:text-[var(--accent)] transition-colors">Contact</Link></li>
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold text-foreground uppercase tracking-[0.2em] mb-3 font-[family-name:var(--font-roboto-mono)]">Cont</p>
            <ul className="space-y-2 text-sm text-muted-fg">
              <li><Link href="/cont/autentificare" className="hover:text-[var(--accent)] transition-colors">Autentificare</Link></li>
              <li><Link href="/cont/inregistrare" className="hover:text-[var(--accent)] transition-colors">Înregistrare</Link></li>
              <li><Link href="/contul-meu" className="hover:text-[var(--accent)] transition-colors">Comenzile mele</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-[var(--border)] pt-6 text-center">
          <p className="text-xs text-muted-fg max-w-3xl mx-auto">
            <strong>AVERTISMENT LEGAL:</strong> Toate produsele furnizate de PeptideResearch.ro sunt destinate exclusiv cercetării în laborator și nu sunt destinate consumului uman, utilizării ca supliment alimentar, medicament sau dispozitiv medical. Cumpărătorul confirmă că are cel puțin 18 ani și că utilizează produsele exclusiv în scopuri de cercetare.
          </p>
          <p className="mt-4 text-xs text-muted-fg">
            &copy; {new Date().getFullYear()} PeptideResearch.ro · Toate drepturile rezervate ·{' '}
            <Link href="/termeni" className="hover:text-foreground transition-colors">Termeni</Link>
            {' · '}
            <Link href="/confidentialitate" className="hover:text-foreground transition-colors">Confidențialitate</Link>
          </p>
        </div>
      </div>
    </footer>
  )
}
