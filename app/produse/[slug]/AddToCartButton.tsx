'use client'

import { useCart } from '@/components/CartProvider'
import { useState } from 'react'

type Product = {
  id: string
  name: string
  slug: string
  price: number
  purity: string | null
  stock: number
}

export default function AddToCartButton({ product }: { product: Product }) {
  const { addItem, items } = useCart()
  const [added, setAdded] = useState(false)
  const inCart = items.some(i => i.id === product.id)

  function handleAdd() {
    addItem({ id: product.id, name: product.name, slug: product.slug, price: product.price, purity: product.purity })
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  if (product.stock === 0) {
    return (
      <button disabled className="liquid-glass mt-6 w-full py-3 px-6 text-sm font-semibold cursor-not-allowed text-muted-fg opacity-60">
        Stoc epuizat
      </button>
    )
  }

  return (
    <button
      onClick={handleAdd}
      className={`mt-6 w-full py-3.5 px-6 rounded-full text-sm font-semibold transition-all duration-200 ${
        added
          ? 'bg-[var(--success)] text-white'
          : inCart
          ? 'liquid-glass text-[var(--accent)] hover:brightness-105'
          : 'bg-[var(--accent)] text-[var(--accent-fg)] hover:brightness-110 glow-accent'
      }`}
    >
      {added ? '✓ Adăugat în coș' : inCart ? 'Deja în coș — adaugă din nou' : 'Adaugă în coș'}
    </button>
  )
}
