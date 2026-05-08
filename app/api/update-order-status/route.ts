import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/lib/supabase'

const ADMIN_EMAIL = process.env.ADMIN_EMAIL!
const FROM = process.env.EMAIL_FROM ?? 'PeptideResearch.ro <onboarding@resend.dev>'

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

interface UpdateBody {
  orderId: string
  newStatus: string
  customerEmail: string
  customerName: string
  shortId: string
}

export async function POST(req: NextRequest) {
  const resend = new Resend(process.env.RESEND_API_KEY || 're_missing')
  const body: UpdateBody = await req.json()
  const { orderId, newStatus, customerEmail, customerName, shortId } = body

  const cookieStore = await cookies()
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email !== ADMIN_EMAIL) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { error: updateError } = await supabase
    .from('orders')
    .update({ status: newStatus, updated_at: new Date().toISOString() })
    .eq('id', orderId)

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  const message = STATUS_MESSAGES[newStatus]
  const label = STATUS_LABELS[newStatus] ?? newStatus

  if (message && customerEmail) {
    const html = `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
        <h2 style="color:#1d4ed8">Actualizare comandă #${shortId}</h2>
        <p>Bună ${customerName},</p>
        <p>Comanda ta a fost <strong>${label}</strong>.</p>
        <p>${message}</p>
        <p>Număr comandă: <strong>#${shortId}</strong></p>
        <hr style="margin:24px 0;border:none;border-top:1px solid #e5e7eb"/>
        <p>Întrebări? Scrie-ne la <a href="mailto:${ADMIN_EMAIL}">${ADMIN_EMAIL}</a> sau pe WhatsApp: +40755-266-278</p>
        <p style="color:#9ca3af;font-size:12px">PeptideResearch.ro – Exclusiv pentru cercetare în laborator.</p>
      </div>
    `

    const { error: emailError } = await resend.emails.send({
      from: FROM,
      to: [customerEmail],
      replyTo: ADMIN_EMAIL,
      subject: `Comanda #${shortId} a fost ${label} – PeptideResearch.ro`,
      html,
    })

    if (emailError) {
      console.error('Status email error:', JSON.stringify(emailError))
      // Non-fatal: status already updated, log visible in Vercel Functions logs
    }
  }

  return NextResponse.json({ ok: true })
}
