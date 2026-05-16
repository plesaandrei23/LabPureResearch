import type { Metadata } from 'next'
import { Exo, Roboto_Mono } from 'next/font/google'
import './globals.css'
import { CartProvider } from '@/components/CartProvider'
import { ThemeProvider, THEME_INIT_SCRIPT } from '@/components/ThemeProvider'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import ScrollScene from '@/components/ScrollScene'

const exo = Exo({
  subsets: ['latin', 'latin-ext'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-exo',
  display: 'swap',
})
const robotoMono = Roboto_Mono({
  subsets: ['latin'],
  weight: ['300', '400', '500', '700'],
  variable: '--font-roboto-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'PeptideResearch.ro – Peptide de Înaltă Puritate pentru Cercetare',
    template: '%s | PeptideResearch.ro',
  },
  description:
    'Cumpără peptide de înaltă puritate în România: BPC-157, Semax, Selank, GHK-Cu, Retatrutida, Klow. Livrare rapidă, certificate de analiză HPLC.',
  keywords: [
    'peptide romania',
    'cumpara peptide',
    'BPC-157 romania',
    'Semax romania',
    'Selank romania',
    'GHK-Cu romania',
    'Retatrutida romania',
    'peptide cercetare',
    'peptideresearch',
  ],
  robots: 'index, follow',
  openGraph: {
    siteName: 'PeptideResearch.ro',
    locale: 'ro_RO',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ro" suppressHydrationWarning className={`h-full ${exo.variable} ${robotoMono.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="text-foreground antialiased flex flex-col min-h-full">
        <ThemeProvider>
          {/* Persistent layers: page gradient (back) → 3D vial stage (mid) → content (front) */}
          <div className="page-bg" aria-hidden />
          <ScrollScene />
          <CartProvider>
            <Navbar />
            <div className="relative z-10 flex flex-col flex-grow">
              <main className="flex-grow">{children}</main>
              <Footer />
            </div>
          </CartProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
