const TIERS = [
  { label: 'Tous les trajets', detail: 'Distance routière calculée', price: '2€/km', note: 'Tarif unique' },
  { label: 'Minimum course', detail: 'Quelle que soit la distance', price: '20€', note: 'Minimum' },
  { label: 'Mise à disposition', detail: 'Calculée à la minute', price: '70€/h', note: 'Tarif horaire' },
  { label: 'Nuit · dimanche · férié', detail: 'Aucune majoration', price: '+0€', note: 'Sans supplément' },
] as const

/**
 * Grille tarifaire indicative exposée en HTML crawlable — Google et les
 * moteurs IA ne peuvent citer un prix que s'il est publiquement lisible.
 * Le tarif exact reste toujours calculé et confirmé par Élia.
 */
export default function PricingSection() {
  return (
    <section className="relative bg-[#0A0A0A] px-6 sm:px-8 md:px-24 py-20 sm:py-24 md:py-32 border-t border-[#F5F0E8]/10">
      <div className="flex items-center gap-4 mb-8">
        <div className="h-px w-16 bg-[#C9A96E]" />
        <span className="text-[#C9A96E] text-xs tracking-[0.5em] uppercase font-light">
          Tarifs indicatifs
        </span>
      </div>

      <h2 className="font-display text-[#F5F0E8] text-3xl sm:text-4xl md:text-5xl font-light mb-16 max-w-2xl">
        Une tarification claire,<br />
        <em className="text-[#C9A96E] not-italic">confirmée avant chaque trajet.</em>
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {TIERS.map((tier) => (
          <div key={tier.label} className="border border-[#F5F0E8]/10 p-8">
            <p className="text-[#C9A96E] text-xs tracking-widest uppercase mb-4">{tier.note}</p>
            <p className="font-display text-[#F5F0E8] text-3xl font-light mb-2">{tier.price}</p>
            <p className="text-[#F5F0E8] text-sm mb-1">{tier.label}</p>
            <p className="text-[#F5F0E8]/60 text-sm font-light">{tier.detail}</p>
          </div>
        ))}
      </div>

      <p className="text-[#F5F0E8]/60 text-sm font-light mt-10 max-w-2xl">
        Le tarif exact de votre trajet est calculé automatiquement par Élia à partir de vos adresses
        réelles. Votre validation envoie une demande ; la course est confirmée uniquement après acceptation du chauffeur.
      </p>
    </section>
  )
}
