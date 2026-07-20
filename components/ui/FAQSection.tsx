interface FAQItem {
  question: string
  answer:   string
}

interface FAQSectionProps {
  items: FAQItem[]
  title?: string
}

/**
 * Section FAQ visible + schema FAQPage (rich snippets Google, citabilité
 * par les moteurs IA type ChatGPT/Perplexity qui privilégient le format Q/R).
 */
export default function FAQSection({ items, title = 'Questions fréquentes' }: FAQSectionProps) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map(({ question, answer }) => ({
      '@type': 'Question',
      name: question,
      acceptedAnswer: { '@type': 'Answer', text: answer },
    })),
  }

  return (
    <section className="relative bg-[#0A0A0A] px-6 sm:px-8 md:px-24 py-20 sm:py-24 md:py-32 border-t border-[#F5F0E8]/10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="flex items-center gap-4 mb-16">
        <div className="h-px w-16 bg-[#C9A96E]" />
        <span className="text-[#C9A96E] text-xs tracking-[0.5em] uppercase font-light">
          FAQ
        </span>
      </div>

      <h2 className="font-display text-[#F5F0E8] text-3xl sm:text-4xl md:text-5xl font-light mb-16 max-w-2xl">
        {title}
      </h2>

      <div className="max-w-3xl space-y-10">
        {items.map(({ question, answer }) => (
          <div key={question} className="border-b border-[#F5F0E8]/10 pb-8">
            <h3 className="text-[#F5F0E8] text-lg font-normal mb-3">{question}</h3>
            <p className="text-[#F5F0E8]/60 text-sm leading-relaxed font-light">{answer}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
