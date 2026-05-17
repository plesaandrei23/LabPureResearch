'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useState, useTransition } from 'react'

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: 'all',           label: 'Toate' },
  { value: 'in_asteptare',  label: 'În așteptare' },
  { value: 'confirmata',    label: 'Confirmate' },
  { value: 'expediata',     label: 'Expediate' },
  { value: 'livrata',       label: 'Livrate' },
  { value: 'anulata',       label: 'Anulate' },
]

interface Props {
  total: number
  page: number
  pageSize: number
  status: string
  sort: 'newest' | 'oldest'
  q: string
  /** Optional per-status counts so the filter pills can show "În așteptare (3)" */
  counts?: Partial<Record<string, number>>
}

export default function OrdersToolbar({ total, page, pageSize, status, sort, q, counts }: Props) {
  const router = useRouter()
  const sp = useSearchParams()
  const [search, setSearch] = useState(q)
  const [isPending, startTransition] = useTransition()

  // Keep local search synced if user nav'd via back/forward
  useEffect(() => { setSearch(q) }, [q])

  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  const push = useCallback(
    (params: Record<string, string | number | undefined>) => {
      const next = new URLSearchParams(sp.toString())
      for (const [k, v] of Object.entries(params)) {
        if (v == null || v === '' || v === 'all' || (k === 'page' && v === 1) || (k === 'sort' && v === 'newest')) {
          next.delete(k)
        } else {
          next.set(k, String(v))
        }
      }
      const qs = next.toString()
      startTransition(() => {
        router.push(qs ? `/admin/comenzi?${qs}` : '/admin/comenzi')
      })
    },
    [sp, router],
  )

  // Debounce search input
  useEffect(() => {
    const t = setTimeout(() => {
      if (search !== q) push({ q: search || undefined, page: 1 })
    }, 350)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search])

  return (
    <div className="space-y-3 mb-6">
      {/* Row 1: status pills (scrollable on mobile) */}
      <div className="flex gap-1.5 overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-none">
        {STATUS_OPTIONS.map((opt) => {
          const active = status === opt.value
          const count = counts?.[opt.value]
          return (
            <button
              key={opt.value}
              onClick={() => push({ status: opt.value, page: 1 })}
              className={`whitespace-nowrap px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                active
                  ? 'bg-[var(--accent)] text-[var(--accent-fg)] glow-accent'
                  : 'liquid-glass text-foreground hover:text-[var(--accent)]'
              }`}
            >
              {opt.label}
              {typeof count === 'number' && (
                <span className={`ml-1.5 font-mono text-[10px] ${active ? 'opacity-90' : 'text-muted-fg'}`}>
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Row 2: search + sort + total */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 sm:items-center">
        <div className="relative flex-1 max-w-md">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-fg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="7" />
            <path d="M21 21l-4.3-4.3" strokeLinecap="round" />
          </svg>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Caută după nume, email sau ID..."
            className="w-full pl-9 pr-3 py-2 rounded-full bg-[var(--surface)] border border-[var(--border)] text-sm text-foreground placeholder:text-muted-fg/70 focus:outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--ring)] transition-colors"
          />
        </div>

        <select
          value={sort}
          onChange={(e) => push({ sort: e.target.value, page: 1 })}
          className="px-3 py-2 rounded-full bg-[var(--surface)] border border-[var(--border)] text-sm text-foreground focus:outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--ring)] transition-colors"
        >
          <option value="newest">Cele mai noi</option>
          <option value="oldest">Cele mai vechi</option>
        </select>

        <p className="text-xs text-muted-fg font-[family-name:var(--font-roboto-mono,monospace)] sm:ml-auto">
          {total === 0 ? 'Nicio comandă' :
            `${(page - 1) * pageSize + 1}–${Math.min(page * pageSize, total)} din ${total}`}
        </p>
      </div>

      {/* Loading indicator while route transitions */}
      {isPending && (
        <p className="text-xs text-muted-fg">Se încarcă...</p>
      )}

      {/* Bottom: pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <button
            onClick={() => push({ page: Math.max(1, page - 1) })}
            disabled={page <= 1}
            className="px-4 py-1.5 rounded-full liquid-glass text-sm font-medium text-foreground disabled:opacity-40 disabled:cursor-not-allowed hover:text-[var(--accent)] transition-colors"
          >
            ← Anterior
          </button>
          <span className="text-xs text-muted-fg font-[family-name:var(--font-roboto-mono,monospace)]">
            Pagina {page} / {totalPages}
          </span>
          <button
            onClick={() => push({ page: Math.min(totalPages, page + 1) })}
            disabled={page >= totalPages}
            className="px-4 py-1.5 rounded-full liquid-glass text-sm font-medium text-foreground disabled:opacity-40 disabled:cursor-not-allowed hover:text-[var(--accent)] transition-colors"
          >
            Următor →
          </button>
        </div>
      )}
    </div>
  )
}
