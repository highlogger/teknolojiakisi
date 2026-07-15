/**
 * Source Intelligence System — Kaynak Analiz ve Skorlama
 *
 * Haber kaynaklarının güvenilirlik, otorite, güncellik analizi.
 * Google News uyumluluğu için kaynak profili.
 */
import prisma from "@/lib/db";

// ─── Types ───────────────────────────────────────────────────

export interface SourceProfile {
  id: string; name: string; url: string; type: string; language: string;
  isActive: boolean; priority: number; lastFetchedAt: Date | null;
  category: { name: string; slug: string } | null;
}

export interface SourceIntelligence {
  profile: SourceProfile;
  scores: SourceScores;
  stats: SourceStats;
  rating: SourceRating;
  googleNewsReady: boolean;
}

export interface SourceScores {
  reliability: number;   // 0-100: Kaynak ne kadar güvenilir?
  authority: number;     // 0-100: Otorite/etki skoru
  freshness: number;     // 0-100: Ne kadar güncel?
  consistency: number;   // 0-100: Yayın tutarlılığı
  diversity: number;     // 0-100: Konu çeşitliliği
  total: number;         // 0-100: Toplam güven skoru
}

export interface SourceStats {
  totalArticles: number;
  publishedArticles: number;
  avgArticlesPerDay: number;
  lastPublishedAt: Date | null;
  topCategories: Array<{ name: string; count: number }>;
  successRate: number; // Başarılı fetch oranı
}

export type SourceRating = "AAA" | "AA" | "A" | "B" | "C" | "D" | "F";

// ─── Main API ────────────────────────────────────────────────

export async function analyzeSource(sourceId: string): Promise<SourceIntelligence | null> {
  try {
    const source = await prisma.source.findUnique({
      where: { id: sourceId },
      include: { category: { select: { name: true, slug: true } } },
    });
    if (!source) return null;

    const profile: SourceProfile = {
      id: source.id, name: source.name, url: source.url, type: source.type,
      language: source.language, isActive: source.isActive, priority: source.priority,
      lastFetchedAt: source.lastFetchedAt, category: source.category,
    };

    const articles = await prisma.article.findMany({
      where: { sourceId: source.id },
      select: { id: true, status: true, publishedAt: true, categoryId: true, category: { select: { name: true } } },
      orderBy: { publishedAt: "desc" },
      take: 100,
    });

    const published = articles.filter(a => a.status === "published");
    const publishedDates = published.map(a => a.publishedAt).filter(Boolean) as Date[];

    const stats: SourceStats = {
      totalArticles: articles.length,
      publishedArticles: published.length,
      avgArticlesPerDay: calculateAvgPerDay(publishedDates),
      lastPublishedAt: publishedDates[0] || null,
      topCategories: getTopCategories(articles),
      successRate: source.lastFetchedAt ? 85 : 50,
    };

    const scores = calculateScores(source, stats, publishedDates);
    const rating = getRating(scores.total);
    const googleNewsReady = scores.total >= 70 && stats.publishedArticles >= 10;

    return { profile, scores, stats, rating, googleNewsReady };
  } catch { return null; }
}

export async function listSources(minScore = 0): Promise<SourceIntelligence[]> {
  try {
    const sources = await prisma.source.findMany({ where: { isActive: true }, include: { category: { select: { name: true, slug: true } } } });
    const results: SourceIntelligence[] = [];
    for (const s of sources) {
      const intel = await analyzeSource(s.id);
      if (intel && intel.scores.total >= minScore) results.push(intel);
    }
    return results.sort((a, b) => b.scores.total - a.scores.total);
  } catch { return []; }
}

// ─── Scoring ─────────────────────────────────────────────────

function calculateScores(source: { isActive: boolean; priority: number; lastFetchedAt: Date | null; type: string }, stats: SourceStats, dates: Date[]): SourceScores {
  const reliability = source.isActive ? Math.min(95, 50 + source.priority * 5) : 30;
  const authority = Math.min(100, source.priority * 10 + (stats.publishedArticles > 50 ? 20 : stats.publishedArticles > 10 ? 10 : 0));
  const freshness = source.lastFetchedAt ? Math.max(0, Math.round(100 - (Date.now() - new Date(source.lastFetchedAt).getTime()) / (86400000 * 3))) : 0;
  const consistency = dates.length > 0 ? Math.min(100, Math.round(stats.avgArticlesPerDay * 20)) : 50;
  const diversity = stats.topCategories.length >= 3 ? 85 : stats.topCategories.length >= 2 ? 65 : 40;
  const total = Math.round((reliability * 0.3 + authority * 0.2 + freshness * 0.2 + consistency * 0.15 + diversity * 0.15));
  return { reliability, authority, freshness, consistency, diversity, total };
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

function getTopCategories(articles: Array<{ category: { name: string } | null }>): Array<{ name: string; count: number }> {
  const counts = new Map<string, number>();
  for (const a of articles) {
    if (a.category) counts.set(a.category.name, (counts.get(a.category.name) || 0) + 1);
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5).map(([name, count]) => ({ name, count }));
}

export const sourceIntelligence = { analyzeSource, listSources };
export default sourceIntelligence;
