import Link from 'next/link'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <nav className="bg-neutral-900 text-white px-4 py-3 flex items-center gap-6 text-sm">
        <span className="font-semibold text-neutral-300">Admin</span>
        <Link href="/admin/comenzi" className="hover:text-white text-neutral-400 font-medium transition-colors">
          Comenzi
        </Link>
        <Link href="/admin/produse" className="hover:text-white text-neutral-400 font-medium transition-colors">
          Produse
        </Link>
      </nav>
      {children}
    </div>
  )
}
