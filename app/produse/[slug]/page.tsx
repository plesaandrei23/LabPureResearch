import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createServerSupabase } from '@/lib/supabase-server'
import AddToCartButton from './AddToCartButton'

type Props = { params: Promise<{ slug: string }> }

async function getProduct(slug: string) {
  const supabase = await createServerSupabase()
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
    <div className="relative max-w-7xl mx-auto pt-28 pb-12 px-4 sm:px-6 lg:px-8">
      <nav className="flex mb-8 text-sm text-muted-fg font-[family-name:var(--font-roboto-mono)]">
        <Link href="/" className="hover:text-[var(--accent)] transition-colors">Acasă</Link>
        <span className="mx-2 opacity-50">/</span>
        <Link href="/produse" className="hover:text-[var(--accent)] transition-colors">Produse</Link>
        <span className="mx-2 opacity-50">/</span>
        <span className="text-foreground font-medium">{product.name}</span>
      </nav>

      <div className="lg:grid lg:grid-cols-2 lg:gap-12">
        <div className="liquid-glass relative overflow-hidden flex items-center justify-center" style={{ minHeight: '420px' }}>
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              className="object-contain p-10"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
            />
          ) : (
            <svg className="h-24 w-24 text-muted-fg opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.8} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
          )}
        </div>

        <div className="mt-8 lg:mt-0">
          {product.category && (
            <span className="liquid-glass liquid-glass-pill inline-block text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--accent)] px-3 py-1 mb-4 font-[family-name:var(--font-roboto-mono)]">
              {product.category}
            </span>
          )}

          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-foreground font-[family-name:var(--font-exo)] leading-tight">
            {product.name}
          </h1>

          <div className="mt-6 flex items-baseline gap-3">
            <span className="text-3xl font-bold text-foreground font-[family-name:var(--font-roboto-mono)]">
              {product.price.toFixed(2)}
            </span>
            <span className="text-sm text-muted-fg font-[family-name:var(--font-roboto-mono)]">RON</span>
            {product.stock > 0 ? (
              <span className="ml-auto text-xs font-semibold uppercase tracking-wider text-[var(--success)]">În stoc</span>
            ) : (
              <span className="ml-auto text-xs font-semibold uppercase tracking-wider text-[var(--destructive)]">Stoc epuizat</span>
            )}
          </div>

          {product.purity && (
            <p className="mt-2 text-sm text-muted-fg font-[family-name:var(--font-roboto-mono)]">
              Puritate · <strong className="text-foreground">{product.purity}</strong>
            </p>
          )}

          <div className="liquid-glass mt-6 p-5">
            <p className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <span className="inline-flex items-center justify-center h-6 w-6 rounded-md bg-[var(--accent)]/15 border border-[var(--accent)]/30 text-[var(--accent)]">
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </span>
              Kit Complet — ce include
            </p>
            <ul className="text-sm text-muted-fg space-y-2 pl-2">
              <li className="flex gap-2"><span className="text-[var(--accent)]">·</span> Peptidă liofilizată (doza indicată)</li>
              <li className="flex gap-2"><span className="text-[var(--accent)]">·</span> Apă bacteriostatică 3ml</li>
              <li className="flex gap-2"><span className="text-[var(--accent)]">·</span> Seringi de reconstituire</li>
            </ul>
          </div>

          <div className="mt-6 text-base text-muted-fg leading-relaxed">
            {product.description}
          </div>

          <AddToCartButton product={product} />
        </div>
      </div>
    </div>
  )
}
