import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Calitate & Certificate',
  description: 'Standardele de calitate PeptideResearch.ro: puritate HPLC, certificate de analiză, stocare și livrare.',
}

export default function CalitatePage() {
  return (
    <div className="max-w-4xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-extrabold text-neutral-900">Calitate & Standarde</h1>
        <p className="mt-3 text-lg text-neutral-500">Fiecare produs este verificat riguros înainte de livrare.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

        <div className="bg-white border border-neutral-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-neutral-900 mb-3">Certificat de Analiză (CoA)</h2>
          <p className="text-sm text-neutral-500">La fiecare comandă poți solicita certificatul de analiză aferent lotului livrat. Documentul include: puritate HPLC, masa moleculară verificată, număr lot.</p>
        </div>
        <div className="bg-white border border-neutral-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-neutral-900 mb-3">Liofilizare & Stocare</h2>
          <p className="text-sm text-neutral-500">Toate peptidele sunt livrate sub formă liofilizată, în flakoane sterile sigilate. Temperatura recomandată de stocare: -20°C. Stabilitate: 24 luni de la data fabricației.</p>
        </div>
        <div className="bg-white border border-neutral-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-neutral-900 mb-3">Ambalaj & Transport</h2>
          <p className="text-sm text-neutral-500">Comenzile sunt ambalate discret, cu elemente de răcire (gel pack) pentru menținerea stabilității pe durata transportului. Livrare prin curier în 2-5 zile lucrătoare.</p>
        </div>
      </div>

      <div className="mt-12 bg-amber-50 border border-amber-200 rounded-lg p-6">
        <h2 className="text-base font-semibold text-amber-900 mb-2">Avertisment obligatoriu</h2>
        <p className="text-sm text-amber-800">
          Produsele furnizate de PeptideResearch.ro sunt destinate <strong>exclusiv cercetării în laborator</strong>. Nu sunt aprobate pentru uz uman, veterinar sau alimentar. Utilizarea necorespunzătoare este responsabilitatea exclusivă a cumpărătorului.
        </p>
      </div>
    </div>
  )
}
