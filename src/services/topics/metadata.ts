/**
 * Topic Hub — SEO Metadata Generator
 *
 * Her topic için eksiksiz SEO metadata'sı üretir.
 * Next.js Metadata API, Open Graph, Twitter Card, Breadcrumb.
 */
import { SITE_URL, SITE_NAME } from "@/lib/constants";
import type { Metadata } from "next";
import type { TopicDefinition, TopicSEO } from "./types";
import { slugify } from "@/lib/utils";

// ─── Next.js Metadata ─────────────────────────────────────────

export function generateTopicMetadata(topic: TopicDefinition, articleCount: number): Metadata {
  const seoTitle = topic.seoTitle || `${topic.name} Haberleri, Rehberler, İncelemeler | ${SITE_NAME}`;
  const seoDescription = topic.seoDescription || `${topic.name} hakkında en güncel teknoloji haberleri, detaylı rehberler ve uzman incelemeleri. Toplam ${articleCount} içerik.`;
  const canonical = `${SITE_URL}/topics/${topic.slug}`;
  const imageUrl = topic.coverImage || `${SITE_URL}/og-default.png`;

  return {
    title: seoTitle,
    description: seoDescription,
    alternates: { canonical },
    openGraph: {
      title: seoTitle,
      description: seoDescription,
      type: "website" as const,
      url: canonical,
      siteName: SITE_NAME,
      locale: "tr_TR",
      images: [{ url: imageUrl, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image" as const,
      title: seoTitle,
      description: seoDescription,
      images: [imageUrl],
    },
    other: {
      "article:section": topic.category,
      "keywords": topic.keywords.join(", "),
    },
  };
}

// ─── SEO Data Object ──────────────────────────────────────────

export function generateTopicSEO(topic: TopicDefinition, articleCount: number): TopicSEO {
  const seoTitle = topic.seoTitle || `${topic.name} Haberleri — Rehberler, İncelemeler | ${SITE_NAME}`;
  const seoDescription = topic.seoDescription || `${topic.name} hakkında en güncel haberler ve rehberler. Toplam ${articleCount} içerik.`;
  const canonical = `${SITE_URL}/topics/${topic.slug}`;
  const imageUrl = topic.coverImage || `${SITE_URL}/og-default.png`;

  return {
    title: seoTitle,
    description: seoDescription,
    canonical,
    ogTitle: seoTitle,
    ogDescription: seoDescription,
    ogImage: imageUrl,
    ogType: "website",
    twitterCard: "summary_large_image",
    twitterTitle: seoTitle,
    twitterDescription: seoDescription,
    twitterImage: imageUrl,
  };
}

// ─── Breadcrumb ───────────────────────────────────────────────

export function generateTopicBreadcrumbs(topic: TopicDefinition) {
  return [
    { name: "Anasayfa", url: SITE_URL, position: 1 },
    { name: "Konular", url: `${SITE_URL}/topics`, position: 2 },
    { name: topic.name, url: `${SITE_URL}/topics/${topic.slug}`, position: 3 },
  ];
}

// ─── Sitemap Entry ────────────────────────────────────────────

export function generateTopicSitemapEntry(topic: TopicDefinition, lastModified: string) {
  return {
    url: `${SITE_URL}/topics/${topic.slug}`,
    lastModified,
    changeFrequency: "daily" as const,
    priority: 0.8,
  };
}
