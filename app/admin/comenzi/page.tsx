import { redirect } from 'next/navigation'
import { createServerSupabase } from '@/lib/supabase-server'
import OrderActions from './OrderActions'
import OrdersToolbar from './OrdersToolbar'

const PAGE_SIZE = 10

const STATUS_LABEL: Record<string, string> = {
  in_asteptare: 'În așteptare',
  confirmata:   'Confirmată',
  expediata:    'Expediată',
  livrata:      'Livrată',
  anulata:      'Anulată',
}

// Token-mapped status badge tints (light/dark themed via design tokens).
const STATUS_TINT: Record<string, string> = {
  in_asteptare: 'bg-[var(--warning)]/15  text-[var(--warning)]   border-[var(--warning)]/30',
  confirmata:   'bg-[var(--accent)]/15   text-[var(--accent)]    border-[var(--accent)]/30',
  expediata:    'bg-[var(--accent-2)]/15 text-[var(--accent-2)]  border-[var(--accent-2)]/30',
  livrata:      'bg-[var(--success)]/15  text-[var(--success)]   border-[var(--success)]/30',
  anulata:      'bg-[var(--destructive)]/15 text-[var(--destructive)] border-[var(--destructive)]/30',
}

type SearchParams = { [key: string]: string | string[] | undefined }

function pick(sp: SearchParams, key: string, fallback = ''): string {
  const v = sp[key]
  if (Array.isArray(v)) return v[0] ?? fallback
  return v ?? fallback
}

const VALID_STATUSES = new Set([
  'all', 'in_asteptare', 'confirmata', 'expediata', 'livrata', 'anulata',
])

