import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'À propos',
  description: "VTCLAND — chauffeur privé indépendant en Occitanie, présentation, zone d'intervention et engagement qualité.",
  alternates: { canonical: '/a-propos' },
}

export default function AProposPage() {
  return (
    <main className="min-h-screen bg-[#0A0A0A] text-[#F5F0E8] px-6 md:px-24 py-32">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <div className="h-px w-16 bg-[#C9A96E]" />
          <span className="text-[#C9A96E] text-xs tracking-[0.5em] uppercase font-light">
            À propos
          </span>
        </div>

        <h1 className="font-display text-4xl md:text-5xl font-light mb-12">
          Un chauffeur, une exigence.
        </h1>

        <div className="space-y-10 text-[#F5F0E8]/70 text-sm leading-relaxed font-light">
          <section>
            <h2 className="text-[#F5F0E8] text-lg font-normal mb-3">VTCLAND</h2>
            <p>
              VTCLAND est un service de chauffeur privé indépendant opérant en Occitanie, principalement
              autour de Montpellier et Nîmes, dans le Gard et l&apos;Hérault. Notre engagement : un service
              ponctuel, discret et personnalisé, disponible 24h/24 et 7j/7 — que ce soit pour un transfert
              aéroport, une mise à disposition professionnelle, un mariage ou un trajet longue distance.
            </p>
          </section>

          <section>
            <h2 className="text-[#F5F0E8] text-lg font-normal mb-3">Votre chauffeur</h2>
            <p>
              Malik EL BOAZZATI, chauffeur VTC titulaire de la carte professionnelle n° 0342439401, exerce en
              Occitanie depuis plus de 3 ans et a déjà effectué plus de 8 000 courses.
            </p>
          </section>

          <section>
            <h2 className="text-[#F5F0E8] text-lg font-normal mb-3">Zone d&apos;intervention</h2>
            <p>
              Montpellier, Nîmes, Avignon et l&apos;ensemble des départements du Gard et de l&apos;Hérault, avec
              des trajets longue distance possibles vers le reste de la France (Paris, Lyon, Marseille, Monaco,
              Genève).
            </p>
          </section>

          <section>
            <h2 className="text-[#F5F0E8] text-lg font-normal mb-3">Notre engagement</h2>
            <ul className="space-y-2 list-disc list-inside">
              <li>Ponctualité absolue et suivi des vols en temps réel pour les transferts aéroport</li>
              <li>Discrétion totale sur les trajets professionnels</li>
              <li>Véhicule entretenu, climatisé, avec Wi-Fi et chargeurs USB-C à bord</li>
              <li>Disponibilité 24h/24, 7j/7, y compris les jours fériés</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[#F5F0E8] text-lg font-normal mb-3">Réserver</h2>
            <p>
              La réservation se fait via notre assistante conversationnelle Élia, directement sur le site, ou
              par téléphone au{' '}
              <a href="tel:0783699229" className="text-[#C9A96E] hover:text-[#F5F0E8] transition-colors">
                07 83 69 92 29
              </a>.
            </p>
          </section>
        </div>
      </div>
    </main>
  )
}
