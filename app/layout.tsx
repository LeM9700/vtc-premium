import type { Metadata } from 'next'
import { Cormorant_Garamond, DM_Sans } from 'next/font/google'
import SmoothScroller from '@/components/layout/SmoothScroller'
import CustomCursor   from '@/components/ui/CustomCursor'
import LoadingScreen  from '@/components/ui/LoadingScreen'
import JsonLd         from '@/components/seo/JsonLd'
import FooterSeo      from '@/components/layout/FooterSeo'
import FloatingActionMenu from '@/components/ui/FloatingActionMenu'
import '@/app/globals.css'

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-cormorant',
  display: 'swap',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  variable: '--font-dm-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://vtcland.fr'),
  title: {
    default: 'VTCLAND — Chauffeur Privé Montpellier & Nîmes | Occitanie',
    template: '%s | VTCLAND Chauffeur Privé Occitanie',
  },
  description:
    "VTCLAND, chauffeur privé d'exception en Occitanie. Transferts aéroport Montpellier-Méditerranée et Nîmes-Camargue, VTC événementiel Gard & Hérault, longue distance. Disponible 24h/24.",
  keywords: [
    'VTC Montpellier',
    'chauffeur privé Nîmes',
    'VTC Occitanie',
    'transfert aéroport Montpellier Méditerranée',
    'chauffeur privé Gard',
    'VTC mariage Hérault',
    'VTCLAND',
    'chauffeur privé professionnel Occitanie',
  ],
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    siteName: 'VTCLAND',
    title: 'VTCLAND — Chauffeur Privé Montpellier & Nîmes',
    description:
      "Votre chauffeur privé d'exception en Occitanie. Disponible 24h/24 dans le Gard et l'Hérault.",
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'VTCLAND Chauffeur Privé Occitanie',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'VTCLAND — Chauffeur Privé Montpellier & Nîmes',
    description: "Votre chauffeur privé d'exception en Occitanie. Disponible 24h/24.",
    images: ['/og-image.jpg'],
  },
  robots: { index: true, follow: true },
  alternates: { canonical: '/' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${cormorant.variable} ${dmSans.variable}`}>
      <body className="bg-[#0A0A0A] text-[#F5F0E8] overflow-x-hidden">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:bg-[#C9A96E] focus:text-[#0A0A0A] focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:rounded-sm"
        >
          Aller au contenu principal
        </a>
        <JsonLd />
        <LoadingScreen />
        <SmoothScroller>
          <CustomCursor />
          <div id="main-content" tabIndex={-1}>
            {children}
          </div>
          <FooterSeo />
        </SmoothScroller>
        <FloatingActionMenu />
      </body>
    </html>
  )
}