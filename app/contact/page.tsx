import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Contactează PeptideResearch.ro pentru întrebări despre produse, comenzi sau certificate de analiză.',
}

export default function ContactPage() {
  return (
    <div className="max-w-2xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-extrabold text-neutral-900 mb-4">Contact</h1>
      <p className="text-neutral-500 mb-10">
        Pentru întrebări despre produse, comenzi, certificate de analiză sau orice altă solicitare, ne poți contacta prin email sau Telegram.
      </p>

      <div className="space-y-6">
        <div className="bg-white border border-neutral-200 rounded-lg p-6 flex items-start gap-4">
          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
            <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-neutral-900">Email</p>
            <a href="mailto:contact@peptideresearch.ro" className="text-sm text-blue-600 hover:underline">contact@peptideresearch.ro</a>
            <p className="text-xs text-neutral-400 mt-1">Răspuns în maximum 24h</p>
          </div>
        </div>

        <div className="bg-white border border-neutral-200 rounded-lg p-6 flex items-start gap-4">
          <div className="h-10 w-10 rounded-full bg-sky-100 flex items-center justify-center flex-shrink-0">
            <svg className="h-5 w-5 text-sky-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.248l-1.97 9.287c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L7.48 14.293l-2.95-.924c-.64-.203-.653-.64.136-.948l11.54-4.453c.537-.194 1.006.131.356.28z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-neutral-900">Whatsapp</p>
            <a href="https://t.me/PeptideResearchRO" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">+40755-266-278</a>
            <p className="text-xs text-neutral-400 mt-1">Cel mai rapid canal de comunicare</p>
          </div>
        </div>
      </div>
    </div>
  )
}
