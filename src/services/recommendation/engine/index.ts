/** Related Content Engine — Main Engine */
import type { ContentRecommendation, RecommendationResult, ContentSimilarity, RecommendationScore } from "../types";
import { RECOMMENDATION_TYPE as RT } from "../types";

const WEIGHTS = { entityMatch: 0.25, semantic: 0.25, category: 0.15, freshness: 0.15, popularity: 0.10, author: 0.10 };

function wordSimilarity(a: string, b: string): number {
  const wa = new Set(a.toLowerCase().split(/\s+/).filter((w) => w.length > 2));
  const wb = new Set(b.toLowerCase().split(/\s+/).filter((w) => w.length > 2));
  if (wa.size === 0 || wb.size === 0) return 0;
  return Array.from(wa).filter((x) => wb.has(x)).length / Math.max(wa.size, wb.size);
}

function tagSim(a: string[], b: string[]): number {
  if (!a?.length || !b?.length) return 0;
  const sb = new Set(b.map((t) => t.toLowerCase()));
  return a.filter((t) => sb.has(t.toLowerCase())).length / Math.max(a.length, b.length);
}

function calcSimilarity(source: any, target: any): ContentSimilarity {
  const kw = wordSimilarity(source.title + " " + (source.tags || []).join(" "), target.title + " " + (target.tags || []).join(" "));
  return {
    entitySimilarity: kw * 0.8,
    categorySimilarity: source.categoryId && target.categoryId && source.categoryId === target.categoryId ? 1 : 0,
    tagSimilarity: tagSim(source.tags || [], target.tags || []),
    keywordSimilarity: kw,
    semanticSimilarity: kw * 0.9,
    titleSimilarity: wordSimilarity(source.title, target.title),
    totalSimilarity: Math.round((kw * 0.5 + tagSim(source.tags || [], target.tags || []) * 0.3 + (source.categoryId === target.categoryId ? 0.2 : 0)) * 100) / 100,
  };
}

function calcScore(sim: ContentSimilarity, target: any): RecommendationScore {
  const freshness = target.publishedAt ? Math.max(0, 100 - (Date.now() - new Date(target.publishedAt).getTime()) / (86400000 * 30) * 100) : 50;
  const popularity = Math.min(100, (target.viewCount || 0) / 10);
  const total = Math.round(
    sim.entitySimilarity * 100 * WEIGHTS.entityMatch +
    sim.semanticSimilarity * 100 * WEIGHTS.semantic +
    sim.categorySimilarity * 100 * WEIGHTS.category +
    freshness * WEIGHTS.freshness / 100 +
    popularity * WEIGHTS.popularity / 100 +
    50 * WEIGHTS.author
  );
  return { entityMatch: Math.round(sim.entitySimilarity * 100), semantic: Math.round(sim.semanticSimilarity * 100), category: Math.round(sim.categorySimilarity * 100), freshness, popularity, author: 50, total };
}

export function generateRecommendations(
  source: { id: string; title: string; categoryId?: string; tags?: string[] },
  candidates: Array<{ id: string; title: string; slug: string; categoryId?: string; tags?: string[]; status: string; viewCount?: number; publishedAt?: Date }>,
  limit = 10
): RecommendationResult {
  const valid = candidates.filter((c) => c.id !== source.id && c.status === "published");
  const scored: ContentRecommendation[] = valid.map((c) => {
    const sim = calcSimilarity(source, c);
    return { articleId: c.id, title: c.title, slug: c.slug, score: calcScore(sim, c), similarity: sim, type: RT.RELATED_NEWS };
  });

  const sorted = scored.sort((a, b) => b.score.total - a.score.total);
  return {
    sourceArticleId: source.id,
    relatedNews: sorted.slice(0, limit),
    relatedGuides: sorted.filter((s) => s.score.total > 30).slice(0, limit),
    trending: sorted.filter((s) => s.score.freshness > 60).slice(0, limit),
    latest: sorted.slice(0, limit),
    generatedAt: new Date().toISOString(),
  };
}
