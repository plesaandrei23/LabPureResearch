import Link from 'next/link'

export default function ConfirmarePage() {
  return (
    <div className="max-w-lg mx-auto py-24 px-4 text-center">
      <div className="mx-auto h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mb-6">
        <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h1 className="text-2xl font-bold text-neutral-900 mb-3">Comandă plasată cu succes!</h1>
      <p className="text-neutral-500 mb-2">
        Îți mulțumim pentru comandă. Vei fi contactat în cel mai scurt timp pentru confirmare.
      </p>
      <p className="text-sm text-neutral-400 mb-8">
        Verifică istoricul comenzilor din contul tău pentru detalii.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link href="/contul-meu" className="px-6 py-3 rounded-md bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors">
          Contul meu
        </Link>
        <Link href="/produse" className="px-6 py-3 rounded-md border border-neutral-300 text-neutral-700 text-sm font-semibold hover:bg-neutral-50 transition-colors">
          Continuă cumpărăturile
        </Link>
      </div>
    </div>
  )
}
