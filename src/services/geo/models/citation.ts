/**
 * GEO Engine — Citation Model
 *
 * Makale kaynak gösterme modeli.
 * Henüz kaynak üretilmez — sadece model.
 */

import type { Citation } from "../types";

export function createCitation(params: Omit<Citation, "id" | "accessDate">): Citation {
  return {
    id: `cite_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`,
    ...params,
    accessDate: new Date().toISOString(),
  };
}

export function validateCitation(citation: Citation): { valid: boolean; issues: string[] } {
  const issues: string[] = [];
  if (!citation.title) issues.push("Başlık zorunludur");
  if (!citation.url) issues.push("URL zorunludur");
  if (citation.relevance < 0 || citation.relevance > 1) issues.push("Relevance 0-1 arası olmalı");
  if (citation.authority < 0 || citation.authority > 1) issues.push("Authority 0-1 arası olmalı");
  return { valid: issues.length === 0, issues };
}

export function scoreCitations(citations: Citation[]): number {
  if (citations.length === 0) return 0;
  const avgRelevance = citations.reduce((s, c) => s + c.relevance, 0) / citations.length;
  const avgAuthority = citations.reduce((s, c) => s + c.authority, 0) / citations.length;
  const diversity = Math.min(1, citations.length / 5);
  return Math.round(((avgRelevance * 0.4 + avgAuthority * 0.4 + diversity * 0.2) * 100)) / 100;
}
