'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'motion/react'
import { useCart } from './CartProvider'
import { useState } from 'react'

type Product = {
  id: string
  name: string
  slug: string
  short_desc: string | null
  purity: string | null
  price: number
  stock: number
  category: string | null
  image_url: string | null
}

export default function ProductCard({ product }: { product: Product }) {
  const { addItem, items } = useCart()
  const [added, setAdded] = useState(false)
  const inCart = items.some(i => i.id === product.id)

  function handleAdd() {
    addItem({
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      purity: product.purity,
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ type: 'spring', stiffness: 320, damping: 24 }}
      className="group relative bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius)] p-4 flex flex-col overflow-hidden hover:border-[var(--accent)]/40 hover:shadow-[0_20px_60px_-20px_var(--accent-glow)] transition-[border-color,box-shadow] duration-300"
    >
      {/* glow ring on hover */}
      <div aria-hidden className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
           style={{ background: 'radial-gradient(circle at 50% 0%, var(--accent-glow), transparent 60%)' }} />

      <Link href={`/produse/${product.slug}`} className="block relative">
        <div className="relative h-44 bg-[var(--surface-2)] rounded-md flex items-center justify-center mb-4 overflow-hidden">
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              className="object-contain p-4 transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />
          ) : (
            <svg className="h-14 w-14 text-[var(--muted-fg)] opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
          )}
        </div>
        <h3 className="text-sm font-semibold text-foreground group-hover:text-[var(--accent)] transition-colors">
          {product.name}
        </h3>
        {product.purity && (
          <p className="mt-1 text-xs text-muted-fg font-[family-name:var(--font-roboto-mono)]">
            Puritate · {product.purity}
          </p>
        )}
      </Link>

      <div className="mt-auto pt-4 flex items-center justify-between relative">
        <span className="text-lg font-bold text-foreground font-[family-name:var(--font-roboto-mono)]">
          {product.price.toFixed(2)} <span className="text-xs text-muted-fg">RON</span>
        </span>
        {product.stock > 0 ? (
          <span className="text-[10px] text-[var(--success)] font-semibold uppercase tracking-wider">În stoc</span>
        ) : (
          <span className="text-[10px] text-[var(--destructive)] font-semibold uppercase tracking-wider">Epuizat</span>
        )}
      </div>

      <button
        onClick={handleAdd}
        disabled={product.stock === 0}
        className={`mt-3 w-full py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 relative ${
          added
            ? 'bg-[var(--success)] text-white'
            : inCart
            ? 'bg-[var(--surface-2)] text-[var(--accent)] border border-[var(--accent)]/40 hover:border-[var(--accent)]'
            : 'bg-[var(--accent)] text-[var(--accent-fg)] hover:brightness-110 disabled:bg-[var(--surface-2)] disabled:text-[var(--muted-fg)] disabled:cursor-not-allowed glow-accent'
        }`}
      >
        {added ? '✓ Adăugat' : inCart ? 'În coș' : 'Adaugă în coș'}
      </button>
    </motion.div>
  )
}
