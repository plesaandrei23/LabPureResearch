import type { Metadata } from 'next'
import './globals.css'
import { CartProvider } from '@/components/CartProvider'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: {
    default: 'PeptideResearch.ro – Peptide de Înaltă Puritate pentru Cercetare',
    template: '%s | PeptideResearch.ro',
  },
  description: 'Cumpără peptide de înaltă puritate în România: BPC-157, Semax, Selank, GHK-Cu, Retatrutida, Klow. Livrare rapidă, certificate de analiză HPLC.',
  keywords: ['peptide romania', 'cumpara peptide', 'BPC-157 romania', 'Semax romania', 'Selank romania', 'GHK-Cu romania', 'Retatrutida romania', 'peptide cercetare', 'peptideresearch'],
  robots: 'index, follow',
  openGraph: {
    siteName: 'PeptideResearch.ro',
    locale: 'ro_RO',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ro" className="h-full">
      <body className="bg-neutral-50 text-neutral-900 antialiased flex flex-col min-h-full">
        <CartProvider>
          <Navbar />
          <main className="flex-grow">
            {children}
          </main>
          <Footer />
        </CartProvider>
      </body>
    </html>
  )
}
