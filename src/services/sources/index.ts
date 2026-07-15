/**
 * Source Intelligence System — Kaynak Analiz ve Skorlama
 *
 * Haber kaynaklarının güvenilirlik, otorite, güncellik analizi.
 * Google News uyumluluğu için kaynak profili.
 */
import prisma from "@/lib/db";
import type { SourceProfile, SourceScores, SourceStats, SourceRating, SourceIntelligence } from "./types";

// Re-export types
export type { SourceProfile, SourceScores, SourceStats, SourceRating, SourceIntelligence } from "./types";

// ─── Main API ────────────────────────────────────────────────

export async function analyzeSource(sourceId: string): Promise<SourceIntelligence | null> {
  try {
    const source = await prisma.source.findUnique({
      where: { id: sourceId },
      include: { category: { select: { name: true, slug: true } } },
    });
    if (!source) return null;

    const slug = source.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const now = new Date().toISOString();

    const profile: SourceProfile = {
      id: source.id, name: source.name, slug,
      description: null, website: source.url, rssUrl: source.feedUrl,
      logo: null, favicon: null, country: "TR", language: source.language,
      category: source.category?.name || null, verified: source.isActive,
      active: source.isActive, authorityScore: 0, trustScore: 0, freshnessScore: 0,
      publishFrequency: 0, overallScore: 0,
      lastCrawled: source.lastFetchedAt?.toISOString() || null,
      lastPublished: null, articleCount: 0,
      createdAt: source.createdAt?.toISOString() || now,
      updatedAt: source.updatedAt?.toISOString() || now,
    };

    const articles = await prisma.article.findMany({
      where: { sourceId: source.id },
      select: { id: true, status: true, publishedAt: true, category: { select: { name: true, slug: true } } },
      orderBy: { publishedAt: "desc" }, take: 100,
    });

    const published = articles.filter(a => a.status === "published");
    const publishedDates = published.map(a => a.publishedAt).filter(Boolean) as Date[];

    profile.articleCount = articles.length;
    profile.lastPublished = publishedDates[0]?.toISOString() || null;

    const stats: SourceStats = {
      totalArticles: articles.length, publishedArticles: published.length,
      avgArticlesPerDay: calculateAvgPerDay(publishedDates),
      lastPublishedAt: publishedDates[0]?.toISOString() || null,
      topCategories: getTopCategories(articles),
      topTopics: [],
      successRate: source.lastFetchedAt ? 85 : 50,
    };

    const scores = calculateScores(source, stats, publishedDates);
    profile.authorityScore = scores.authority;
    profile.trustScore = scores.trust;
    profile.freshnessScore = scores.freshness;
    profile.overallScore = scores.overall;

    const rating = getRating(scores.overall);
    const googleNewsReady = scores.overall >= 70 && stats.publishedArticles >= 10;

    return { profile, scores, stats, rating, googleNewsReady };
  } catch { return null; }
}

export async function listSources(minScore = 0): Promise<SourceIntelligence[]> {
  try {
    const sources = await prisma.source.findMany({ where: { isActive: true }, include: { category: { select: { name: true, slug: true } } } });
    const results: SourceIntelligence[] = [];
    for (const s of sources) {
      const intel = await analyzeSource(s.id);
      if (intel && intel.scores.overall >= minScore) results.push(intel);
    }
    return results.sort((a, b) => b.scores.overall - a.scores.overall);
  } catch { return []; }
}

// ─── Scoring ─────────────────────────────────────────────────

function calculateScores(source: { isActive: boolean; priority: number; lastFetchedAt: Date | null; type: string }, stats: SourceStats, dates: Date[]): SourceScores {
  const reliability = source.isActive ? Math.min(95, 50 + source.priority * 5) : 30;
  const authority = Math.min(100, source.priority * 10 + (stats.publishedArticles > 50 ? 20 : stats.publishedArticles > 10 ? 10 : 0));
  const freshness = source.lastFetchedAt ? Math.max(0, Math.round(100 - (Date.now() - new Date(source.lastFetchedAt).getTime()) / (86400000 * 3))) : 0;
  const frequency = dates.length > 0 ? Math.min(100, Math.round(stats.avgArticlesPerDay * 20)) : 50;
  const trust = source.priority >= 8 ? 90 : source.priority >= 5 ? 70 : 50;
  const overall = Math.round((reliability * 0.25 + authority * 0.2 + freshness * 0.2 + frequency * 0.15 + trust * 0.2));
  return { authority, trust, freshness, frequency, reliability, overall };
}

function getRating(score: number): SourceRating {
  if (score >= 90) return "AAA"; if (score >= 80) return "AA"; if (score >= 70) return "A";
  if (score >= 60) return "B"; if (score >= 50) return "C"; if (score >= 30) return "D"; return "F";
}

function calculateAvgPerDay(dates: Date[]): number {
  if (dates.length < 2) return dates.length;
  const oldest = new Date(Math.min(...dates.map(d => d.getTime())));
  const days = Math.max(1, Math.round((Date.now() - oldest.getTime()) / 86400000));
  return Math.round((dates.length / days) * 100) / 100;
}

function getTopCategories(articles: Array<{ category: { name: string; slug: string } | null }>): Array<{ name: string; slug: string; count: number }> {
  const counts = new Map<string, { name: string; slug: string; count: number }>();
  for (const a of articles) {
    if (a.category) {
      const existing = counts.get(a.category.slug);
      if (existing) existing.count++;
      else counts.set(a.category.slug, { name: a.category.name, slug: a.category.slug, count: 1 });
    }
  }
  return [...counts.values()].sort((a, b) => b.count - a.count).slice(0, 5);
}

export const sourceIntelligence = { analyzeSource, listSources };
export default sourceIntelligence;

// Re-export from sub-modules
export { validateSource, checkDuplicateSourceSlug, checkBrokenUrl, validateSourceForGoogleNews } from "./validator";
export { generateSourceMetadata } from "./metadata";
export { generateAllSourceSchemas, generateSourceOrganization, generateSourceCollectionPage, generateSourceBreadcrumb } from "./schema";
