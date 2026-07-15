/**
 * GEO Engine — AI Summary Model
 *
 * Platform bazlı özet modeli.
 * Henüz üretim yapılmaz — sadece model.
 */

import type { AISummary, GEOPlatform } from "../types";
import { PLATFORM_CONFIG } from "../config";

export function createSummary(platform: GEOPlatform): AISummary {
  return {
    id: `sum_${Date.now().toString(36)}`,
    content: "",
    maxLength: PLATFORM_CONFIG[platform].maxSummaryLength,
    platform,
    generatedAt: null,
    promptVersion: null,
  };
}

export function validateSummaryLength(summary: AISummary): boolean {
  return summary.content.length <= summary.maxLength;
}

export function getSummaryStats(summaries: AISummary[]): {
  total: number;
  generated: number;
  pending: number;
} {
  const generated = summaries.filter((s) => s.generatedAt !== null).length;
  return { total: summaries.length, generated, pending: summaries.length - generated };
}
