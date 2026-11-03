import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Mentions légales',
  description: 'Mentions légales de VTCLAND — éditeur, hébergement, propriété intellectuelle.',
  alternates: { canonical: '/mentions-legales' },
  robots: { index: true, follow: true },
}

export default function MentionsLegalesPage() {
  return (
    <main className="min-h-screen bg-[#0A0A0A] text-[#F5F0E8] px-6 md:px-24 py-32">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <div className="h-px w-16 bg-[#C9A96E]" />
          <span className="text-[#C9A96E] text-xs tracking-[0.5em] uppercase font-light">
            Informations légales
          </span>
        </div>

        <h1 className="font-display text-4xl md:text-5xl font-light mb-12">
          Mentions légales
        </h1>

        <div className="space-y-10 text-[#F5F0E8]/70 text-sm leading-relaxed font-light">
          <section>
            <h2 className="text-[#F5F0E8] text-lg font-normal mb-3">Éditeur du site</h2>
            <p>
              Le site VTCLAND (vtcland.fr) est édité par Malik EL BOAZZATI, exerçant sous le nom commercial
              « VTCLAND » en tant qu&apos;auto-entrepreneur (entreprise individuelle), immatriculé sous le
              numéro SIRET 849 592 837, dont le siège social est situé 207A rue de l&apos;Ancien Four, 30260
              Montmirat, Gard, Occitanie, France.
            </p>
            <p className="mt-3">
              Directeur de la publication : Malik EL BOAZZATI.
            </p>
            <p className="mt-3">
              Contact : <a href="tel:0783699229" className="text-[#C9A96E] hover:text-[#F5F0E8] transition-colors">07 83 69 92 29</a>
              {' · '}
              <a href="mailto:vtcland.contact@gmail.com" className="text-[#C9A96E] hover:text-[#F5F0E8] transition-colors">vtcland.contact@gmail.com</a>
            </p>
          </section>

          <section>
            <h2 className="text-[#F5F0E8] text-lg font-normal mb-3">Hébergement</h2>
            <p>
              Le site est hébergé par Railway Corporation, 548 Market St PMB 68956, San Francisco, CA 94104,
              États-Unis (railway.com).
            </p>
            <p className="mt-3 text-[#F5F0E8]/60 text-xs">
              Adresse identifiée par recherche publique, non confirmée directement auprès de l&apos;hébergeur —
              à vérifier avant publication, notamment une fois le déploiement effectif réalisé sur cette
              plateforme.
            </p>
          </section>

          <section>
            <h2 className="text-[#F5F0E8] text-lg font-normal mb-3">Propriété intellectuelle</h2>
            <p>
              L&apos;ensemble des contenus présents sur ce site (textes, images, vidéos, éléments graphiques,
              logo) est protégé par le droit d&apos;auteur. Toute reproduction, représentation, modification ou
              exploitation, totale ou partielle, sans autorisation préalable écrite, est interdite.
            </p>
          </section>

          <section>
            <h2 className="text-[#F5F0E8] text-lg font-normal mb-3">Assistant conversationnel « Élia »</h2>
            <p>
              L&apos;assistant de réservation « Élia » repose sur un modèle de langage fourni par Anthropic
              (États-Unis). Les échanges avec Élia ont pour seule finalité la préparation d&apos;un devis de
              transport. Voir notre{' '}
              <a href="/politique-de-confidentialite" className="text-[#C9A96E] hover:text-[#F5F0E8] transition-colors underline underline-offset-2">
                politique de confidentialité
              </a>{' '}
              pour le détail des données traitées.
            </p>
          </section>

          <section>
            <h2 className="text-[#F5F0E8] text-lg font-normal mb-3">Contact</h2>
            <p>
              Pour toute question relative au site ou à ces mentions légales, vous pouvez nous joindre au{' '}
              <a href="tel:0783699229" className="text-[#C9A96E] hover:text-[#F5F0E8] transition-colors">07 83 69 92 29</a>.
            </p>
          </section>
        </div>
      </div>
    </main>
  )
}
