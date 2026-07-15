/**
 * GEO Engine — Analysis Module
 *
 * İçerik analizi fonksiyonları.
 */

import type { GEOAnalysis, AuthoritySignals } from "../types";
import { calculateWordCount, calculateReadingTime } from "@/services/content/metadata";
import { READABILITY_CONFIG } from "../config";

// ─── Content Clarity ────────────────────────────────────────

export function analyzeClarity(content: string): number {
  const sentences = content.split(/[.!?]+/).filter((s) => s.trim().length > 0);
  if (sentences.length === 0) return 0;
  const words = content.split(/\s+/).filter((w) => w.length > 0);
  const avgWordsPerSentence = words.length / sentences.length;
  const target = READABILITY_CONFIG.targetSentenceLength;
  // 1.0 = ideal uzunluk, sapma azaldıkça düşer
  const score = Math.max(0, 1 - Math.abs(avgWordsPerSentence - target) / target);
  return Math.round(score * 100) / 100;
}

// ─── Entity Coverage ────────────────────────────────────────

export function analyzeEntityCoverage(entityCount: number, content: string): number {
  const wordCount = calculateWordCount(content);
  const density = wordCount > 0 ? (entityCount / wordCount) * 1000 : 0;
  return Math.min(1, density / 10); // 10 entity/1000 kelime = ideal
}

export function analyzeEntityDensity(entityCount: number, content: string): number {
  const wordCount = calculateWordCount(content);
  return wordCount > 0 ? Math.round((entityCount / wordCount) * 1000 * 100) / 100 : 0;
}

// ─── Authority Signals ──────────────────────────────────────

export function analyzeAuthority(article: {
  authorBio?: string | null;
  originalUrl?: string | null;
  content: string;
}): AuthoritySignals {
  const hasAuthorBio = !!(article.authorBio && article.authorBio.length > 50);
  const hasSourceUrl = !!article.originalUrl;
  const hasReferences = (article.content.match(/https?:\/\/[^\s]+/g) || []).length >= 2;
  const hasOriginalContent = calculateWordCount(article.content) > 300;
  const domainAuthority = hasSourceUrl ? 0.5 : 0.2;
  const authorExpertise = hasAuthorBio ? 0.7 : 0.3;
  const total = (domainAuthority * 0.4 + authorExpertise * 0.3 + (hasReferences ? 0.2 : 0) + (hasOriginalContent ? 0.1 : 0));

  return { hasAuthorBio, hasSourceUrl, hasReferences, hasOriginalContent, domainAuthority, authorExpertise, total: Math.round(total * 100) / 100 };
}

// ─── Structure ──────────────────────────────────────────────

export function analyzeStructure(content: string): number {
  const hasH2 = /<h2[^>]*>/i.test(content);
  const hasH3 = /<h3[^>]*>/i.test(content);
  const hasLists = /<(ul|ol)[^>]*>/i.test(content);
  const hasParagraphs = (content.match(/<p[^>]*>/gi) || []).length >= 3;
  const score = [hasH2 ? 0.3 : 0, hasH3 ? 0.2 : 0, hasLists ? 0.25 : 0, hasParagraphs ? 0.25 : 0].reduce((a, b) => a + b, 0);
  return Math.min(1, score + 0.1);
}

// ─── Readability ────────────────────────────────────────────

export function analyzeReadability(content: string): number {
  const words = calculateWordCount(content);
  const readTime = calculateReadingTime(content);
  const ideal = 5; // dakika
  return Math.min(1, readTime > 0 ? ideal / readTime : 0);
}

// ─── Full Analysis ──────────────────────────────────────────

export function analyzeContent(
  content: string,
  options: {
    entityCount?: number;
    authorBio?: string | null;
    originalUrl?: string | null;
  } = {}
): GEOAnalysis {
  const entityCount = options.entityCount || 0;
  const authority = analyzeAuthority({ authorBio: options.authorBio, originalUrl: options.originalUrl, content });
  const clarity = analyzeClarity(content);
  const entityCoverage = analyzeEntityCoverage(entityCount, content);

  return {
    contentClarity: clarity,
    entityCoverage,
    entityDensity: analyzeEntityDensity(entityCount, content),
    authoritySignals: authority,
    sourceQuality: options.originalUrl ? 0.6 : 0.3,
    freshness: 0.5,
    citationQuality: 0,
    readability: analyzeReadability(content),
    structure: analyzeStructure(content),
    questionCoverage: 0,
    answerQuality: 0,
    contextCompleteness: calculateWordCount(content) > 500 ? 0.6 : 0.3,
    semanticRichness: entityCount > 5 ? 0.6 : 0.3,
    informationGain: entityCount > 10 ? 0.7 : 0.4,
  };
}
