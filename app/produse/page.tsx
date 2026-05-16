import type { Metadata } from 'next'
import { createServerSupabase } from '@/lib/supabase-server'
import ProductCard from '@/components/ProductCard'

export const metadata: Metadata = {
  title: 'Catalog Peptide',
  description: 'Catalog complet de peptide pentru cercetare: BPC-157, Semax, Selank, GHK-Cu, Retatrutida, Klow. Certificate HPLC, livrare în România.',
}

async function getProducts() {
  const supabase = await createServerSupabase()
  const { data } = await supabase
    .from('products')
    .select('*')
    .eq('is_active', true)
    .order('name')
  return data ?? []
}

export default async function ProduseePage() {
  const products = await getProducts()

  return (
    <div className="relative max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
      <div aria-hidden className="absolute inset-x-0 top-0 h-[480px] pointer-events-none -z-0 overflow-hidden">
        <div className="ambient-blob a" style={{ top: '5%', left: '8%', width: 360, height: 360, background: 'radial-gradient(circle, var(--accent-glow), transparent 70%)' }} />
        <div className="ambient-blob b" style={{ top: '15%', right: '8%', width: 320, height: 320, background: 'radial-gradient(circle, var(--accent-2-glow), transparent 70%)' }} />
      </div>

      <div className="relative text-center mb-14">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--accent)] mb-3 font-[family-name:var(--font-roboto-mono)]">Catalog complet</p>
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight font-[family-name:var(--font-exo)] text-foreground">Peptide pentru cercetare</h1>
        <p className="mt-4 text-lg text-muted-fg max-w-2xl mx-auto">Kit-uri complete cu apă bacteriostatică și seringă inclusă. Certificate HPLC la cerere.</p>
      </div>

      {products.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      ) : (
        <div className="liquid-glass text-center py-20">
          <svg className="mx-auto h-12 w-12 text-muted-fg opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
          </svg>
          <p className="mt-4 text-muted-fg">Produsele vor apărea după configurarea Supabase.</p>
        </div>
      )}
    </div>
  )
}
