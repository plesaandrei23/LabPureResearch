import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const ADMIN_EMAIL = process.env.ADMIN_EMAIL!
const FROM = process.env.EMAIL_FROM ?? 'PeptideResearch.ro <onboarding@resend.dev>'

type OrderItem = { name: string; quantity: number; price: number }

interface NotifyBody {
  orderId: string
  items: OrderItem[]
  total: number
  shipping: {
    name: string
    email: string
    phone: string
    address: string
    city: string
    county: string
    postal: string
  }
}

function itemsHtml(items: OrderItem[]) {
  return items.map(i =>
    `<tr>
      <td style="padding:6px 8px;border-bottom:1px solid #eee">${i.name}</td>
      <td style="padding:6px 8px;border-bottom:1px solid #eee;text-align:center">${i.quantity}</td>
      <td style="padding:6px 8px;border-bottom:1px solid #eee;text-align:right">${(i.price * i.quantity).toFixed(2)} RON</td>
    </tr>`
  ).join('')
}

export async function POST(req: NextRequest) {
  const body: NotifyBody = await req.json()
  const { orderId, items, total, shipping } = body
  const shortId = orderId.slice(0, 8).toUpperCase()

  const adminHtml = `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
      <h2 style="color:#1d4ed8">🛒 Comandă nouă #${shortId}</h2>
      <p><strong>Client:</strong> ${shipping.name}</p>
      <p><strong>Email:</strong> ${shipping.email}</p>
      <p><strong>Telefon:</strong> ${shipping.phone}</p>
      <p><strong>Adresă:</strong> ${shipping.address}, ${shipping.city}, jud. ${shipping.county}, ${shipping.postal}</p>
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
      <p style="font-size:18px;font-weight:bold;margin-top:16px">Total: ${total.toFixed(2)} RON</p>
      <p style="color:#6b7280;font-size:13px">ID complet: ${orderId}</p>
    </div>
  `

  const customerHtml = `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
      <h2 style="color:#1d4ed8">✅ Comanda ta a fost primită!</h2>
      <p>Bună ${shipping.name},</p>
      <p>Îți mulțumim pentru comandă. Am primit-o și o vom procesa în cel mai scurt timp.</p>
      <p><strong>Număr comandă:</strong> #${shortId}</p>
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
      <p style="font-size:18px;font-weight:bold;margin-top:16px">Total: ${total.toFixed(2)} RON</p>
      <p><strong>Adresă livrare:</strong> ${shipping.address}, ${shipping.city}, jud. ${shipping.county}, ${shipping.postal}</p>
      <p>Te vom contacta la numărul <strong>${shipping.phone}</strong> pentru confirmare.</p>
      <hr style="margin:24px 0;border:none;border-top:1px solid #e5e7eb"/>
      <p style="color:#9ca3af;font-size:12px">PeptideResearch.ro – Exclusiv pentru cercetare în laborator. Nu este destinat consumului uman.</p>
    </div>
  `

  const [adminResult, customerResult] = await Promise.all([
    resend.emails.send({
      from: FROM,
      to: [ADMIN_EMAIL],
      replyTo: shipping.email,
      subject: `🛒 Comandă nouă #${shortId} – ${shipping.name} – ${total.toFixed(2)} RON`,
      html: adminHtml,
    }),
    resend.emails.send({
      from: FROM,
      to: [shipping.email],
      replyTo: ADMIN_EMAIL,
      subject: `✅ Confirmare comandă #${shortId} – PeptideResearch.ro`,
      html: customerHtml,
    }),
  ])

  if (adminResult.error || customerResult.error) {
    console.error('Resend Error Admin:', JSON.stringify(adminResult.error))
    console.error('Resend Error Customer:', JSON.stringify(customerResult.error))
    return NextResponse.json({ ok: true, warning: 'Email sending failed' })
  }

  return NextResponse.json({ ok: true })
}
