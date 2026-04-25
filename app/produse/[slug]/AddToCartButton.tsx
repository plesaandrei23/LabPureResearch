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
      <button disabled className="mt-6 w-full py-3 px-6 rounded-md bg-neutral-200 text-neutral-400 text-sm font-semibold cursor-not-allowed">
        Stoc epuizat
      </button>
    )
  }

  return (
    <button
      onClick={handleAdd}
      className={`mt-6 w-full py-3 px-6 rounded-md text-sm font-semibold transition-all duration-200 ${
        added
          ? 'bg-green-500 text-white'
          : inCart
          ? 'bg-green-50 text-green-700 border border-green-300 hover:bg-green-100'
          : 'bg-blue-600 text-white hover:bg-blue-700'
      }`}
    >
      {added ? '✓ Adăugat în coș!' : inCart ? 'Deja în coș – adaugă din nou' : 'Adaugă în coș'}
    </button>
  )
}