export default async function AdminComenziPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const supabase = await createServerSupabase()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email !== process.env.ADMIN_EMAIL) {
    redirect('/')
  }

  // ── URL state ──────────────────────────────────────────────────────────
  const sp = await searchParams
  const rawPage = Number(pick(sp, 'page', '1'))
  const page = Number.isFinite(rawPage) && rawPage > 0 ? Math.floor(rawPage) : 1
  const statusFilter = (() => {
    const s = pick(sp, 'status', 'all')
    return VALID_STATUSES.has(s) ? s : 'all'
  })()
  const sort: 'newest' | 'oldest' = pick(sp, 'sort', 'newest') === 'oldest' ? 'oldest' : 'newest'
  const q = pick(sp, 'q').trim()

  // ── Build the paginated query ──────────────────────────────────────────
  const from = (page - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  let query = supabase
    .from('orders')
    .select('*, order_items(*)', { count: 'exact' })
    .order('created_at', { ascending: sort === 'oldest' })
    .range(from, to)

  if (statusFilter !== 'all') {
    query = query.eq('status', statusFilter)
  }
  if (q) {
    // Match name (case-insensitive), email, or first 8 chars of UUID (entered as either case).
    const isUuidPrefix = /^[0-9a-fA-F]{4,8}$/.test(q)
    if (isUuidPrefix) {
      query = query.ilike('id', `${q.toLowerCase()}%`)
    } else {
      query = query.or(`shipping_name.ilike.%${q}%,shipping_email.ilike.%${q}%`)
    }
  }

  const { data: orders, count } = await query
  const total = count ?? 0
  const list = (orders as any[]) ?? []

  // ── Per-status counts for the filter pills (separate aggregate query) ─
  const statusCountsResult = await supabase
    .from('orders')
    .select('status', { count: 'exact', head: false })
  const counts: Record<string, number> = { all: statusCountsResult.count ?? 0 }
  for (const row of (statusCountsResult.data as any[] | null) ?? []) {
    counts[row.status] = (counts[row.status] ?? 0) + 1
  }

  return (
    <div className="max-w-5xl mx-auto pt-8 sm:pt-10 pb-12 px-4 sm:px-6 lg:px-8">
      <header className="mb-6 sm:mb-8">
        <div className="flex items-center justify-between gap-3 mb-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground font-[family-name:var(--font-exo)]">
            Comenzi
          </h1>
          {counts.in_asteptare > 0 && (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${STATUS_TINT.in_asteptare}`}>
              {counts.in_asteptare} în așteptare
            </span>
          )}
        </div>
        <p className="text-xs text-muted-fg font-[family-name:var(--font-roboto-mono,monospace)]">
          {counts.all ?? 0} comenzi total
        </p>
      </header>

      <OrdersToolbar
        total={total}
        page={page}
        pageSize={PAGE_SIZE}
        status={statusFilter}
        sort={sort}
        q={q}
        counts={counts}
      />

      {list.length === 0 ? (
        <div className="liquid-glass text-center py-16 mt-8">
          <p className="text-sm text-muted-fg">
            {q || statusFilter !== 'all' ? 'Nicio comandă pentru filtrele curente.' : 'Nu există comenzi încă.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {list.map((order) => {
            const shortId = order.id.slice(0, 8).toUpperCase()
            const date = new Date(order.created_at).toLocaleDateString('ro-RO', {
              day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
            })
            const itemCount = (order.order_items as any[])?.length ?? 0
            return (
              <article key={order.id} className="liquid-glass p-4 sm:p-5">
                {/* Header: shortId + status + date */}
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className="font-mono font-bold text-foreground text-sm">#{shortId}</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${STATUS_TINT[order.status]}`}>
                    {STATUS_LABEL[order.status] ?? order.status}
                  </span>
                  <span className="ml-auto text-xs text-muted-fg font-[family-name:var(--font-roboto-mono,monospace)]">
                    {date}
                  </span>
                </div>

                {/* Customer details — stacks naturally on mobile */}
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 text-sm mb-3">
                  <div>
                    <dt className="inline text-muted-fg">Client: </dt>
                    <dd className="inline font-semibold text-foreground">{order.shipping_name}</dd>
                  </div>
                  <div>
                    <dt className="inline text-muted-fg">Telefon: </dt>
                    <dd className="inline text-foreground font-[family-name:var(--font-roboto-mono,monospace)]">
                      {order.shipping_phone}
                    </dd>
                  </div>
                  <div className="sm:col-span-2 break-all">
                    <dt className="inline text-muted-fg">Email: </dt>
                    <dd className="inline text-foreground">{order.shipping_email}</dd>
                  </div>
                  <div className="sm:col-span-2">
                    <dt className="inline text-muted-fg">Adresă: </dt>
                    <dd className="inline text-foreground">
                      {order.shipping_address}, {order.shipping_city}, jud. {order.shipping_county} {order.shipping_postal}
                    </dd>
                  </div>
                  {order.notes && (
                    <div className="sm:col-span-2">
                      <dt className="inline text-muted-fg">Obs: </dt>
                      <dd className="inline text-foreground">{order.notes}</dd>
                    </div>
                  )}
                </dl>

                {/* Items + total */}
                <details className="border-t border-[var(--border)] pt-3 group" open={itemCount <= 3}>
                  <summary className="flex items-center justify-between cursor-pointer list-none">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-fg font-[family-name:var(--font-roboto-mono,monospace)]">
                      {itemCount} produs{itemCount !== 1 ? 'e' : ''}
                    </span>
                    <span className="text-base font-extrabold text-foreground font-[family-name:var(--font-roboto-mono,monospace)]">
                      {Number(order.total_amount).toFixed(2)}<span className="text-xs text-muted-fg ml-1">RON</span>
                    </span>
                  </summary>
                  <ul className="mt-2 space-y-1">
                    {(order.order_items as any[]).map((item, i) => (
                      <li key={i} className="flex justify-between text-sm gap-3">
                        <span className="text-foreground truncate">{item.product_name} × {item.quantity}</span>
                        <span className="text-muted-fg font-[family-name:var(--font-roboto-mono,monospace)] whitespace-nowrap">
                          {(item.unit_price * item.quantity).toFixed(2)} RON
                        </span>
                      </li>
                    ))}
                  </ul>
                </details>

                <OrderActions
                  orderId={order.id}
                  currentStatus={order.status}
                  customerEmail={order.shipping_email ?? ''}
                  customerName={order.shipping_name ?? ''}
                  shortId={shortId}
                />
              </article>
            )
          })}
        </div>
      )}

      {/* Bottom pagination repeat for long pages */}
      {total > PAGE_SIZE && (
        <div className="mt-8">
          <OrdersToolbar
            total={total}
            page={page}
            pageSize={PAGE_SIZE}
            status={statusFilter}
            sort={sort}
            q={q}
          />
        </div>
      )}
    </div>
  )
}
