/**
 * Source Intelligence — SEO Metadata Generator
 */
import { SITE_URL, SITE_NAME } from "@/lib/constants";
import type { Metadata } from "next";
import type { SourceProfile } from "./types";

export function generateSourceMetadata(source: SourceProfile): Metadata {
  const title = `${source.name} — Haber Kaynağı | ${SITE_NAME}`;
  const description = source.description || `${source.name} kaynağından en güncel ${source.language?.toUpperCase() || "TR"} teknoloji haberleri. Toplam ${source.articleCount} haber.`;
  const canonical = `${SITE_URL}/source/${source.slug}`;
  const image = source.logo || `${SITE_URL}/og-default.png`;

  return {
    title, description,
    alternates: { canonical },
    openGraph: { title, description, type: "website" as const, url: canonical, siteName: SITE_NAME, locale: "tr_TR", images: [{ url: image, width: 1200, height: 630 }] },
    twitter: { card: "summary_large_image" as const, title, description, images: [image] },
    other: { "article:section": "Kaynak", "language": source.language },
  };
}
