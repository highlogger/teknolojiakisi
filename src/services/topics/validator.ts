/**
 * Topic Hub — Validator
 *
 * Topic verilerini doğrular: eksik metadata, boş topic, broken slug, duplicate.
 */
import type { TopicDefinition, TopicValidation, TopicValidationError } from "./types";
import { getAllTopicConfigs } from "./config";

// ─── Main Validation ─────────────────────────────────────────

export function validateTopic(topic: TopicDefinition): TopicValidation {
  const errors: TopicValidationError[] = [];
  const warnings: string[] = [];

  // 1. Name
  if (!topic.name || topic.name.trim().length < 2) {
    errors.push({ field: "name", message: "Topic adı en az 2 karakter olmalı.", severity: "error" });
  }
  if (topic.name && topic.name.length > 50) {
    warnings.push(`Topic adı çok uzun: ${topic.name.length} karakter.`);
  }

  // 2. Slug
  if (!topic.slug || topic.slug.trim().length < 2) {
    errors.push({ field: "slug", message: "Slug en az 2 karakter olmalı.", severity: "error" });
  }
  if (topic.slug && !/^[a-z0-9-]+$/.test(topic.slug)) {
    errors.push({ field: "slug", message: "Slug sadece küçük harf, rakam ve tire içermeli.", severity: "error" });
  }

  // 3. Description
  if (!topic.description) {
    warnings.push(`"${topic.name}" için description eksik. SEO için önerilir.`);
  }
  if (topic.description && topic.description.length < 50) {
    warnings.push(`Description çok kısa (${topic.description.length} karakter). En az 100 önerilir.`);
  }

  // 4. SEO Title
  if (!topic.seoTitle) {
    warnings.push(`"${topic.name}" için SEO title eksik.`);
  }

  // 5. SEO Description
  if (!topic.seoDescription) {
    warnings.push(`"${topic.name}" için SEO description eksik.`);
  }

  // 6. Keywords
  if (!topic.keywords || topic.keywords.length < 2) {
    warnings.push(`"${topic.name}" için en az 2 anahtar kelime önerilir.`);
  }

  // 7. Category
  if (!topic.category) {
    errors.push({ field: "category", message: "Kategori atanmamış.", severity: "error" });
  }

  // 8. Cover Image
  if (!topic.coverImage) {
    warnings.push(`"${topic.name}" için kapak görseli yok. Varsayılan OG image kullanılacak.`);
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

// ─── Duplicate Slug Check ────────────────────────────────────

export function checkDuplicateSlugs(): TopicValidationError[] {
  const errors: TopicValidationError[] = [];
  const topics = getAllTopicConfigs();
  const slugs = new Map<string, string>();

  for (const topic of topics) {
    if (slugs.has(topic.slug)) {
      errors.push({
        field: "slug",
        message: `Duplicate slug: "${topic.slug}" — "${slugs.get(topic.slug)}" ve "${topic.name}" aynı slug'ı kullanıyor.`,
        severity: "error",
      });
    } else {
      slugs.set(topic.slug, topic.name);
    }
  }

  return errors;
}

// ─── Validate All ────────────────────────────────────────────

export function validateAllTopics(): Map<string, TopicValidation> {
  const results = new Map<string, TopicValidation>();
  const topics = getAllTopicConfigs();

  for (const topic of topics) {
    results.set(topic.slug, validateTopic(topic));
  }

  return results;
}

// ─── Broken Slug Check ───────────────────────────────────────

export function findBrokenSlugs(existingSlugs: string[]): string[] {
  const configuredSlugs = new Set(getAllTopicConfigs().map(t => t.slug));
  return existingSlugs.filter(s => !configuredSlugs.has(s));
}

// ─── Empty / Low Content Topics ──────────────────────────────

export function findLowContentTopics(topicStats: Map<string, number>, threshold = 5): string[] {
  const lowContent: string[] = [];
  for (const [slug, count] of topicStats) {
    if (count < threshold) {
      lowContent.push(slug);
    }
  }
  return lowContent;
}
