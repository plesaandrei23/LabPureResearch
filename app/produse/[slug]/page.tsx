import type { Metadata } from 'next'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import AddToCartButton from './AddToCartButton'

type Props = { params: Promise<{ slug: string }> }

async function getProduct(slug: string) {
  const supabase = createClient()
  const { data } = await supabase
    .from('products')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()
  return data
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const product = await getProduct(slug)
  if (!product) return { title: 'Produs negăsit' }
  return {
    title: product.name,
    description: product.short_desc ?? product.description ?? undefined,
  }
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params
  const product = await getProduct(slug)
  if (!product) notFound()

  return (
    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <nav className="flex mb-8 text-sm text-neutral-500">
        <a href="/" className="hover:text-blue-600">Acasă</a>
        <span className="mx-2">/</span>
        <a href="/produse" className="hover:text-blue-600">Produse</a>
        <span className="mx-2">/</span>
        <span className="text-neutral-900 font-medium">{product.name}</span>
      </nav>

      <div className="lg:grid lg:grid-cols-2 lg:gap-12">
        {/* Image */}
        <div className="relative bg-neutral-50 rounded-xl overflow-hidden" style={{ minHeight: '360px' }}>
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              className="object-contain p-8"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <svg className="h-24 w-24 text-neutral-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.8} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <h1 className="text-3xl font-extrabold text-neutral-900">{product.name}</h1>
          {product.category && (
            <span className="mt-2 inline-block text-xs font-semibold uppercase tracking-wide bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
              {product.category}
            </span>
          )}

          <div className="mt-4 text-2xl font-bold text-neutral-900">{product.price.toFixed(2)} RON</div>

          {product.purity && (
            <p className="mt-1 text-sm text-neutral-500">Puritate: <strong>{product.purity}</strong></p>
          )}

          {product.stock > 0 ? (
            <p className="mt-1 text-sm font-semibold text-green-600">✓ În stoc</p>
          ) : (
            <p className="mt-1 text-sm font-semibold text-red-500">✗ Stoc epuizat</p>
          )}

          {/* Kit Complet badge */}
          <div className="mt-5 bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm font-semibold text-green-800 mb-2">📦 Kit Complet – ce include:</p>
            <ul className="text-sm text-green-700 space-y-1">
              <li>✓ Peptidă liofilizată (doză indicată)</li>
              <li>✓ Apă bacteriostatică 10ml</li>
              <li>✓ Seringă de reconstituire</li>
            </ul>
          </div>

          <div className="mt-5 text-base text-neutral-700 leading-relaxed">
            {product.description}
          </div>

          <AddToCartButton product={product} />

          <div className="mt-8 border-t border-neutral-200 pt-6 space-y-3">
            <div className="flex items-start gap-3 text-sm text-neutral-500">
              <svg className="h-5 w-5 text-neutral-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              Livrare în 2-5 zile lucrătoare pe teritoriul României
            </div>
            <div className="flex items-start gap-3 text-sm text-neutral-500">
              <svg className="h-5 w-5 text-neutral-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Certificate de analiză disponibile la cerere
            </div>
            <div className="flex items-start gap-3 text-sm text-amber-700 bg-amber-50 rounded-md p-3 mt-4">
              <svg className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span><strong>Exclusiv pentru cercetare în laborator.</strong> Nu este destinat consumului uman.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
