/**
 * Internal Link Engine — Main Engine
 *
 * Makaleler arası iç bağlantı önerileri üretir.
 */

import type { LinkSuggestion, LinkRecommendationResult, LinkScoreBreakdown } from "../types";
import { LINK_RULES, LINK_SCORE_WEIGHTS } from "../config";

/** Skor hesapla */
function calculateScore(
  source: { title: string; categoryId?: string; tags?: string[] },
  target: { title: string; categoryId?: string; tags?: string[]; viewCount?: number; publishedAt?: Date }
): LinkScoreBreakdown {
  const entityMatch = keywordOverlap(source.title, target.title) * 100;
  const keywordMatch = keywordOverlap(source.title + " " + (source.tags || []).join(" "), target.title + " " + (target.tags || []).join(" ")) * 100;
  const categoryMatch = source.categoryId && target.categoryId && source.categoryId === target.categoryId ? 100 : 0;
  const tagMatch = tagOverlap(source.tags || [], target.tags || []) * 100;
  const freshness = target.publishedAt ? Math.max(0, 100 - (Date.now() - new Date(target.publishedAt).getTime()) / (1000 * 60 * 60 * 24 * 30) * 100) : 50;
  const popularity = Math.min(100, (target.viewCount || 0) / 10);
  const authority = 50;
  const semanticSimilarity = keywordMatch * 0.7 + entityMatch * 0.3;

  const total = Math.round(
    entityMatch * LINK_SCORE_WEIGHTS.entityMatch +
    keywordMatch * LINK_SCORE_WEIGHTS.keywordMatch +
    categoryMatch * LINK_SCORE_WEIGHTS.categoryMatch +
    tagMatch * LINK_SCORE_WEIGHTS.tagMatch +
    semanticSimilarity * LINK_SCORE_WEIGHTS.semanticSimilarity +
    freshness * LINK_SCORE_WEIGHTS.freshness +
    popularity * LINK_SCORE_WEIGHTS.popularity +
    authority * LINK_SCORE_WEIGHTS.authority
  );

  return { entityMatch, keywordMatch, categoryMatch, tagMatch, freshness, popularity, authority, semanticSimilarity, total };
}

function keywordOverlap(a: string, b: string): number {
  const wordsA = new Set(a.toLowerCase().split(/\s+/).filter((w) => w.length > 3));
  const wordsB = new Set(b.toLowerCase().split(/\s+/).filter((w) => w.length > 3));
  if (wordsA.size === 0 || wordsB.size === 0) return 0;
  const intersection = new Set(Array.from(wordsA).filter((x) => wordsB.has(x)));
  return intersection.size / Math.max(wordsA.size, wordsB.size);
}

function tagOverlap(a: string[], b: string[]): number {
  if (a.length === 0 || b.length === 0) return 0;
  const setB = new Set(b.map((t) => t.toLowerCase()));
  const intersection = a.filter((t) => setB.has(t.toLowerCase())).length;
  return intersection / Math.max(a.length, b.length);
}

/** Ana fonksiyon */
export function generateLinkSuggestions(
  sourceArticle: { id: string; title: string; categoryId?: string; tags?: string[] },
  candidates: Array<{ id: string; title: string; slug: string; categoryId?: string; tags?: string[]; status: string; viewCount?: number; publishedAt?: Date }>,
  maxResults = 10
): LinkRecommendationResult {
  const excluded = new Set(LINK_RULES.excludeStatuses);
  const valid = candidates.filter((c) => c.id !== sourceArticle.id && !excluded.has(c.status));

  const suggestions: LinkSuggestion[] = valid
    .map((target) => {
      const scores = calculateScore(sourceArticle, target);
      return {
        id: `link_${sourceArticle.id}_${target.id}`,
        sourceArticleId: sourceArticle.id,
        targetArticleId: target.id,
        targetTitle: target.title,
        targetSlug: target.slug,
        targetUrl: `/haber/${target.slug}`,
        linkType: "article" as const,
        matchSource: "keyword" as const,
        score: scores.total,
        anchorText: target.title.substring(0, LINK_RULES.maxAnchorLength),
        matchDetails: scores as unknown as Record<string, number>,
      } as LinkSuggestion;
    })
    .filter((s) => s.score >= LINK_RULES.minScore)
    .sort((a, b) => b.score - a.score)
    .slice(0, LINK_RULES.maxPerArticle);

  return {
    articleId: sourceArticle.id,
    suggestions,
    top5: suggestions.filter((s) => s.score >= LINK_RULES.top5MinScore).slice(0, 5),
    top10: suggestions.filter((s) => s.score >= LINK_RULES.top10MinScore).slice(0, 10),
    generatedAt: new Date().toISOString(),
  };
}
