import Link from 'next/link'
import { createServerSupabase } from '@/lib/supabase-server'
import ProductCard from '@/components/ProductCard'
import MoleculeHero from '@/components/MoleculeHero'
import AmbientBlobs from '@/components/AmbientBlobs'
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
      {/* Hero ----------------------------------------------------------- */}
      <section className="relative overflow-hidden">
        <AmbientBlobs />
        <div className="absolute inset-0 -z-0">
          <MoleculeHero />
        </div>

        <div className="relative max-w-7xl mx-auto py-32 sm:py-40 px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <Reveal>
              <span className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--accent)] mb-6 font-[family-name:var(--font-roboto-mono)]">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-pulse" />
                HPLC ≥ 98% · Livrare în România
              </span>
            </Reveal>

            <Reveal delay={0.05}>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.05] font-[family-name:var(--font-exo)]">
                Peptide de înaltă puritate
                <span className="block text-gradient">pentru cercetare avansată.</span>
              </h1>
            </Reveal>

            <Reveal delay={0.1}>
              <p className="mt-6 max-w-xl text-lg text-muted-fg leading-relaxed">
                BPC-157, Semax, Selank, GHK-Cu, Retatrutida, Klow — fiecare lot
                cu certificat de analiză, puritate verificată ≥ 98%, livrare cu lanț rece.
              </p>
            </Reveal>

            <Reveal delay={0.15}>
              <div className="mt-10 flex flex-col sm:flex-row gap-3">
                <Link
                  href="/produse"
                  className="inline-flex items-center justify-center px-7 py-3.5 rounded-md bg-[var(--accent)] text-[var(--accent-fg)] text-sm font-semibold hover:brightness-110 transition-all glow-accent"
                >
                  Vezi toate produsele
                  <svg className="ml-2 w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14M13 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </Link>
                <Link
                  href="/calitate"
                  className="inline-flex items-center justify-center px-7 py-3.5 rounded-md border border-[var(--border)] bg-[var(--surface)]/40 text-foreground text-sm font-semibold hover:border-[var(--accent)] hover:text-[var(--accent)] transition-all backdrop-blur"
                >
                  Standarde de calitate
                </Link>
              </div>
            </Reveal>
          </div>

          {/* stats strip */}
          <Reveal delay={0.25}>
            <dl className="mt-20 grid grid-cols-2 sm:grid-cols-4 gap-px bg-[var(--border)] rounded-[var(--radius)] overflow-hidden glass max-w-3xl">
              <Stat value="98%+" label="Puritate HPLC" />
              <Stat value="2-5z" label="Livrare RO" />
              <Stat value="6+" label="Compuși disponibili" />
              <Stat value="CoA" label="Per lot, la cerere" />
            </dl>
          </Reveal>
        </div>
      </section>

      {/* Warning banner ------------------------------------------------- */}
      <div className="bg-[var(--warning)]/10 border-y border-[var(--warning)]/30">
        <div className="max-w-7xl mx-auto py-3 px-4 text-center">
          <p className="text-xs sm:text-sm font-medium text-[var(--warning)]">
            <strong>AVERTISMENT:</strong> Produsele sunt destinate exclusiv cercetării profesionale în laborator. Nu sunt destinate consumului uman. Minim 18 ani.
          </p>
        </div>
      </div>

      {/* Products ------------------------------------------------------- */}
      <section className="relative max-w-7xl mx-auto py-24 px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--accent)] mb-3 font-[family-name:var(--font-roboto-mono)]">
                Catalog
              </p>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight font-[family-name:var(--font-exo)]">
                Produse recomandate
              </h2>
            </div>
            <Link href="/produse" className="text-sm text-[var(--accent)] hover:underline font-medium hidden sm:inline-flex items-center gap-1">
              Vezi toate
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M13 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          </div>
        </Reveal>

        {products.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((p, i) => (
              <Reveal key={p.id} delay={Math.min(i * 0.06, 0.36)}>
                <ProductCard product={p} />
              </Reveal>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-muted-fg">
            <p>Produsele se încarcă. Configurează Supabase și rulează schema SQL.</p>
          </div>
        )}
      </section>

      {/* Features ------------------------------------------------------- */}
      <section className="relative py-24 bg-[var(--surface)] border-y border-[var(--border)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="max-w-2xl mb-16">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--accent)] mb-3 font-[family-name:var(--font-roboto-mono)]">
                De ce noi
              </p>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight font-[family-name:var(--font-exo)]">
                Construit pentru cercetători.
              </h2>
            </div>
          </Reveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Feature
              delay={0}
              title="Puritate verificată HPLC"
              desc="Fiecare lot vine cu certificat de analiză (CoA) și rezultate HPLC disponibile la cerere."
              icon={
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              }
            />
            <Feature
              delay={0.08}
              title="Lanț rece, ambalaj steril"
              desc="Peptidele sunt livrate liofilizate, în flacoane sigilate, cu gheață uscată pentru stabilitate maximă."
              icon={
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              }
            />
            <Feature
              delay={0.16}
              title="Cont securizat & istoric"
              desc="Plasează comenzi, urmărește statusul, reordonează cu un click. Email tranzacțional la fiecare pas."
              icon={
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              }
            />
          </div>
        </div>
      </section>
    </>
  )
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="bg-[var(--surface)] p-5">
      <p className="text-2xl sm:text-3xl font-bold font-[family-name:var(--font-exo)] text-foreground">{value}</p>
      <p className="text-xs text-muted-fg uppercase tracking-wider mt-1 font-[family-name:var(--font-roboto-mono)]">{label}</p>
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
      <div className="relative p-6 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface-2)] hover:border-[var(--accent)]/40 transition-colors">
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
