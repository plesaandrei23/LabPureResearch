'use client'

import Link from 'next/link'
import { useCart } from '@/components/CartProvider'

export default function CosPage() {
  const { items, removeItem, updateQty, total } = useCart()

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto py-24 px-4 text-center">
        <svg className="mx-auto h-16 w-16 text-neutral-200 mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        <h1 className="text-2xl font-bold text-neutral-900 mb-3">Coșul tău este gol</h1>
        <p className="text-neutral-500 mb-8">Adaugă produse pentru a continua cu comanda.</p>
        <Link href="/produse" className="inline-flex items-center px-6 py-3 rounded-md bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors">
          Explorează produsele
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-neutral-900 mb-8">Coșul tău</h1>

      <div className="bg-white border border-neutral-200 rounded-lg overflow-hidden mb-6">
        <table className="min-w-full divide-y divide-neutral-200">
          <thead className="bg-neutral-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Produs</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Preț</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Cantitate</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">Total</th>
              <th className="px-6 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {items.map(item => (
              <tr key={item.id}>
                <td className="px-6 py-4">
                  <div>
                    <Link href={`/produse/${item.slug}`} className="text-sm font-medium text-neutral-900 hover:text-blue-600">
                      {item.name}
                    </Link>
                    {item.purity && <p className="text-xs text-neutral-400">Puritate: {item.purity}</p>}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-neutral-600">{item.price.toFixed(2)} RON</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQty(item.id, item.quantity - 1)}
                      className="w-7 h-7 rounded-md border border-neutral-300 flex items-center justify-center text-neutral-500 hover:bg-neutral-100"
                    >−</button>
                    <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                    <button
                      onClick={() => updateQty(item.id, item.quantity + 1)}
                      className="w-7 h-7 rounded-md border border-neutral-300 flex items-center justify-center text-neutral-500 hover:bg-neutral-100"
                    >+</button>
                  </div>
                </td>
                <td className="px-6 py-4 text-right text-sm font-semibold text-neutral-900">
                  {(item.price * item.quantity).toFixed(2)} RON
                </td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => removeItem(item.id)} className="text-red-400 hover:text-red-600 text-sm">
                    Șterge
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <Link href="/produse" className="text-sm text-blue-600 hover:underline">
          ← Continuă cumpărăturile
        </Link>
        <div className="bg-white border border-neutral-200 rounded-lg p-6 w-full sm:w-80">
          <div className="flex justify-between text-sm text-neutral-600 mb-2">
            <span>Subtotal</span>
            <span>{total.toFixed(2)} RON</span>
          </div>
          <div className="flex justify-between text-sm text-neutral-400 mb-4">
            <span>Transport</span>
            <span>Calculat la checkout</span>
          </div>
          <div className="flex justify-between text-base font-bold text-neutral-900 border-t border-neutral-200 pt-3 mb-4">
            <span>Total</span>
            <span>{total.toFixed(2)} RON</span>
          </div>
          <Link
            href="/checkout"
            className="block w-full text-center py-3 px-4 rounded-md bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors"
          >
            Finalizează comanda
          </Link>
        </div>
      </div>
    </div>
  )
}
