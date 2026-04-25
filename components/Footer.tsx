import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-neutral-100 border-t border-neutral-200 mt-auto">
      <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <p className="text-lg font-semibold text-neutral-900">Peptide<span className="text-blue-600">Research</span><span className="text-neutral-400">.ro</span></p>
            <p className="mt-2 text-sm text-neutral-500">Materiale de referință de înaltă puritate, exclusiv pentru cercetare în laborator.</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-neutral-700 uppercase tracking-wide mb-3">Navigare</p>
            <ul className="space-y-2 text-sm text-neutral-500">
              <li><Link href="/produse" className="hover:text-blue-600">Produse</Link></li>
              <li><Link href="/calitate" className="hover:text-blue-600">Calitate &amp; CoA</Link></li>
              <li><Link href="/contact" className="hover:text-blue-600">Contact</Link></li>
            </ul>
          </div>
          <div>
            <p className="text-sm font-semibold text-neutral-700 uppercase tracking-wide mb-3">Cont</p>
            <ul className="space-y-2 text-sm text-neutral-500">
              <li><Link href="/cont/autentificare" className="hover:text-blue-600">Autentificare</Link></li>
              <li><Link href="/cont/inregistrare" className="hover:text-blue-600">Înregistrare</Link></li>
              <li><Link href="/contul-meu" className="hover:text-blue-600">Comenzile mele</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-neutral-200 pt-6 text-center">
          <p className="text-xs text-neutral-400 max-w-3xl mx-auto">
            <strong>AVERTISMENT LEGAL:</strong> Toate produsele furnizate de PeptideResearch.ro sunt destinate exclusiv cercetării în laborator și nu sunt destinate consumului uman, utilizării ca supliment alimentar, medicament sau dispozitiv medical. Cumpărătorul confirmă că are cel puțin 18 ani și că utilizează produsele exclusiv în scopuri de cercetare.
          </p>
          <p className="mt-4 text-xs text-neutral-400">
            &copy; {new Date().getFullYear()} PeptideResearch.ro · Toate drepturile rezervate ·{' '}
            <Link href="/termeni" className="hover:text-neutral-600">Termeni</Link>
            {' · '}
            <Link href="/confidentialitate" className="hover:text-neutral-600">Confidențialitate</Link>
          </p>
        </div>
      </div>
    </footer>
  )
}
