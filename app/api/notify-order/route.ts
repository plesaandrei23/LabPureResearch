import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createClient } from '@supabase/supabase-js'

const ADMIN_EMAIL = process.env.ADMIN_EMAIL!

// Resend's `from` parser is strict: it accepts only `email@domain.tld` OR
// `Name <email@domain.tld>` (RFC-5322 friendly). Vercel's env-var UI sometimes
// mangles values (URL-encodes `<>`, HTML-escapes them, wraps in quotes, trims
// the angle-bracket section, etc.). Sanitize on every request so a malformed
// env value can't kill the email pipeline silently.
function sanitizeFrom(raw: string | undefined): string {
  const FALLBACK = 'onboarding@resend.dev'
  if (!raw) return FALLBACK
  let s = raw.trim()
  // strip surrounding single/double quotes
  s = s.replace(/^['"]|['"]$/g, '')
  // decode HTML entities and URL-encoding for `<` and `>`
  s = s
    .replace(/&lt;/gi, '<').replace(/&gt;/gi, '>').replace(/&amp;/gi, '&')
    .replace(/%3C/gi, '<').replace(/%3E/gi, '>')
  const NAMED = /^[^<>@]+<\s*([^\s<>]+@[^\s<>]+\.[^\s<>]+)\s*>$/
  const BARE  = /^[^\s<>@]+@[^\s<>]+\.[^\s<>]+$/
  if (NAMED.test(s) || BARE.test(s)) return s
  // Last-ditch: extract the email portion only and use that bare. Beats failing.
  const m = s.match(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/)
  if (m) {
    console.warn(`[notify-order] EMAIL_FROM malformed (${JSON.stringify(raw)}), using bare extracted: ${m[0]}`)
    return m[0]
  }
  console.error(`[notify-order] EMAIL_FROM unparseable (${JSON.stringify(raw)}), falling back to ${FALLBACK}`)
  return FALLBACK
}

const FROM = sanitizeFrom(process.env.EMAIL_FROM)

// ─── In-memory rate limit (per server instance) ──────────────────────────────
// Production with multiple instances should use a shared store (Vercel KV,
// Upstash, etc.). This still raises the bar against a casual abuser.
const rateLimit = new Map<string, number[]>()
const MAX_PER_MIN = 6
const WINDOW_MS = 60_000

function rateOk(ip: string): boolean {
  const now = Date.now()
  const cutoff = now - WINDOW_MS
  const arr = (rateLimit.get(ip) ?? []).filter((t) => t > cutoff)
  if (arr.length >= MAX_PER_MIN) return false
  arr.push(now)
  rateLimit.set(ip, arr)
  if (rateLimit.size > 2000) {
    for (const [k, v] of rateLimit) if (!v.some((t) => t > cutoff)) rateLimit.delete(k)
  }
  return true
}

function escapeHtml(s: unknown): string {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

interface DbOrder {
  id: string
  shipping_name: string | null
  shipping_email: string | null
  shipping_phone: string | null
  shipping_address: string | null
  shipping_city: string | null
  shipping_county: string | null
  shipping_postal: string | null
  total_amount: number
  created_at: string
}

interface DbItem { product_name: string; quantity: number; unit_price: number }

function itemsHtml(items: DbItem[]) {
  return items
    .map(
      (i) => `<tr>
        <td style="padding:6px 8px;border-bottom:1px solid #eee">${escapeHtml(i.product_name)}</td>
        <td style="padding:6px 8px;border-bottom:1px solid #eee;text-align:center">${i.quantity | 0}</td>
        <td style="padding:6px 8px;border-bottom:1px solid #eee;text-align:right">${(Number(i.unit_price) * Number(i.quantity)).toFixed(2)} RON</td>
      </tr>`,
    )
    .join('')
}

function buildAdminHtml(o: DbOrder, items: DbItem[], shortId: string) {
  return `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
      <h2 style="color:#1d4ed8">🛒 Comandă nouă #${escapeHtml(shortId)}</h2>
      <p><strong>Client:</strong> ${escapeHtml(o.shipping_name)}</p>
      <p><strong>Email:</strong> ${escapeHtml(o.shipping_email)}</p>
      <p><strong>Telefon:</strong> ${escapeHtml(o.shipping_phone)}</p>
      <p><strong>Adresă:</strong> ${escapeHtml(o.shipping_address)}, ${escapeHtml(o.shipping_city)}, jud. ${escapeHtml(o.shipping_county)}, ${escapeHtml(o.shipping_postal)}</p>
      <h3 style="margin-top:24px">Produse comandate</h3>
      <table style="width:100%;border-collapse:collapse">
        <thead>
          <tr style="background:#f3f4f6">
            <th style="padding:8px;text-align:left">Produs</th>
            <th style="padding:8px;text-align:center">Cant.</th>
            <th style="padding:8px;text-align:right">Preț</th>
          </tr>
        </thead>
        <tbody>${itemsHtml(items)}</tbody>
      </table>
      <p style="font-size:18px;font-weight:bold;margin-top:16px">Total: ${Number(o.total_amount).toFixed(2)} RON</p>
      <p style="color:#6b7280;font-size:13px">ID complet: ${escapeHtml(o.id)}</p>
    </div>
  `
}

function buildCustomerHtml(o: DbOrder, items: DbItem[], shortId: string) {
  return `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
      <h2 style="color:#1d4ed8">✅ Comanda ta a fost primită!</h2>
      <p>Bună ${escapeHtml(o.shipping_name)},</p>
      <p>Îți mulțumim pentru comandă. Am primit-o și o vom procesa în cel mai scurt timp.</p>
      <p><strong>Număr comandă:</strong> #${escapeHtml(shortId)}</p>
      <h3>Sumar comandă</h3>
      <table style="width:100%;border-collapse:collapse">
        <thead>
          <tr style="background:#f3f4f6">
            <th style="padding:8px;text-align:left">Produs</th>
            <th style="padding:8px;text-align:center">Cant.</th>
            <th style="padding:8px;text-align:right">Preț</th>
          </tr>
        </thead>
        <tbody>${itemsHtml(items)}</tbody>
      </table>
      <p style="font-size:18px;font-weight:bold;margin-top:16px">Total: ${Number(o.total_amount).toFixed(2)} RON</p>
      <p><strong>Adresă livrare:</strong> ${escapeHtml(o.shipping_address)}, ${escapeHtml(o.shipping_city)}, jud. ${escapeHtml(o.shipping_county)}, ${escapeHtml(o.shipping_postal)}</p>
      <p>Te vom contacta la numărul <strong>${escapeHtml(o.shipping_phone)}</strong> pentru confirmare.</p>
      <hr style="margin:24px 0;border:none;border-top:1px solid #e5e7eb"/>
      <p style="color:#9ca3af;font-size:12px">PeptideResearch.ro – Exclusiv pentru cercetare în laborator. Nu este destinat consumului uman.</p>
    </div>
  `
}

export async function POST(req: NextRequest) {
  // 1. Rate limit
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    req.headers.get('x-real-ip') ??
    'unknown'
  if (!rateOk(ip)) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })
  }

  // 2. Parse + validate the only thing we accept from the client: an orderId
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }
  const orderId = (body as { orderId?: unknown })?.orderId
  if (typeof orderId !== 'string' || !UUID_RE.test(orderId)) {
    return NextResponse.json({ error: 'Invalid orderId' }, { status: 400 })
  }

  // 3. Verify env config up-front so failures are visible (not silent 200s)
  const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
  const SUPA_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!SERVICE_KEY || !SUPA_URL) {
    console.error('[notify-order] Missing SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_URL')
    return NextResponse.json({ error: 'Server misconfigured (db)' }, { status: 503 })
  }
  if (!process.env.RESEND_API_KEY) {
    console.error('[notify-order] Missing RESEND_API_KEY')
    return NextResponse.json({ error: 'Server misconfigured (mailer)' }, { status: 503 })
  }
  if (!ADMIN_EMAIL) {
    console.error('[notify-order] Missing ADMIN_EMAIL')
    return NextResponse.json({ error: 'Server misconfigured (admin)' }, { status: 503 })
  }

  // 4. Fetch order from DB using service role (bypasses RLS, server-only key).
  //    DB is the single source of truth for PII — body cannot inject recipients.
  const supabase = createClient(SUPA_URL, SERVICE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select(
      'id, shipping_name, shipping_email, shipping_phone, shipping_address, shipping_city, shipping_county, shipping_postal, total_amount, created_at',
    )
    .eq('id', orderId)
    .single<DbOrder>()

  if (orderError || !order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  }

  // 5. Reject stale order calls (>10 min) — limits replay-spam window
  if (Date.now() - new Date(order.created_at).getTime() > 10 * 60_000) {
    return NextResponse.json({ error: 'Order too old' }, { status: 410 })
  }

  // 6. Validate the DB email shape (defensive)
  if (!order.shipping_email || !EMAIL_RE.test(order.shipping_email)) {
    return NextResponse.json({ error: 'Missing customer email' }, { status: 422 })
  }

  // 7. Fetch items
  const { data: items, error: itemsError } = await supabase
    .from('order_items')
    .select('product_name, quantity, unit_price')
    .eq('order_id', orderId)
    .returns<DbItem[]>()

  if (itemsError || !items || items.length === 0) {
    return NextResponse.json({ error: 'No items for order' }, { status: 422 })
  }

  // 8. Send emails. Recipients come from the DB row — never from request body.
  const shortId = order.id.slice(0, 8).toUpperCase()
  const resend = new Resend(process.env.RESEND_API_KEY)

  const [adminRes, customerRes] = await Promise.allSettled([
    resend.emails.send({
      from: FROM,
      to: [ADMIN_EMAIL],
      replyTo: order.shipping_email,
      subject: `🛒 Comandă nouă #${shortId} – ${order.shipping_name ?? 'Client'} – ${Number(order.total_amount).toFixed(2)} RON`,
      html: buildAdminHtml(order, items, shortId),
    }),
    resend.emails.send({
      from: FROM,
      to: [order.shipping_email],
      replyTo: ADMIN_EMAIL,
      subject: `✅ Confirmare comandă #${shortId} – PeptideResearch.ro`,
      html: buildCustomerHtml(order, items, shortId),
    }),
  ])

  const adminOk =
    adminRes.status === 'fulfilled' && !(adminRes.value as { error?: unknown })?.error
  const customerOk =
    customerRes.status === 'fulfilled' && !(customerRes.value as { error?: unknown })?.error

  if (!adminOk) {
    const detail = adminRes.status === 'rejected' ? adminRes.reason : (adminRes.value as { error?: unknown })?.error
    console.error('[notify-order] admin send failed:', detail)
  }
  if (!customerOk) {
    const detail = customerRes.status === 'rejected' ? customerRes.reason : (customerRes.value as { error?: unknown })?.error
    console.error('[notify-order] customer send failed:', detail)
  }

  if (!adminOk && !customerOk) {
    return NextResponse.json({ error: 'Both emails failed' }, { status: 502 })
  }
  return NextResponse.json({ ok: true, adminSent: adminOk, customerSent: customerOk })
}
