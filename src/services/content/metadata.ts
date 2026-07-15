/**
 * Content Engine — Metadata System
 *
 * Makale metadata hesaplama ve yönetimi.
 * Henüz otomatik hesaplama yok — altyapı hazır.
 */

import type { ContentMetadata } from "./types";
import { DEFAULT_METADATA } from "./types";

// ─── Reading Time ───────────────────────────────────────────

/** Ortalama okuma hızı (kelime/dakika) — Türkçe */
const WORDS_PER_MINUTE = 200;

/** HTML içeriğinden kelime sayısı hesapla */
export function calculateWordCount(htmlContent: string): number {
  const text = htmlContent
    .replace(/<[^>]*>/g, " ")
    .replace(/&[^;]+;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return text ? text.split(" ").length : 0;
}

/** Okuma süresini hesapla (dakika) */
export function calculateReadingTime(htmlContent: string): number {
  const wordCount = calculateWordCount(htmlContent);
  return Math.max(1, Math.ceil(wordCount / WORDS_PER_MINUTE));
}

// ─── Metadata Builder ──────────────────────────────────────

export interface MetadataInput {
  language?: string;
  originalSource?: string;
  originalUrl?: string;
  aiProvider?: string;
  aiVersion?: string;
  promptVersion?: string;
}

/**
 * Metadata oluştur (article create/update'te kullanılır)
 */
export function buildMetadata(
  htmlContent: string,
  input?: MetadataInput
): ContentMetadata {
  return {
    ...DEFAULT_METADATA,
    readingTime: calculateReadingTime(htmlContent),
    wordCount: calculateWordCount(htmlContent),
    language: input?.language || "tr",
    originalSource: input?.originalSource || null,
    originalUrl: input?.originalUrl || null,
    importDate: input?.originalUrl ? new Date().toISOString() : null,
    updatedDate: new Date().toISOString(),
    aiProvider: input?.aiProvider || null,
    aiVersion: input?.aiVersion || null,
    promptVersion: input?.promptVersion || null,
  };
}

/**
 * Metadata'yı güncelle
 */
export function updateMetadata(
  existing: ContentMetadata,
  updates: Partial<ContentMetadata>
): ContentMetadata {
  return {
    ...existing,
    ...updates,
    updatedDate: new Date().toISOString(),
  };
}

/**
 * Skor güncelle (henüz hesaplama yok, manuel)
 */
export function setScore(
  metadata: ContentMetadata,
  scoreType: keyof Pick<
    ContentMetadata,
    | "contentScore"
    | "seoScore"
    | "geoScore"
    | "factScore"
    | "editorialScore"
    | "qualityScore"
  >,
  value: number
): ContentMetadata {
  const updated = {
    ...metadata,
    [scoreType]: Math.max(0, Math.min(100, value)),
    updatedDate: new Date().toISOString(),
  } as ContentMetadata;

  // Toplam skoru yeniden hesapla
  const scores = [
    updated.contentScore,
    updated.seoScore,
    updated.geoScore,
    updated.factScore,
    updated.editorialScore,
    updated.qualityScore,
  ];

  const validScores = scores.filter(
    (s): s is number => s !== null && s !== undefined
  );

  if (validScores.length > 0) {
    updated.totalScore = Math.round(
      validScores.reduce((a, b) => a + b, 0) / validScores.length
    );
  }

  return updated;
}

/**
 * Metadata validasyonu
 */
export function validateMetadata(metadata: ContentMetadata): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (metadata.wordCount !== null && metadata.wordCount < 0) {
    errors.push("wordCount negatif olamaz");
  }
  if (metadata.readingTime !== null && metadata.readingTime < 0) {
    errors.push("readingTime negatif olamaz");
  }

  const scores = [
    metadata.contentScore,
    metadata.seoScore,
    metadata.geoScore,
    metadata.factScore,
    metadata.editorialScore,
    metadata.qualityScore,
  ];

  for (const score of scores) {
    if (score !== null && (score < 0 || score > 100)) {
      errors.push("Skorlar 0-100 arasında olmalıdır");
      break;
    }
  }

  return { valid: errors.length === 0, errors };
}
