'use client'

import { useEffect, useRef } from 'react'
import { gsap, ScrollTrigger } from '@/lib/gsap'
import type { GoogleReviewsData } from '@/lib/googleReviews'

const FALLBACK_MAPS_URI = 'https://maps.app.goo.gl/dHeBLrgB8P3VyAZ77'

const QUICK_STATS = [
  { value: '100%', label: 'Ponctualité' },
  { value: '5★',   label: 'Confort'     },
  { value: '0',    label: 'Incident'    },
] as const

interface SceneSocialProofProps {
  reviews: GoogleReviewsData | null
}

/**
 * Scène 4 — Social Proof.
 * Note + avis affichés proviennent de la fiche Google Business Profile réelle
 * (lib/googleReviews.ts, via l'API Places). Sans GOOGLE_PLACES_API_KEY ou en
 * cas d'échec de l'appel, on affiche un lien vers la fiche plutôt que
 * d'inventer une note ou des témoignages.
 */
export default function SceneSocialProof({ reviews }: SceneSocialProofProps) {
  const sectionRef = useRef<HTMLElement>(null)
  const titleRef   = useRef<HTMLHeadingElement>(null)
  const quotesRef  = useRef<HTMLDivElement>(null)
  const ratingRef  = useRef<HTMLDivElement>(null)

  const hasReviews = !!reviews && reviews.reviews.length > 0
  const mapsUri = reviews?.mapsUri ?? FALLBACK_MAPS_URI

  useEffect(() => {
    const section = sectionRef.current
    const title   = titleRef.current
    const quotes  = quotesRef.current
    const rating  = ratingRef.current
    if (!section || !title || !quotes || !rating) return

    const ctx = gsap.context(() => {

      // ── Titre ─────────────────────────────────────────────────
      gsap.from(title, {
        opacity: 0,
        y: 50,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: title,
          start: 'top 80%',
        },
      })

      // ── Citations stagger ─────────────────────────────────────
      gsap.from(quotes.children, {
        opacity: 0,
        y: 40,
        duration: 1,
        stagger: 0.2,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: quotes,
          start: 'top 75%',
        },
      })

      // ── Note Google ───────────────────────────────────────────
      gsap.from(rating, {
        opacity: 0,
        scale: 0.95,
        duration: 0.8,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: rating,
          start: 'top 80%',
        },
      })

      // ── Étoiles se remplissent une par une ───────────────────
      // Absentes en repli (pas d'avis chargés) — gsap.from() sur un NodeList
      // vide logue un warning "target not found", d'où la garde de longueur.
      const stars = rating.querySelectorAll<HTMLElement>('[data-star]')
      if (stars.length > 0) gsap.from(stars, {
        opacity: 0,
        scale: 0,
        duration: 0.4,
        stagger: 0.1,
        ease: 'back.out(2)',
        scrollTrigger: {
          trigger: rating,
          start: 'top 75%',
        },
      })

    }, section)

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen w-full bg-[#111111] px-12 md:px-24 py-32 overflow-hidden"
    >
      {hasReviews && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'LocalBusiness',
              name: 'VTCLAND',
              aggregateRating: {
                '@type': 'AggregateRating',
                ratingValue: reviews!.rating,
                reviewCount: reviews!.userRatingCount,
              },
              review: reviews!.reviews.map((r) => ({
                '@type': 'Review',
                author: { '@type': 'Person', name: r.author },
                reviewRating: { '@type': 'Rating', ratingValue: r.rating },
                reviewBody: r.text,
              })),
            }),
          }}
        />
      )}

      {/* Ligne décorative top */}
      <div className="absolute top-0 left-12 md:left-24 right-12 md:right-24 h-px bg-gradient-to-r from-transparent via-[#C9A96E]/30 to-transparent" />

      {/* Header */}
      <div className="relative z-10 mb-20">
        <div className="flex items-center gap-4 mb-8">
          <div className="h-px w-16 bg-[#C9A96E]" />
          <span className="text-[#C9A96E] text-xs tracking-[0.5em] uppercase font-light">
            Ils nous font confiance · Gard & Hérault
          </span>
        </div>

        <h2
          ref={titleRef}
          className="font-display text-[#F5F0E8] text-5xl md:text-7xl font-light leading-tight max-w-2xl"
        >
          La confiance,<br />
          <em className="text-[#C9A96E] not-italic">méritée</em>
        </h2>
      </div>

      {/* Citations */}
      {hasReviews ? (
        <div
          ref={quotesRef}
          className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-8 mb-24"
        >
          {reviews!.reviews.map((r) => (
            <div
              key={`${r.author}-${r.relativeTime}`}
              className="relative border-l border-[#C9A96E]/20 pl-8 py-2"
            >
              {/* Guillemet décoratif */}
              <span
                className="absolute -top-4 left-6 font-display text-[#C9A96E]/20 text-7xl font-light leading-none"
                aria-hidden
              >
                &quot;
              </span>

              <p className="font-display text-[#F5F0E8]/80 text-xl font-light leading-relaxed mb-6 italic">
                {r.text}
              </p>

              <div className="flex flex-col gap-1">
                <span className="text-[#F5F0E8] text-sm tracking-wide">
                  {r.author}
                </span>
                <span className="text-[#F5F0E8]/60 text-xs tracking-widest uppercase">
                  Avis Google{r.relativeTime ? ` · ${r.relativeTime}` : ''}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div ref={quotesRef} className="relative z-10 mb-24">
          <a
            href={mapsUri}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block text-[#F5F0E8]/70 text-lg font-light border-b border-[#C9A96E]/40 pb-1 hover:text-[#C9A96E] hover:border-[#C9A96E] transition-colors"
          >
            Découvrez les avis vérifiés de nos clients sur Google →
          </a>
        </div>
      )}

      {/* Note Google + stats */}
      <div
        ref={ratingRef}
        className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-12 pt-16 border-t border-[#F5F0E8]/10"
      >

        {/* Note Google */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            {/* Logo Google stylisé */}
            <div className="flex gap-0.5">
              {['#4285F4','#EA4335','#FBBC05','#34A853'].map((color, i) => (
                <span
                  key={i}
                  className="font-display text-2xl font-light"
                  style={{ color }}
                >
                  G
                </span>
              ))}
            </div>
            <span className="text-[#F5F0E8]/60 text-xs tracking-widest uppercase">
              Note
            </span>
          </div>

          {hasReviews ? (
            <div className="flex items-center gap-3">
              <span className="font-display text-[#C9A96E] text-5xl font-light">
                {reviews!.rating.toFixed(1)}
              </span>
              <div className="flex flex-col gap-1">
                <div className="flex gap-1">
                  {[1,2,3,4,5].map((star) => (
                    <span
                      key={star}
                      data-star
                      className="text-[#C9A96E] text-lg"
                    >
                      ★
                    </span>
                  ))}
                </div>
                <span className="text-[#F5F0E8]/60 text-xs tracking-widest uppercase">
                  sur 5 — {reviews!.userRatingCount} avis
                </span>
              </div>
            </div>
          ) : (
            <a
              href={mapsUri}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#F5F0E8]/70 text-sm hover:text-[#C9A96E] transition-colors underline underline-offset-2"
            >
              Voir notre fiche Google →
            </a>
          )}
        </div>

        {/* Séparateur vertical */}
        <div className="hidden md:block w-px h-24 bg-[#F5F0E8]/10" />

        {/* Stats rapides */}
        <div className="flex gap-12">
          {QUICK_STATS.map((stat) => (
            <div key={stat.label} className="flex flex-col gap-2">
              <span className="font-display text-[#C9A96E] text-3xl font-light">
                {stat.value}
              </span>
              <span className="text-[#F5F0E8]/60 text-xs tracking-widest uppercase">
                {stat.label}
              </span>
            </div>
          ))}
        </div>

      </div>

      {/* Fond décoratif */}
      <div
        className="absolute top-1/2 right-0 -translate-y-1/2 text-[22vw] font-display text-[#F5F0E8]/[0.015] leading-none select-none pointer-events-none"
        aria-hidden
      >
        5★
      </div>

    </section>
  )
}
