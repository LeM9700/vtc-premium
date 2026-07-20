import type { ReactNode } from 'react'

interface Highlight {
  title: string
  body:  string
}

interface SectionHighlightsProps {
  label:      string
  title:      ReactNode
  intro:      string
  highlights: [Highlight, Highlight, Highlight]
}

export default function SectionHighlights({ label, title, intro, highlights }: SectionHighlightsProps) {
  return (
    <section id="highlights" className="relative bg-[#111111] px-12 md:px-24 py-32">
      <div className="absolute top-0 left-12 md:left-24 right-12 md:right-24 h-px bg-gradient-to-r from-transparent via-[#C9A96E]/30 to-transparent" />

      {/* Label */}
      <div className="flex items-center gap-4 mb-16">
        <div className="h-px w-16 bg-[#C9A96E]" />
        <span className="text-[#C9A96E] text-xs tracking-[0.5em] uppercase font-light">
          {label}
        </span>
      </div>

      {/* Titre + intro */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-16 mb-24">
        <h2 className="font-display text-[#F5F0E8] text-5xl md:text-6xl font-light leading-tight">
          {title}
        </h2>
        <p className="text-[#F5F0E8]/50 text-base leading-relaxed font-light md:self-end">
          {intro}
        </p>
      </div>

      {/* Points forts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10 pt-16 border-t border-[#F5F0E8]/10">
        {highlights.map((h, i) => (
          <div key={h.title} className="flex flex-col gap-5">
            <div className="flex items-center gap-4">
              <span className="font-display text-[#C9A96E]/40 text-3xl font-light leading-none">
                {String(i + 1).padStart(2, '0')}
              </span>
              <div className="h-px flex-1 bg-[#C9A96E]/20" />
            </div>
            <h3 className="font-display text-[#F5F0E8] text-xl font-light">
              {h.title}
            </h3>
            <p className="text-[#F5F0E8]/60 text-sm leading-relaxed font-light">
              {h.body}
            </p>
          </div>
        ))}
      </div>

      <div
        className="absolute bottom-0 right-0 text-[14vw] font-display text-[#F5F0E8]/[0.015] leading-none select-none pointer-events-none"
        aria-hidden
      />
    </section>
  )
}
