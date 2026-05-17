import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Calitate & Certificate',
  description: 'Standardele de calitate PeptideResearch.ro: puritate HPLC, certificate de analiză, stocare și livrare.',
}

export default function CalitatePage() {
  return (
    <div className="max-w-4xl mx-auto pt-28 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-14">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--accent)] mb-3 font-[family-name:var(--font-roboto-mono)]">
          Standarde
        </p>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-foreground font-[family-name:var(--font-exo)]">
          Calitate verificată
        </h1>
        <p className="mt-4 text-lg text-muted-fg max-w-2xl mx-auto">
          Fiecare produs este verificat riguros înainte de livrare.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card
          icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />}
          title="Certificat de Analiză (CoA)"
          desc="La fiecare comandă poți solicita certificatul de analiză aferent lotului livrat. Documentul include: puritate HPLC, masa moleculară verificată, număr lot."
        />
        <Card
          icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />}
          title="Liofilizare & Stocare"
          desc="Toate peptidele sunt livrate sub formă liofilizată, în flacoane sterile sigilate. Temperatura recomandată: −20°C. Stabilitate: 24 luni de la data fabricației."
        />
        <Card
          icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7l9 6 9-6M3 7v10a2 2 0 002 2h14a2 2 0 002-2V7M3 7l9-4 9 4" />}
          title="Ambalaj & Transport"
          desc="Comenzile sunt ambalate discret, cu elemente de răcire pentru menținerea stabilității pe durata transportului. Livrare prin curier în 2–5 zile lucrătoare."
        />
        <Card
          icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />}
          title="Puritate HPLC ≥ 98%"
          desc="Toate loturile sunt analizate prin cromatografie de înaltă performanță. Loturile cu puritate sub prag sunt respinse înainte de comercializare."
        />
      </div>

      <div className="liquid-glass mt-12 p-6 flex items-start gap-4">
        <div className="h-10 w-10 rounded-md bg-[var(--warning)]/15 border border-[var(--warning)]/30 flex items-center justify-center flex-shrink-0">
          <svg className="h-5 w-5 text-[var(--warning)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <div>
          <h2 className="text-base font-semibold text-foreground mb-2 font-[family-name:var(--font-exo)]">
            Avertisment obligatoriu
          </h2>
          <p className="text-sm text-muted-fg leading-relaxed">
            Produsele furnizate de PeptideResearch.ro sunt destinate{' '}
            <strong className="text-foreground">exclusiv cercetării în laborator</strong>.
            Nu sunt aprobate pentru uz uman, veterinar sau alimentar. Utilizarea
            necorespunzătoare este responsabilitatea exclusivă a cumpărătorului.
          </p>
        </div>
      </div>
    </div>
  )
}

function Card({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="liquid-glass relative p-6 hover:border-[var(--accent)]/40 transition-colors">
      <div className="absolute -top-4 left-6 h-10 w-10 rounded-md bg-[var(--accent)]/15 border border-[var(--accent)]/30 flex items-center justify-center glow-accent">
        <svg className="h-5 w-5 text-[var(--accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          {icon}
        </svg>
      </div>
      <h2 className="mt-4 text-lg font-semibold text-foreground font-[family-name:var(--font-exo)]">{title}</h2>
      <p className="mt-2 text-sm text-muted-fg leading-relaxed">{desc}</p>
    </div>
  )
}
