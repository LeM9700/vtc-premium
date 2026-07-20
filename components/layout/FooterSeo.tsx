'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const VILLES = [
  { label: 'VTC Montpellier', href: '/vtc-montpellier' },
  { label: 'VTC Nîmes',       href: '/vtc-nimes'       },
]

const SERVICES = [
  { label: 'Transfert Aéroport Montpellier',   href: '/transfert-aeroport-montpellier'          },
  { label: 'VTC Mariage Gard & Hérault',       href: '/vtc-mariage-gard'                        },
  { label: 'Chauffeur Privé Professionnel',    href: '/chauffeur-prive-professionnel-occitanie'  },
  { label: 'Longue Distance Occitanie',        href: '/longue-distance-occitanie'                },
  { label: 'À propos',                         href: '/a-propos'                                 },
]

export default function FooterSeo() {
  const pathname = usePathname()

  return (
    <footer className="relative bg-[#0A0A0A] px-6 sm:px-8 md:px-24 py-16 border-t border-[#F5F0E8]/10">
      <div className="absolute top-0 left-6 sm:left-8 md:left-24 right-6 sm:right-8 md:right-24 h-px bg-gradient-to-r from-transparent via-[#C9A96E]/20 to-transparent" />

      <div className="flex flex-col md:flex-row gap-12 md:gap-24">

        {/* Villes */}
        <nav aria-label="Villes desservies">
          <p className="text-[#C9A96E] text-xs tracking-[0.5em] uppercase font-light mb-6">
            Villes
          </p>
          <ul className="flex flex-col gap-3">
            {VILLES.map(({ label, href }) => (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={pathname === href ? 'page' : undefined}
                  className="inline-block p-2 -m-2 text-[#F5F0E8]/60 text-sm tracking-wide font-light hover:text-[#C9A96E] transition-colors duration-300 aria-[current=page]:text-[#C9A96E]"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Divider */}
        <div className="hidden md:block w-px bg-[#F5F0E8]/10 self-stretch" aria-hidden />

        {/* Services */}
        <nav aria-label="Nos services">
          <p className="text-[#C9A96E] text-xs tracking-[0.5em] uppercase font-light mb-6">
            Services
          </p>
          <ul className="flex flex-col gap-3">
            {SERVICES.map(({ label, href }) => (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={pathname === href ? 'page' : undefined}
                  className="inline-block p-2 -m-2 text-[#F5F0E8]/60 text-sm tracking-wide font-light hover:text-[#C9A96E] transition-colors duration-300 aria-[current=page]:text-[#C9A96E]"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

      </div>

      <div className="mt-12 pt-8 border-t border-[#F5F0E8]/5 flex flex-col items-center gap-4">
        <p className="text-[#F5F0E8]/60 text-xs tracking-[0.4em] uppercase text-center font-light">
          Chauffeur Privé · Occitanie · Disponible 24h/24
        </p>
        <nav aria-label="Informations légales" className="flex gap-6">
          <Link
            href="/mentions-legales"
            className="inline-block p-2 -m-2 text-[#F5F0E8]/60 text-xs tracking-widest uppercase hover:text-[#C9A96E] transition-colors duration-300"
          >
            Mentions légales
          </Link>
          <Link
            href="/politique-de-confidentialite"
            className="inline-block p-2 -m-2 text-[#F5F0E8]/60 text-xs tracking-widest uppercase hover:text-[#C9A96E] transition-colors duration-300"
          >
            Politique de confidentialité
          </Link>
        </nav>
      </div>
    </footer>
  )
}
