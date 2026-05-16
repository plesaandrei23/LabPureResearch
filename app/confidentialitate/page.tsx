import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Politica de confidențialitate',
  description: 'Cum colectează și prelucrează PeptideResearch.ro datele cu caracter personal, conform GDPR.',
}

const LAST_UPDATED = '16 mai 2026'

export default function ConfidentialitatePage() {
  return (
    <div className="max-w-3xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
      <div className="mb-10">
        <h1 className="text-3xl font-extrabold text-neutral-900">Politica de confidențialitate</h1>
        <p className="mt-2 text-sm text-neutral-500">Ultima actualizare: {LAST_UPDATED}</p>
      </div>

      <div className="space-y-8 text-sm text-neutral-700 leading-relaxed">
        <section>
          <h2 className="text-lg font-semibold text-neutral-900 mb-2">1. Cine suntem</h2>
          <p>
            PeptideResearch.ro („noi”, „Operatorul”) este operator de date cu caracter personal pentru
            informațiile colectate prin site-ul peptideresearch.ro. Ne poți contacta la{' '}
            <a href="mailto:infopeptideresearch@gmail.com" className="text-blue-600 hover:underline">
              infopeptideresearch@gmail.com
            </a>.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-neutral-900 mb-2">2. Ce date colectăm</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>Date de cont: email, parolă (stocată criptografic prin Supabase Auth).</li>
            <li>Date de livrare: nume complet, telefon, adresă, oraș, județ, cod poștal.</li>
            <li>Date de comandă: produsele comandate, valoarea, status, eventuale note.</li>
            <li>Date tehnice: adresa IP, tip browser, paginile vizitate (jurnale de acces).</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-neutral-900 mb-2">3. Scopul prelucrării</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>Procesarea și livrarea comenzilor.</li>
            <li>Comunicare privind statusul comenzii (email tranzacțional).</li>
            <li>Îndeplinirea obligațiilor legale (facturare, contabilitate).</li>
            <li>Securitatea site-ului și prevenirea fraudei.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-neutral-900 mb-2">4. Temeiul legal</h2>
          <p>Prelucrăm datele tale în baza articolului 6 din Regulamentul (UE) 2016/679 (GDPR):</p>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li><strong>art. 6(1)(b)</strong> – executarea contractului de vânzare (comandă).</li>
            <li><strong>art. 6(1)(c)</strong> – obligații legale (fiscalitate, contabilitate).</li>
            <li><strong>art. 6(1)(f)</strong> – interes legitim (securitate, prevenirea fraudei).</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-neutral-900 mb-2">5. Cui transmitem datele</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>Supabase</strong> – hosting bază de date și autentificare (UE).</li>
            <li><strong>Vercel</strong> – hosting site (UE/SUA, cu clauze contractuale standard).</li>
            <li><strong>Resend</strong> – furnizor email tranzacțional.</li>
            <li>Curieri – pentru livrarea coletelor.</li>
            <li>Autorități publice – la solicitare legală.</li>
          </ul>
          <p className="mt-2">Nu vindem datele tale către terți.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-neutral-900 mb-2">6. Cât timp păstrăm datele</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>Date de cont: pe durata existenței contului.</li>
            <li>Date privind comenzile: 10 ani (obligație fiscală – art. 25 alin. 1 Cod Fiscal).</li>
            <li>Jurnale tehnice: până la 12 luni.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-neutral-900 mb-2">7. Drepturile tale</h2>
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
            <a href="mailto:infopeptideresearch@gmail.com" className="text-blue-600 hover:underline">
              infopeptideresearch@gmail.com
            </a>.
            Vei primi un răspuns în maximum 30 de zile.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-neutral-900 mb-2">8. Plângeri</h2>
          <p>
            Dacă apreciezi că drepturile tale au fost încălcate, te poți adresa{' '}
            <a
              href="https://www.dataprotection.ro"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              Autorității Naționale de Supraveghere a Prelucrării Datelor cu Caracter Personal
              (ANSPDCP)
            </a>.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-neutral-900 mb-2">9. Cookie-uri</h2>
          <p>
            Utilizăm cookie-uri strict necesare pentru funcționarea coșului de cumpărături și pentru
            autentificare. Nu folosim cookie-uri de marketing sau de profilare. Poți șterge oricând
            cookie-urile din setările browserului.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-neutral-900 mb-2">10. Modificări</h2>
          <p>
            Această politică poate fi actualizată. Versiunea în vigoare este cea afișată pe această pagină,
            împreună cu data ultimei actualizări.
          </p>
        </section>

        <div className="mt-10 bg-amber-50 border border-amber-200 rounded-lg p-4">
          <p className="text-xs text-amber-800">
            <strong>Notă:</strong> acest document este un șablon orientativ și nu înlocuiește o
            consultanță juridică. Recomandăm validarea de către un avocat sau DPO înainte de
            publicare.
          </p>
        </div>
      </div>
    </div>
  )
}
