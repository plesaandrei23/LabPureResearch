import Link from 'next/link'

export default function ConfirmarePage() {
  return (
    <div className="max-w-lg mx-auto pt-32 pb-24 px-4 text-center">
      <div className="mx-auto h-16 w-16 rounded-full bg-[var(--success)]/15 border border-[var(--success)]/30 flex items-center justify-center mb-6 glow-accent">
        <svg className="h-8 w-8 text-[var(--success)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground mb-3 font-[family-name:var(--font-exo)]">
        Comandă plasată cu succes
      </h1>
      <p className="text-muted-fg mb-2">
        Îți mulțumim pentru comandă. Vei fi contactat în cel mai scurt timp pentru confirmare.
      </p>
      <p className="text-sm text-muted-fg mb-8">
        Verifică istoricul comenzilor din contul tău pentru detalii.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link
          href="/contul-meu"
          className="px-6 py-3 rounded-full bg-[var(--accent)] text-[var(--accent-fg)] text-sm font-semibold hover:brightness-110 transition-all glow-accent"
        >
          Contul meu
        </Link>
        <Link
          href="/produse"
          className="liquid-glass liquid-glass-pill px-6 py-3 text-sm font-semibold text-foreground hover:text-[var(--accent)] transition-colors"
        >
          Continuă cumpărăturile
        </Link>
      </div>
    </div>
  )
}
