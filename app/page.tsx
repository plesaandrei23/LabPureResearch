import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import ProductCard from '@/components/ProductCard'

async function getFeaturedProducts() {
  const supabase = createClient()
  const { data } = await supabase
    .from('products')
    .select('*')
    .eq('is_active', true)
    .limit(6)
  return data ?? []
}

export default async function HomePage() {
  const products = await getFeaturedProducts()

  return (
    <>
      {/* Hero */}
      <section className="bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto py-20 px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-block text-xs font-semibold uppercase tracking-widest text-blue-600 mb-4">
            Certificat HPLC · Livrare în România
          </span>
          <h1 className="text-4xl font-extrabold tracking-tight text-neutral-900 sm:text-5xl lg:text-6xl">
            Peptide de Înaltă Puritate<br className="hidden sm:block" />
            <span className="text-blue-600"> pentru Cercetare</span>
          </h1>
          <p className="mt-5 max-w-2xl mx-auto text-lg text-neutral-500">
            BPC-157, Semax, Selank, GHK-Cu, Retatrutida, Klow – toate cu certificate de analiză și puritate verificată ≥98%.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/produse" className="inline-flex items-center justify-center px-6 py-3 rounded-md bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors">
              Vezi toate produsele
            </Link>
            <Link href="/calitate" className="inline-flex items-center justify-center px-6 py-3 rounded-md border border-neutral-300 text-neutral-700 text-sm font-semibold hover:bg-neutral-50 transition-colors">
              Standarde de calitate
            </Link>
          </div>
        </div>
      </section>

      {/* Warning Banner */}
      <div className="bg-amber-50 border-b border-amber-200">
        <div className="max-w-7xl mx-auto py-3 px-4 text-center">
          <p className="text-sm font-medium text-amber-800">
            ⚠️ <strong>AVERTISMENT:</strong> Produsele sunt destinate exclusiv cercetării profesionale în laborator. Nu sunt destinate consumului uman. Trebuie să ai minim 18 ani.
          </p>
        </div>
      </div>

      {/* Products */}
      <section className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-neutral-900">Produse Recomandate</h2>
          <Link href="/produse" className="text-sm text-blue-600 hover:underline font-medium">
            Vezi toate →
          </Link>
        </div>
        {products.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        ) : (
          <div className="text-center py-20 text-neutral-500">
            <p>Produsele se încarcă. Configurează Supabase și rulează schema SQL.</p>
          </div>
        )}
      </section>

      {/* Features */}
      <section className="bg-white border-t border-neutral-200 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-2xl font-bold text-neutral-900 mb-12">De ce PeptideResearch?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="text-center">
              <div className="mx-auto h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">Puritate verificată HPLC</h3>
              <p className="text-sm text-neutral-500">Fiecare lot vine cu certificat de analiză (CoA) și rezultate HPLC disponibile la cerere.</p>
            </div>
            <div className="text-center">
              <div className="mx-auto h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">Ambalaj steril, livrare rapidă</h3>
              <p className="text-sm text-neutral-500">Peptidele sunt livrate liofilizate, în flakoane sigilate, cu gheață uscată pentru stabilitate.</p>
            </div>
            <div className="text-center">
              <div className="mx-auto h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">Plată și cont securizat</h3>
              <p className="text-sm text-neutral-500">Comandă cu cont securizat, urmărește statusul comenzilor și recomandă produse din istoricul tău.</p>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
