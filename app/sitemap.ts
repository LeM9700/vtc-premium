import type { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://vtcland.fr'
  const now  = new Date()

  return [
    { url: base,                                              lastModified: now, changeFrequency: 'weekly',  priority: 1.0  },
    { url: `${base}/vtc-montpellier`,                         lastModified: now, changeFrequency: 'monthly', priority: 0.9  },
    { url: `${base}/vtc-nimes`,                               lastModified: now, changeFrequency: 'monthly', priority: 0.9  },
    { url: `${base}/transfert-aeroport-montpellier`,          lastModified: now, changeFrequency: 'monthly', priority: 0.85 },
    { url: `${base}/vtc-mariage-gard`,                        lastModified: now, changeFrequency: 'monthly', priority: 0.8  },
    { url: `${base}/chauffeur-prive-professionnel-occitanie`, lastModified: now, changeFrequency: 'monthly', priority: 0.8  },
    { url: `${base}/longue-distance-occitanie`,               lastModified: now, changeFrequency: 'monthly', priority: 0.75 },
  ]
}
