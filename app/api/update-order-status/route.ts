import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/lib/supabase'

const ADMIN_EMAIL = process.env.ADMIN_EMAIL!
const FROM = process.env.EMAIL_FROM ?? 'PeptideResearch.ro <onboarding@resend.dev>'

const ALLOWED_STATUSES = new Set([
  'in_asteptare',
  'confirmata',
  'expediata',
  'livrata',
  'anulata',
])

const STATUS_LABELS: Record<string, string> = {
  confirmata: 'confirmată',
  expediata: 'expediată',
  livrata: 'livrată',
  anulata: 'anulată',
}

const STATUS_MESSAGES: Record<string, string> = {
  confirmata: 'Am confirmat comanda ta și o pregătim pentru expediere. Te vom contacta în curând.',
  expediata: 'Comanda ta a fost expediată și este în drum spre tine. Livrare estimată: 2–5 zile lucrătoare.',
  livrata: 'Comanda ta a fost livrată. Îți mulțumim că ai ales PeptideResearch.ro!',
  anulata: 'Comanda ta a fost anulată. Te rugăm să ne contactezi dacă ai întrebări.',
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function escapeHtml(s: unknown): string {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export async function POST(req: NextRequest) {
  // 1. Validate body shape; we ONLY accept orderId + newStatus from the client.
  //    PII for the email is fetched from the DB row (single source of truth).
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }
  const orderId = (body as { orderId?: unknown })?.orderId
  const newStatus = (body as { newStatus?: unknown })?.newStatus
  if (typeof orderId !== 'string' || !UUID_RE.test(orderId)) {
    return NextResponse.json({ error: 'Invalid orderId' }, { status: 400 })
  }
  if (typeof newStatus !== 'string' || !ALLOWED_STATUSES.has(newStatus)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
  }

  // 2. Admin auth gate (server-side via Supabase auth cookies)
  const cookieStore = await cookies()
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          )
        },
      },
    },
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email !== ADMIN_EMAIL) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // 3. Update status
  const { error: updateError } = await supabase
    .from('orders')
    .update({ status: newStatus, updated_at: new Date().toISOString() })
    .eq('id', orderId)

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  // 4. Re-fetch the order — use DB values for the email, never the request body.
  const { data: order } = await supabase
    .from('orders')
    .select('id, shipping_email, shipping_name')
    .eq('id', orderId)
    .single()

  const message = STATUS_MESSAGES[newStatus]
  const label = STATUS_LABELS[newStatus] ?? newStatus

  if (message && order?.shipping_email) {
    const shortId = order.id.slice(0, 8).toUpperCase()
    const html = `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
        <h2 style="color:#1d4ed8">Actualizare comandă #${escapeHtml(shortId)}</h2>
        <p>Bună ${escapeHtml(order.shipping_name ?? 'Client')},</p>
        <p>Comanda ta a fost <strong>${escapeHtml(label)}</strong>.</p>
        <p>${escapeHtml(message)}</p>
        <p>Număr comandă: <strong>#${escapeHtml(shortId)}</strong></p>
        <hr style="margin:24px 0;border:none;border-top:1px solid #e5e7eb"/>
        <p>Întrebări? Scrie-ne la <a href="mailto:${escapeHtml(ADMIN_EMAIL)}">${escapeHtml(ADMIN_EMAIL)}</a> sau pe WhatsApp: +40755-266-278</p>
        <p style="color:#9ca3af;font-size:12px">PeptideResearch.ro – Exclusiv pentru cercetare în laborator.</p>
      </div>
    `

    if (!process.env.RESEND_API_KEY) {
      console.error('[update-order-status] Missing RESEND_API_KEY')
    } else {
      const resend = new Resend(process.env.RESEND_API_KEY)
      const { error: emailError } = await resend.emails.send({
        from: FROM,
        to: [order.shipping_email],
        replyTo: ADMIN_EMAIL,
        subject: `Comanda #${shortId} a fost ${label} – PeptideResearch.ro`,
        html,
      })
      if (emailError) {
        console.error('[update-order-status] email error:', emailError)
        // Non-fatal: status already updated; admin can manually contact customer.
      }
    }
  }

  return NextResponse.json({ ok: true })
}
