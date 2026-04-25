import { redirect } from 'next/navigation'
import { createServerSupabase } from '@/lib/supabase-server'
import OrderActions from './OrderActions'

const STATUS_BADGE: Record<string, string> = {
  in_asteptare: 'bg-yellow-100 text-yellow-800',
  confirmata: 'bg-blue-100 text-blue-800',
  expediata: 'bg-purple-100 text-purple-800',
  livrata: 'bg-green-100 text-green-800',
  anulata: 'bg-red-100 text-red-800',
}

const STATUS_LABEL: Record<string, string> = {
  in_asteptare: 'În așteptare',
  confirmata: 'Confirmată',
  expediata: 'Expediată',
  livrata: 'Livrată',
  anulata: 'Anulată',
}

export default async function AdminComenziPage() {
  const supabase = await createServerSupabase()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email !== process.env.ADMIN_EMAIL) {
    redirect('/')
  }

  const { data: orders } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .order('created_at', { ascending: false })
    .limit(200)

  const grouped = {
    in_asteptare: orders?.filter(o => o.status === 'in_asteptare') ?? [],
    confirmata: orders?.filter(o => o.status === 'confirmata') ?? [],
    expediata: orders?.filter(o => o.status === 'expediata') ?? [],
    livrata: orders?.filter(o => o.status === 'livrata') ?? [],
    anulata: orders?.filter(o => o.status === 'anulata') ?? [],
  }

  const pending = grouped.in_asteptare.length

  return (
    <div className="max-w-5xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-neutral-900">
          Comenzi
          {pending > 0 && (
            <span className="ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">
              {pending} în așteptare
            </span>
          )}
        </h1>
        <p className="text-sm text-neutral-500">{orders?.length ?? 0} total</p>
      </div>

      {['in_asteptare', 'confirmata', 'expediata', 'livrata', 'anulata'].map(status => {
        const list = grouped[status as keyof typeof grouped]
        if (list.length === 0) return null
        return (
          <section key={status} className="mb-10">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500 mb-3">
              {STATUS_LABEL[status]} ({list.length})
            </h2>
            <div className="space-y-4">
              {list.map(order => {
                const shortId = order.id.slice(0, 8).toUpperCase()
                const date = new Date(order.created_at).toLocaleDateString('ro-RO', {
                  day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                })
                return (
                  <div key={order.id} className="bg-white border border-neutral-200 rounded-lg p-5">
                    <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
                      <div>
                        <span className="font-mono font-bold text-neutral-800">#{shortId}</span>
                        <span className="ml-3 text-sm text-neutral-400">{date}</span>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${STATUS_BADGE[order.status]}`}>
                        {STATUS_LABEL[order.status]}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-sm mb-3">
                      <p><span className="text-neutral-400">Client:</span> <strong>{order.shipping_name}</strong></p>
                      <p><span className="text-neutral-400">Telefon:</span> {order.shipping_phone}</p>
                      <p><span className="text-neutral-400">Email:</span> {order.shipping_email}</p>
                      <p><span className="text-neutral-400">Adresă:</span> {order.shipping_address}, {order.shipping_city}, jud. {order.shipping_county} {order.shipping_postal}</p>
                      {order.notes && <p className="sm:col-span-2"><span className="text-neutral-400">Obs:</span> {order.notes}</p>}
                    </div>

                    <div className="border-t border-neutral-100 pt-3">
                      <p className="text-xs font-medium text-neutral-500 mb-1.5">Produse</p>
                      <ul className="space-y-0.5">
                        {(order.order_items as Array<{ product_name: string; quantity: number; unit_price: number }>).map((item, i) => (
                          <li key={i} className="flex justify-between text-sm">
                            <span>{item.product_name} × {item.quantity}</span>
                            <span className="font-medium">{(item.unit_price * item.quantity).toFixed(2)} RON</span>
                          </li>
                        ))}
                      </ul>
                      <p className="mt-2 font-bold text-right text-neutral-900">Total: {Number(order.total_amount).toFixed(2)} RON</p>
                    </div>

                    <OrderActions
                      orderId={order.id}
                      currentStatus={order.status}
                      customerEmail={order.shipping_email ?? ''}
                      customerName={order.shipping_name ?? ''}
                      shortId={shortId}
                    />
                  </div>
                )
              })}
            </div>
          </section>
        )
      })}

      {(!orders || orders.length === 0) && (
        <div className="text-center py-20 text-neutral-400">
          <p>Nu există comenzi încă.</p>
        </div>
      )}
    </div>
  )
}
