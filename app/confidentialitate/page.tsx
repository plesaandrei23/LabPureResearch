import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Politica de confidențialitate',
  description: 'Cum colectează și prelucrează PeptideResearch.ro datele cu caracter personal, conform GDPR.',
}

const LAST_UPDATED = '16 mai 2026'

export default function ConfidentialitatePage() {
  return (
    <div className="max-w-3xl mx-auto pt-28 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="mb-10">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--accent)] mb-3 font-[family-name:var(--font-roboto-mono)]">Legal</p>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-foreground font-[family-name:var(--font-exo)]">Politica de confidențialitate</h1>
        <p className="mt-3 text-sm text-muted-fg">Ultima actualizare: {LAST_UPDATED}</p>
      </div>

      <div className="space-y-8 text-sm text-muted-fg leading-relaxed">
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2 font-[family-name:var(--font-exo)]">1. Cine suntem</h2>
          <p>
            PeptideResearch.ro („noi”, „Operatorul”) este operator de date cu caracter personal pentru
            informațiile colectate prin site-ul peptideresearch.ro. Ne poți contacta la{' '}
            <a href="mailto:infopeptideresearch@gmail.com" className="text-[var(--accent)] hover:underline">
              infopeptideresearch@gmail.com
            </a>.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2 font-[family-name:var(--font-exo)]">2. Ce date colectăm</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>Date de cont: email, parolă (stocată criptografic prin Supabase Auth).</li>
            <li>Date de livrare: nume complet, telefon, adresă, oraș, județ, cod poștal.</li>
            <li>Date de comandă: produsele comandate, valoarea, status, eventuale note.</li>
            <li>Date tehnice: adresa IP, tip browser, paginile vizitate (jurnale de acces).</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2 font-[family-name:var(--font-exo)]">3. Scopul prelucrării</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>Procesarea și livrarea comenzilor.</li>
            <li>Comunicare privind statusul comenzii (email tranzacțional).</li>
            <li>Îndeplinirea obligațiilor legale (facturare, contabilitate).</li>
            <li>Securitatea site-ului și prevenirea fraudei.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2 font-[family-name:var(--font-exo)]">4. Temeiul legal</h2>
          <p>Prelucrăm datele tale în baza articolului 6 din Regulamentul (UE) 2016/679 (GDPR):</p>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li><strong>art. 6(1)(b)</strong> – executarea contractului de vânzare (comandă).</li>
            <li><strong>art. 6(1)(c)</strong> – obligații legale (fiscalitate, contabilitate).</li>
            <li><strong>art. 6(1)(f)</strong> – interes legitim (securitate, prevenirea fraudei).</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2 font-[family-name:var(--font-exo)]">5. Cui transmitem datele</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>Supabase Inc.</strong> – hosting bază de date și autentificare. Regiune UE (Frankfurt). Operator independent: Supabase Inc., SUA, cu clauze contractuale standard (SCC).</li>
            <li><strong>Vercel Inc.</strong> – hosting site, SUA, cu clauze contractuale standard (SCC) conform Deciziei UE 2021/914.</li>
            <li><strong>Resend Inc.</strong> – furnizor email tranzacțional, SUA, cu clauze contractuale standard (SCC). Datele transferate: nume, adresă email, conținutul emailului tranzacțional (confirmare comandă, actualizări status).</li>
            <li><strong>Curieri</strong> (Sameday, Fan Courier, sau alți parteneri logistici) – pentru livrarea coletelor.</li>
            <li><strong>Autorități publice</strong> – doar la solicitare legală.</li>
          </ul>
          <p className="mt-2">Nu vindem datele tale către terți. Transferurile către SUA se fac în baza Cadrului UE-SUA pentru protecția datelor (EU-U.S. Data Privacy Framework) și/sau clauze contractuale standard aprobate de Comisia Europeană.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2 font-[family-name:var(--font-exo)]">6. Cât timp păstrăm datele</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>Date de cont: pe durata existenței contului.</li>
            <li>Date privind comenzile: 10 ani (obligație fiscală – art. 25 alin. 1 Cod Fiscal).</li>
            <li>Jurnale tehnice: până la 12 luni.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2 font-[family-name:var(--font-exo)]">7. Drepturile tale</h2>
          <p className="mb-2">Conform GDPR, ai dreptul:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>de acces la datele tale;</li>
            <li>de rectificare a datelor inexacte;</li>
            <li>de ștergere („dreptul de a fi uitat”), în limita obligațiilor legale;</li>
            <li>de restricționare a prelucrării;</li>
            <li>la portabilitatea datelor;</li>
            <li>de opoziție la prelucrare;</li>
            <li>de a nu fi supus unei decizii bazate exclusiv pe prelucrare automată.</li>
          </ul>
          <p className="mt-2">
            Pentru exercitarea acestor drepturi scrie-ne la{' '}
            <a href="mailto:infopeptideresearch@gmail.com" className="text-[var(--accent)] hover:underline">
              infopeptideresearch@gmail.com
            </a>.
            Vei primi un răspuns în maximum 30 de zile.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2 font-[family-name:var(--font-exo)]">8. Plângeri</h2>
          <p>
            Dacă apreciezi că drepturile tale au fost încălcate, te poți adresa{' '}
            <a
              href="https://www.dataprotection.ro"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--accent)] hover:underline"
            >
              Autorității Naționale de Supraveghere a Prelucrării Datelor cu Caracter Personal
              (ANSPDCP)
            </a>.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2 font-[family-name:var(--font-exo)]">9. Cookie-uri</h2>
          <p>
            Utilizăm cookie-uri strict necesare pentru funcționarea coșului de cumpărături și pentru
            autentificare. Nu folosim cookie-uri de marketing sau de profilare. Poți șterge oricând
            cookie-urile din setările browserului.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2 font-[family-name:var(--font-exo)]">10. Modificări</h2>
          <p>
            Această politică poate fi actualizată. Versiunea în vigoare este cea afișată pe această pagină,
            împreună cu data ultimei actualizări.
          </p>
        </section>

        <div className="mt-10 liquid-glass p-4">
          <p className="text-xs text-[var(--warning)]">
            <strong>Notă:</strong> acest document este un șablon orientativ și nu înlocuiește o
            consultanță juridică. Recomandăm validarea de către un avocat sau DPO înainte de
            publicare.
          </p>
        </div>
      </div>
    </div>
  )
}
