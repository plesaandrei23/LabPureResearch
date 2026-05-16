import Link from 'next/link'
import { createServerSupabase } from '@/lib/supabase-server'
import ProductCard from '@/components/ProductCard'
import Reveal from '@/components/Reveal'

async function getFeaturedProducts() {
  const supabase = await createServerSupabase()
  const { data } = await supabase
    .from('products')
    .select('*')
    .eq('is_active', true)
    .limit(8)
  return data ?? []
}

export default async function HomePage() {
  const products = await getFeaturedProducts()

  return (
    <>
      {/* Hero — no opaque bg; the persistent ScrollScene + page-bg do the work.
          Mobile: items-end pushes text to the bottom half so the vial owns
          the top 45vh of viewport breathing room.
          Desktop: classic centered hero with vial on the right. */}
      <section
        id="hero"
        className="relative overflow-hidden min-h-[100vh] flex items-end lg:items-center pb-10 lg:pb-0"
      >
        <div className="relative max-w-7xl mx-auto pt-[48vh] lg:pt-32 pb-8 lg:pb-32 px-4 sm:px-6 lg:px-8 w-full">
          {/* Text full-width on mobile/tablet, left half on desktop (vial right) */}
          <div className="max-w-full lg:max-w-xl">
            <Reveal>
              <span
                className="liquid-glass liquid-glass-pill inline-flex items-center gap-2 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] mb-6 font-[family-name:var(--font-roboto-mono)]"
                style={{ color: 'var(--foreground)' }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-pulse" />
                HPLC ≥ 98% · Livrare în România
              </span>
            </Reveal>

            <Reveal delay={0.05}>
              <h1 className="text-[2.4rem] sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold tracking-tight leading-[1.05] font-[family-name:var(--font-exo)]">
                Peptide de înaltă puritate
                <span className="block text-gradient">pentru cercetare avansată.</span>
              </h1>
            </Reveal>

            <Reveal delay={0.1}>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-fg">
                BPC-157, Semax, Selank, GHK-Cu, Retatrutida, Klow — fiecare lot
                cu certificat de analiză, puritate verificată ≥ 98%, livrare cu lanț rece.
              </p>
            </Reveal>

            <Reveal delay={0.15}>
              <div className="mt-10 flex flex-col sm:flex-row gap-3">
                <Link
                  href="/produse"
                  className="inline-flex items-center justify-center px-7 py-3.5 rounded-full bg-[var(--accent)] text-[var(--accent-fg)] text-sm font-semibold hover:brightness-110 transition-all glow-accent"
                >
                  Vezi toate produsele
                  <svg className="ml-2 w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14M13 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </Link>
                <Link
                  href="/calitate"
                  className="liquid-glass liquid-glass-strong liquid-glass-pill inline-flex items-center justify-center px-7 py-3.5 text-sm font-semibold transition-all text-foreground"
                >
                  Standarde de calitate
                </Link>
              </div>
            </Reveal>

            <Reveal delay={0.25}>
              <dl className="liquid-glass liquid-glass-strong mt-16 grid grid-cols-2 sm:grid-cols-4 max-w-3xl overflow-hidden">
                <Stat value="98%+" label="Puritate HPLC" />
                <Stat value="2-5z" label="Livrare RO" />
                <Stat value="6+" label="Compuși disponibili" />
                <Stat value="CoA" label="Per lot, la cerere" />
              </dl>
            </Reveal>
          </div>

          {/* scroll hint */}
          <Reveal delay={0.4}>
            <div className="hidden lg:flex absolute bottom-8 left-1/2 -translate-x-1/2 flex-col items-center gap-2 text-muted-fg">
              <span className="text-[10px] uppercase tracking-[0.3em] font-[family-name:var(--font-roboto-mono)]">Scroll</span>
              <span className="w-px h-12 bg-gradient-to-b from-[var(--muted-fg)] to-transparent" />
            </div>
          </Reveal>
        </div>
      </section>

      {/* Warning banner — also the trigger that starts the vial explosion --- */}
      <div id="explode-trigger" className="relative liquid-glass rounded-none border-x-0 border-t-0">
        <div className="max-w-7xl mx-auto py-3 px-4 text-center">
          <p className="text-xs sm:text-sm font-medium text-[var(--warning)]">
            <strong>AVERTISMENT:</strong> Produsele sunt destinate exclusiv cercetării profesionale în laborator.
            Nu sunt destinate consumului uman. Minim 18 ani.
          </p>
        </div>
      </div>

      {/* Products — embraces the 3D stage: asymmetric, glass cards floating
          on the LEFT half so the vial drifts visibly between them on the right */}
      <section className="relative py-28 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <Reveal>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-14">
              <div className="lg:col-span-7">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--accent)] mb-3 font-[family-name:var(--font-roboto-mono)]">
                  Catalog
                </p>
                <h2 className="text-4xl sm:text-5xl font-bold tracking-tight font-[family-name:var(--font-exo)]">
                  Cele mai cerute<br />
                  <span className="text-gradient">compuse de cercetare.</span>
                </h2>
                <p className="mt-5 text-muted-fg max-w-lg">
                  Fiecare flacon livrat cu certificat de analiză (CoA), puritate HPLC ≥ 98%,
                  ambalaj steril cu lanț rece.
                </p>
              </div>
              <div className="lg:col-span-5 flex lg:justify-end items-end">
                <Link
                  href="/produse"
                  className="liquid-glass liquid-glass-pill inline-flex items-center gap-2 px-5 py-3 text-sm font-medium text-foreground hover:text-[var(--accent)] transition-colors"
                >
                  Vezi catalogul complet
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14M13 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </Link>
              </div>
            </div>
          </Reveal>

          {products.length > 0 ? (
            // Asymmetric grid: 2 cols on the left (lg:col-span-8), right column (lg:col-span-4)
            // intentionally empty so the bottle is visible there.
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
                {products.slice(0, 4).map((p, i) => (
                  <Reveal key={p.id} delay={Math.min(i * 0.06, 0.24)}>
                    <ProductCard product={p} />
                  </Reveal>
                ))}
              </div>
              {/* Right column: vertical strip of secondary cards + breathing room for the vial */}
              <div className="lg:col-span-4 flex flex-col gap-6">
                {products.slice(4, 6).map((p, i) => (
                  <Reveal key={p.id} delay={Math.min(i * 0.08 + 0.1, 0.32)}>
                    <ProductCard product={p} />
                  </Reveal>
                ))}
              </div>
            </div>
          ) : (
            <div className="liquid-glass text-center py-20 max-w-2xl mx-auto">
              <p className="text-muted-fg">Produsele se încarcă. Configurează Supabase și rulează schema SQL.</p>
            </div>
          )}
        </div>
      </section>

      {/* Features — glass cards on transparent section, vial visible behind */}
      <section className="relative py-28 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <Reveal>
            <div className="max-w-2xl mb-16">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--accent)] mb-3 font-[family-name:var(--font-roboto-mono)]">
                De ce noi
              </p>
              <h2 className="text-4xl sm:text-5xl font-bold tracking-tight font-[family-name:var(--font-exo)]">
                Construit pentru cercetători.
              </h2>
            </div>
          </Reveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Feature
              delay={0}
              title="Puritate verificată HPLC"
              desc="Fiecare lot vine cu certificat de analiză (CoA) și rezultate HPLC disponibile la cerere."
              icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />}
            />
            <Feature
              delay={0.08}
              title="Lanț rece, ambalaj steril"
              desc="Peptidele sunt livrate liofilizate, în flacoane sigilate, cu gheață uscată pentru stabilitate maximă."
              icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />}
            />
            <Feature
              delay={0.16}
              title="Cont securizat & istoric"
              desc="Plasează comenzi, urmărește statusul, reordonează cu un click. Email tranzacțional la fiecare pas."
              icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />}
            />
          </div>
        </div>
      </section>
    </>
  )
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="p-5 text-foreground">
      <p className="text-2xl sm:text-3xl font-bold font-[family-name:var(--font-exo)]">{value}</p>
      <p className="text-xs uppercase tracking-wider mt-1 font-[family-name:var(--font-roboto-mono)] text-muted-fg">{label}</p>
    </div>
  )
}

function Feature({
  title,
  desc,
  icon,
  delay,
}: {
  title: string
  desc: string
  icon: React.ReactNode
  delay: number
}) {
  return (
    <Reveal delay={delay}>
      <div className="liquid-glass relative p-6 h-full hover:border-[var(--accent)]/40 transition-colors">
        <div className="absolute -top-4 left-6 h-10 w-10 rounded-md bg-[var(--accent)]/15 border border-[var(--accent)]/30 flex items-center justify-center glow-accent">
          <svg className="h-5 w-5 text-[var(--accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {icon}
          </svg>
        </div>
        <h3 className="mt-4 text-lg font-semibold text-foreground font-[family-name:var(--font-exo)]">{title}</h3>
        <p className="mt-2 text-sm text-muted-fg leading-relaxed">{desc}</p>
      </div>
    </Reveal>
  )
}
