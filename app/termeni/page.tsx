import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Termeni și condiții',
  description: 'Termenii și condițiile de utilizare ai PeptideResearch.ro: comenzi, livrare, plată, retur și răspundere.',
}

const LAST_UPDATED = '16 mai 2026'

export default function TermeniPage() {
  return (
    <div className="max-w-3xl mx-auto pt-28 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="mb-10">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--accent)] mb-3 font-[family-name:var(--font-roboto-mono)]">Legal</p>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-foreground font-[family-name:var(--font-exo)]">Termeni și condiții</h1>
        <p className="mt-3 text-sm text-muted-fg">Ultima actualizare: {LAST_UPDATED}</p>
      </div>

      <div className="space-y-8 text-sm text-muted-fg leading-relaxed">
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2 font-[family-name:var(--font-exo)]">1. Despre acești termeni</h2>
          <p>
            Acești termeni guvernează relația dintre tine („Cumpărătorul”, „Cercetătorul”) și PeptideResearch.ro
            („noi”, „Vânzătorul”) cu privire la accesul și utilizarea site-ului{' '}
            <span className="font-medium">peptideresearch.ro</span> și la comenzile plasate prin acesta.
            Prin plasarea unei comenzi accepți integral acești termeni.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2 font-[family-name:var(--font-exo)]">2. Destinație și avertisment legal</h2>
          <p className="mb-2">
            Toate produsele comercializate prin PeptideResearch.ro sunt destinate{' '}
            <strong>exclusiv utilizării în cercetare de laborator</strong>. Nu sunt aprobate sau destinate
            consumului uman, utilizării ca supliment alimentar, medicament, dispozitiv medical, produs cosmetic
            sau pentru uz veterinar.
          </p>
          <p>
            Prin plasarea unei comenzi, Cumpărătorul declară pe propria răspundere că este o entitate
            (fizică sau juridică) implicată în activitate de cercetare științifică și că nu va folosi
            produsele pentru consum uman sau veterinar. Răspunderea pentru utilizarea necorespunzătoare
            aparține exclusiv Cumpărătorului.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2 font-[family-name:var(--font-exo)]">3. Eligibilitate</h2>
          <p>
            Cumpărătorul declară că are vârsta minimă de 18 ani și capacitate deplină de exercițiu.
            Ne rezervăm dreptul de a refuza orice comandă în lipsa acestor condiții.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2 font-[family-name:var(--font-exo)]">4. Plasarea comenzii</h2>
          <p>
            Comanda se consideră plasată în momentul confirmării ei prin email. Vânzătorul își rezervă
            dreptul de a anula sau modifica comanda în cazul unor erori de preț, stoc insuficient
            sau date de livrare incomplete. În acest caz Cumpărătorul va fi notificat și, dacă plata
            a fost efectuată, suma va fi restituită integral.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2 font-[family-name:var(--font-exo)]">5. Prețuri și plată</h2>
          <p>
            Toate prețurile afișate sunt exprimate în RON și includ TVA, dacă este aplicabil.
            Plata se efectuează prin metodele indicate la momentul plasării comenzii. Comanda este
            procesată după confirmarea plății.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2 font-[family-name:var(--font-exo)]">6. Livrare</h2>
          <p>
            Livrarea se realizează prin curier, în termen estimativ de 2–5 zile lucrătoare de la
            confirmarea comenzii, pe teritoriul României. Termenele pot varia în funcție de
            disponibilitatea produsului și de curier. Riscul pierderii sau deteriorării se transferă
            Cumpărătorului la momentul predării coletului.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2 font-[family-name:var(--font-exo)]">7. Dreptul de retragere și retur</h2>
          <p className="mb-2">
            Produsele comercializate sunt reactivi de cercetare cu cerințe stricte de păstrare
            (ambalaj steril, sigilare). Conform art. 16 din OUG 34/2014, dreptul de retragere nu se
            aplică produselor sigilate care, odată desigilate, nu pot fi returnate din motive de
            protecție a sănătății sau din motive de igienă.
          </p>
          <p>
            Pentru produsele livrate deteriorate sau neconforme, Cumpărătorul poate solicita
            înlocuirea sau restituirea sumei în termen de 48 de ore de la primirea coletului,
            cu documentare foto/video. Contactează-ne la{' '}
            <a href="mailto:infopeptideresearch@gmail.com" className="text-[var(--accent)] hover:underline">
              infopeptideresearch@gmail.com
            </a>.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2 font-[family-name:var(--font-exo)]">8. Răspundere</h2>
          <p>
            Vânzătorul nu răspunde pentru daunele rezultate din utilizarea necorespunzătoare a
            produselor, inclusiv – fără limitare – pentru consumul uman, veterinar sau alimentar.
            Responsabilitatea utilizării corecte, conform protocoalelor de laborator aplicabile,
            revine integral Cumpărătorului.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2 font-[family-name:var(--font-exo)]">9. Proprietate intelectuală</h2>
          <p>
            Întregul conținut al site-ului (texte, imagini, logo, structură) este proprietatea
            PeptideResearch.ro sau a partenerilor săi și este protejat de legislația privind drepturile
            de autor. Reproducerea fără acord scris este interzisă.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2 font-[family-name:var(--font-exo)]">10. Date cu caracter personal</h2>
          <p>
            Prelucrarea datelor cu caracter personal se face conform{' '}
            <a href="/confidentialitate" className="text-[var(--accent)] hover:underline">
              Politicii de confidențialitate
            </a>.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2 font-[family-name:var(--font-exo)]">11. Legea aplicabilă și jurisdicție</h2>
          <p>
            Acești termeni sunt guvernați de legea română. Eventualele litigii vor fi soluționate
            pe cale amiabilă, iar în caz contrar de instanțele competente din România. Pentru
            soluționarea alternativă a litigiilor poți accesa platforma{' '}
            <a
              href="https://ec.europa.eu/consumers/odr"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--accent)] hover:underline"
            >
              ec.europa.eu/consumers/odr
            </a>.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2 font-[family-name:var(--font-exo)]">12. Contact</h2>
          <p>
            PeptideResearch.ro · Email:{' '}
            <a href="mailto:infopeptideresearch@gmail.com" className="text-[var(--accent)] hover:underline">
              infopeptideresearch@gmail.com
            </a>
            {' '}· WhatsApp: +40 755 266 278
          </p>
        </section>

        <div className="mt-10 liquid-glass p-4">
          <p className="text-xs text-[var(--warning)]">
            <strong>Notă:</strong> acest document este un șablon orientativ și nu înlocuiește o
            consultanță juridică. Recomandăm validarea de către un avocat înainte de publicare,
            pentru a reflecta exact modelul tău de business și jurisdicția aplicabilă.
          </p>
        </div>
      </div>
    </div>
  )
}
