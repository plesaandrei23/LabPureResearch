'use client'

import Link from 'next/link'
import { useCart } from '@/components/CartProvider'

export default function CosPage() {
  const { items, removeItem, updateQty, total } = useCart()

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto pt-32 pb-24 px-4 text-center">
        <div className="liquid-glass inline-flex items-center justify-center h-20 w-20 mx-auto mb-6 rounded-full">
          <svg className="h-9 w-9 text-muted-fg opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.3} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
        <h1 className="text-3xl font-extrabold text-foreground mb-3 font-[family-name:var(--font-exo)]">
          Coșul tău este gol
        </h1>
        <p className="text-muted-fg mb-8">Adaugă produse pentru a continua cu comanda.</p>
        <Link
          href="/produse"
          className="inline-flex items-center px-6 py-3 rounded-full bg-[var(--accent)] text-[var(--accent-fg)] text-sm font-semibold hover:brightness-110 transition-all glow-accent"
        >
          Explorează produsele
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto pt-28 pb-12 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground mb-8 font-[family-name:var(--font-exo)]">
        Coșul tău
      </h1>

      <div className="liquid-glass overflow-hidden mb-6">
        <table className="min-w-full">
          <thead>
            <tr className="border-b border-[var(--border)]">
              <th className="px-6 py-4 text-left text-[10px] font-semibold text-muted-fg uppercase tracking-[0.2em] font-[family-name:var(--font-roboto-mono)]">Produs</th>
              <th className="px-6 py-4 text-left text-[10px] font-semibold text-muted-fg uppercase tracking-[0.2em] font-[family-name:var(--font-roboto-mono)] hidden sm:table-cell">Preț</th>
              <th className="px-6 py-4 text-left text-[10px] font-semibold text-muted-fg uppercase tracking-[0.2em] font-[family-name:var(--font-roboto-mono)]">Cant.</th>
              <th className="px-6 py-4 text-right text-[10px] font-semibold text-muted-fg uppercase tracking-[0.2em] font-[family-name:var(--font-roboto-mono)]">Total</th>
              <th className="px-6 py-4"></th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => (
              <tr key={item.id} className={i !== items.length - 1 ? 'border-b border-[var(--border)]' : ''}>
                <td className="px-6 py-5">
                  <Link href={`/produse/${item.slug}`} className="text-sm font-semibold text-foreground hover:text-[var(--accent)] transition-colors">
                    {item.name}
                  </Link>
                  {item.purity && (
                    <p className="text-xs text-muted-fg mt-1 font-[family-name:var(--font-roboto-mono)]">
                      Puritate · {item.purity}
                    </p>
                  )}
                </td>
                <td className="px-6 py-5 text-sm text-muted-fg font-[family-name:var(--font-roboto-mono)] hidden sm:table-cell">
                  {item.price.toFixed(2)} RON
                </td>
                <td className="px-6 py-5">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => updateQty(item.id, item.quantity - 1)}
                      className="w-8 h-8 rounded-full border border-[var(--border)] flex items-center justify-center text-muted-fg hover:text-[var(--accent)] hover:border-[var(--accent)] transition-colors"
                      aria-label="Scade"
                    >−</button>
                    <span className="w-8 text-center text-sm font-semibold text-foreground font-[family-name:var(--font-roboto-mono)]">{item.quantity}</span>
                    <button
                      onClick={() => updateQty(item.id, item.quantity + 1)}
                      className="w-8 h-8 rounded-full border border-[var(--border)] flex items-center justify-center text-muted-fg hover:text-[var(--accent)] hover:border-[var(--accent)] transition-colors"
                      aria-label="Crește"
                    >+</button>
                  </div>
                </td>
                <td className="px-6 py-5 text-right text-sm font-bold text-foreground font-[family-name:var(--font-roboto-mono)]">
                  {(item.price * item.quantity).toFixed(2)} RON
                </td>
                <td className="px-6 py-5 text-right">
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-[var(--destructive)]/70 hover:text-[var(--destructive)] text-sm font-medium transition-colors"
                  >
                    Șterge
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col-reverse sm:flex-row justify-between items-start sm:items-start gap-6">
        <Link
          href="/produse"
          className="text-sm text-[var(--accent)] hover:underline font-medium inline-flex items-center gap-1"
        >
          ← Continuă cumpărăturile
        </Link>
        <div className="liquid-glass p-6 w-full sm:w-80">
          <div className="flex justify-between text-sm text-muted-fg mb-2">
            <span>Subtotal</span>
            <span className="font-[family-name:var(--font-roboto-mono)] text-foreground">{total.toFixed(2)} RON</span>
          </div>
          <div className="flex justify-between text-sm text-muted-fg mb-4">
            <span>Transport</span>
            <span>Calculat la checkout</span>
          </div>
          <div className="flex justify-between text-lg font-extrabold text-foreground border-t border-[var(--border)] pt-3 mb-5 font-[family-name:var(--font-exo)]">
            <span>Total</span>
            <span className="font-[family-name:var(--font-roboto-mono)]">{total.toFixed(2)} <span className="text-sm text-muted-fg">RON</span></span>
          </div>
          <Link
            href="/checkout"
            className="block w-full text-center py-3 px-4 rounded-full bg-[var(--accent)] text-[var(--accent-fg)] text-sm font-semibold hover:brightness-110 transition-all glow-accent"
          >
            Finalizează comanda
          </Link>
        </div>
      </div>
    </div>
  )
}
