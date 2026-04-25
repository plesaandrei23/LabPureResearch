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
    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-extrabold text-neutral-900 sm:text-4xl">Catalog Peptide</h1>
        <p className="mt-3 text-lg text-neutral-500">Kit-uri complete cu apă bacteriostatică și seringă inclusă.</p>
      </div>

      {products.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      ) : (
        <div className="text-center py-20 border-2 border-dashed border-neutral-200 rounded-lg">
          <svg className="mx-auto h-12 w-12 text-neutral-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
          </svg>
          <p className="mt-4 text-neutral-500">Produsele vor apărea după configurarea Supabase.</p>
        </div>
      )}
    </div>
  )
}
