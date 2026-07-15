/**
 * Topic Hub — JSON-LD Schema Generator
 *
 * CollectionPage, ItemList, BreadcrumbList, Organization şemaları.
 * Google News ve SEO için yapılandırılmış veri.
 */
import { SITE_URL, SITE_NAME } from "@/lib/constants";
import type { TopicDefinition, TopicArticleRef } from "./types";

// ─── CollectionPage ──────────────────────────────────────────

export function generateTopicCollectionPage(
  topic: TopicDefinition,
  articleCount: number,
  articles: TopicArticleRef[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${topic.name} — Haberler & Rehberler`,
    url: `${SITE_URL}/topics/${topic.slug}`,
    description: topic.description || `${topic.name} hakkında en güncel teknoloji haberleri ve rehberler.`,
    numberOfItems: articleCount,
    isPartOf: {
      "@type": "WebSite",
      name: SITE_NAME,
      url: SITE_URL,
    },
    about: {
      "@type": "Thing",
      name: topic.name,
      description: topic.description,
      sameAs: topic.keywords.map(k => `https://tr.wikipedia.org/wiki/${encodeURIComponent(k)}`),
    },
    mainEntity: generateTopicItemList(articles),
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
    },
  };
}

// ─── ItemList ────────────────────────────────────────────────

export function generateTopicItemList(articles: TopicArticleRef[]) {
  return {
    "@type": "ItemList",
    numberOfItems: articles.length,
    itemListElement: articles.slice(0, 20).map((article, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: `${SITE_URL}/haber/${article.slug}`,
      name: article.title,
    })),
  };
}

// ─── BreadcrumbList ──────────────────────────────────────────

export function generateTopicBreadcrumbSchema(topic: TopicDefinition) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Anasayfa", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Konular", item: `${SITE_URL}/topics` },
      { "@type": "ListItem", position: 3, name: topic.name, item: `${SITE_URL}/topics/${topic.slug}` },
    ],
  };
}

// ─── Organization ────────────────────────────────────────────

export function generateTopicOrganization() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    description: "Teknoloji dünyasından en güncel haberler, yapay zeka rehberleri ve derinlemesine analizler.",
  };
}

// ─── All Schemas ─────────────────────────────────────────────

export function generateAllTopicSchemas(
  topic: TopicDefinition,
  articleCount: number,
  articles: TopicArticleRef[]
) {
  return {
    collectionPage: generateTopicCollectionPage(topic, articleCount, articles),
    breadcrumbList: generateTopicBreadcrumbSchema(topic),
    organization: generateTopicOrganization(),
    itemList: generateTopicItemList(articles),
  };
}
