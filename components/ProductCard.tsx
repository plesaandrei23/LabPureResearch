'use client'

import Link from 'next/link'
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
    <div className="group relative bg-white border border-neutral-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200 flex flex-col">
      <Link href={`/produse/${product.slug}`} className="block">
        <div className="h-44 bg-neutral-50 rounded-md flex items-center justify-center mb-4 group-hover:opacity-80 transition-opacity">
          {product.image_url ? (
            <img src={product.image_url} alt={product.name} className="h-full w-full object-contain p-4" />
          ) : (
            <svg className="h-14 w-14 text-neutral-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
          )}
        </div>
        <h3 className="text-sm font-semibold text-neutral-800 group-hover:text-blue-600 transition-colors">{product.name}</h3>
        {product.short_desc && (
          <p className="mt-1 text-xs text-neutral-500 line-clamp-2">{product.short_desc}</p>
        )}
        {product.purity && (
          <p className="mt-1 text-xs text-neutral-400">Puritate: {product.purity}</p>
        )}
      </Link>

      <div className="mt-auto pt-4 flex items-center justify-between">
        <span className="text-lg font-bold text-neutral-900">{product.price.toFixed(2)} RON</span>
        {product.stock > 0 ? (
          <span className="text-xs text-green-600 font-semibold uppercase tracking-wide">În stoc</span>
        ) : (
          <span className="text-xs text-red-500 font-semibold uppercase tracking-wide">Stoc epuizat</span>
        )}
      </div>

      <button
        onClick={handleAdd}
        disabled={product.stock === 0}
        className={`mt-3 w-full py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
          added
            ? 'bg-green-500 text-white'
            : inCart
            ? 'bg-green-50 text-green-700 border border-green-300 hover:bg-green-100'
            : 'bg-blue-600 text-white hover:bg-blue-700 disabled:bg-neutral-200 disabled:text-neutral-400 disabled:cursor-not-allowed'
        }`}
      >
        {added ? '✓ Adăugat!' : inCart ? 'În coș' : 'Adaugă în coș'}
      </button>
    </div>
  )
}
