/**
 * Source Intelligence — JSON-LD Schema Generator
 */
import { SITE_URL, SITE_NAME } from "@/lib/constants";
import type { SourceProfile } from "./types";

export function generateSourceOrganization(source: SourceProfile) {
  return {
    "@context": "https://schema.org", "@type": "Organization",
    name: source.name, url: source.website, description: source.description,
    ...(source.logo && { logo: source.logo }),
    sameAs: [source.website, source.rssUrl].filter(Boolean),
  };
}

export function generateSourceCollectionPage(source: SourceProfile, articleSlugs: Array<{ title: string; slug: string }>) {
  return {
    "@context": "https://schema.org", "@type": "CollectionPage",
    name: `${source.name} — Haber Kaynağı`,
    url: `${SITE_URL}/source/${source.slug}`,
    description: source.description || `${source.name} kaynağından teknoloji haberleri.`,
    numberOfItems: source.articleCount,
    isPartOf: { "@type": "WebSite", name: SITE_NAME, url: SITE_URL },
    about: { "@type": "Organization", name: source.name, url: source.website },
    mainEntity: {
      "@type": "ItemList", numberOfItems: articleSlugs.length,
      itemListElement: articleSlugs.slice(0, 20).map((a, i) => ({ "@type": "ListItem", position: i + 1, url: `${SITE_URL}/haber/${a.slug}`, name: a.title })),
    },
    publisher: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
  };
}

export function generateSourceBreadcrumb(source: SourceProfile) {
  return {
    "@context": "https://schema.org", "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Anasayfa", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Kaynaklar", item: `${SITE_URL}/kaynaklar` },
      { "@type": "ListItem", position: 3, name: source.name, item: `${SITE_URL}/source/${source.slug}` },
    ],
  };
}

export function generateAllSourceSchemas(source: SourceProfile, articles: Array<{ title: string; slug: string }>) {
  return {
    organization: generateSourceOrganization(source),
    collectionPage: generateSourceCollectionPage(source, articles),
    breadcrumb: generateSourceBreadcrumb(source),
  };
}
