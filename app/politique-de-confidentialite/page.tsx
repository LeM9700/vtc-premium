import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Politique de confidentialité',
  description: 'Politique de confidentialité de VTCLAND — données collectées, sous-traitants, droits RGPD.',
  alternates: { canonical: '/politique-de-confidentialite' },
  robots: { index: true, follow: true },
}

export default function PolitiqueConfidentialitePage() {
  return (
    <main className="min-h-screen bg-[#0A0A0A] text-[#F5F0E8] px-6 md:px-24 py-32">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <div className="h-px w-16 bg-[#C9A96E]" />
          <span className="text-[#C9A96E] text-xs tracking-[0.5em] uppercase font-light">
            Vos données
          </span>
        </div>

        <h1 className="font-display text-4xl md:text-5xl font-light mb-4">
          Politique de confidentialité
        </h1>
        <p className="text-[#F5F0E8]/60 text-xs uppercase tracking-widest mb-12">
          Dernière mise à jour : 19 novembre 2026
        </p>

        <div className="space-y-10 text-[#F5F0E8]/70 text-sm leading-relaxed font-light">
          <section>
            <h2 className="text-[#F5F0E8] text-lg font-normal mb-3">Responsable de traitement</h2>
            <p>
              VTCLAND (Malik EL BOAZZATI, auto-entrepreneur, SIRET 849 592 837), 207A rue de l&apos;Ancien Four,
              30260 Montmirat, Gard, Occitanie, France, est responsable du traitement des données collectées via
              ce site.
            </p>
          </section>

          <section>
            <h2 className="text-[#F5F0E8] text-lg font-normal mb-3">Données collectées</h2>
            <p>
              Lorsque vous échangez avec notre assistante de réservation « Élia », nous collectons les
              informations nécessaires à l&apos;établissement de votre devis : prénom et nom, numéro de
              téléphone, adresse email, adresses de départ et de destination, date et heure de prise en charge,
              nombre de passagers, options souhaitées et mode de paiement envisagé.
            </p>
            <p className="mt-3">
              Aucune donnée de paiement (numéro de carte bancaire) n&apos;est collectée ou traitée par ce site.
            </p>
          </section>

          <section>
            <h2 className="text-[#F5F0E8] text-lg font-normal mb-3">Finalité et base légale</h2>
            <p>
              Ces données sont utilisées exclusivement pour établir et vous transmettre un devis de transport,
              puis pour permettre à notre chauffeur de vous recontacter et d&apos;organiser votre trajet. Le
              traitement repose sur l&apos;exécution de mesures précontractuelles prises à votre demande
              (article 6.1.b du RGPD).
            </p>
          </section>

          <section>
            <h2 className="text-[#F5F0E8] text-lg font-normal mb-3">Destinataires et sous-traitants</h2>
            <p>Vos données peuvent être transmises aux prestataires techniques suivants, dans la stricte mesure nécessaire au fonctionnement du service :</p>
            <ul className="mt-3 space-y-2 list-disc list-inside">
              <li><span className="text-[#F5F0E8]">Anthropic</span> (États-Unis) — traitement conversationnel de votre demande par l&apos;assistante Élia, lorsqu&apos;elle est utilisée.</li>
              <li><span className="text-[#F5F0E8]">Google Maps Platform</span> — autocomplétion des adresses, calcul de l&apos;itinéraire et de la distance.</li>
              <li><span className="text-[#F5F0E8]">Telegram</span> — notification de la demande et transmission des informations nécessaires au chauffeur.</li>
              <li><span className="text-[#F5F0E8]">Resend</span> (États-Unis) — envoi et suivi technique des emails transactionnels.</li>
              <li><span className="text-[#F5F0E8]">Railway</span> (États-Unis) — hébergement du site, de l&apos;API et de la base de données PostgreSQL.</li>
              <li><span className="text-[#F5F0E8]">Cloudflare</span> — stockage chiffré des sauvegardes techniques de la base de données.</li>
              <li><span className="text-[#F5F0E8]">Sentry</span> (États-Unis) — journalisation technique des erreurs lorsque ce service est activé, à des fins de maintenance uniquement.</li>
            </ul>
            <p className="mt-3">
              Les transferts vers des prestataires situés hors de l&apos;Union européenne s&apos;appuient sur les
              clauses contractuelles types (CCT) proposées par ces prestataires dans le cadre de leurs accords
              de sous-traitance (DPA — Data Processing Agreement). Une revue juridique complète de ces accords
              par un professionnel du droit reste à mener avant tout trafic commercial significatif.
            </p>
          </section>

          <section>
            <h2 className="text-[#F5F0E8] text-lg font-normal mb-3">Durée de conservation</h2>
            <p>
              Les demandes, coordonnées client, changements de statut et historiques de notification sont
              enregistrés dans la base de données PostgreSQL de VTCLAND afin de traiter la demande, d&apos;assurer
              le suivi de la course et de gérer les éventuelles réclamations. Des sauvegardes techniques
              quotidiennes sont conservées pendant 30 jours.
            </p>
            <p className="mt-3">
              La durée de conservation opérationnelle définitive des demandes doit encore être formalisée et
              automatisée. Dans l&apos;intervalle, vous pouvez demander l&apos;effacement de vos données à tout moment,
              sous réserve des informations qui doivent être conservées pour respecter une obligation légale ou
              défendre un droit en justice.
            </p>
          </section>

          <section>
            <h2 className="text-[#F5F0E8] text-lg font-normal mb-3">Vos droits</h2>
            <p>
              Conformément au RGPD, vous disposez d&apos;un droit d&apos;accès, de rectification, d&apos;effacement
              et d&apos;opposition sur vos données personnelles. Pour l&apos;exercer, contactez-nous au{' '}
              <a href="tel:0783699229" className="text-[#C9A96E] hover:text-[#F5F0E8] transition-colors">07 83 69 92 29</a>{' '}
              ou par email à{' '}
              <a href="mailto:vtcland.contact@gmail.com" className="text-[#C9A96E] hover:text-[#F5F0E8] transition-colors">vtcland.contact@gmail.com</a>.
              Vous pouvez également introduire une réclamation auprès de la CNIL (www.cnil.fr).
            </p>
          </section>

          <section>
            <h2 className="text-[#F5F0E8] text-lg font-normal mb-3">Cookies et mesure d&apos;audience</h2>
            <p>
              Ce site n&apos;utilise aucun cookie de suivi publicitaire. Le suivi d&apos;erreurs Sentry, lorsqu&apos;il est
              activé, traite uniquement les informations techniques nécessaires au diagnostic de bugs et n&apos;est
              pas utilisé à des fins commerciales ou publicitaires.
            </p>
          </section>
        </div>
      </div>
    </main>
  )
}
