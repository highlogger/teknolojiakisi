/**
 * Author Authority System — Yazar Otorite ve Uzmanlık Analizi
 *
 * Yazarların otorite skoru, uzmanlık alanları, katkı istatistikleri.
 * Google News ve E-E-A-T için yazar profili.
 */
import prisma from "@/lib/db";

// ─── Types ───────────────────────────────────────────────────

export interface AuthorProfile {
  id: string; name: string; slug: string; avatar: string | null;
  bio: string | null; isBot: boolean; specialty: string | null;
}

export interface AuthorAuthority {
  profile: AuthorProfile;
  scores: AuthorScores;
  stats: AuthorStats;
  expertise: ExpertiseArea[];
  rating: AuthorRating;
  eeatCompliant: boolean; // Google E-E-A-T uyumlu mu?
}

export interface AuthorScores {
  authority: number;       // 0-100: Genel otorite
  consistency: number;     // 0-100: Yayın tutarlılığı
  expertise: number;       // 0-100: Uzmanlık derinliği
  engagement: number;      // 0-100: Etkileşim (okunma)
  trust: number;           // 0-100: Güven skoru
  total: number;           // 0-100: Toplam
}

export interface AuthorStats {
  totalArticles: number;
  publishedArticles: number;
  avgWordsPerArticle: number;
  firstArticleAt: Date | null;
  lastArticleAt: Date | null;
  categories: Array<{ name: string; count: number; percentage: number }>;
  totalViews: number;
  avgViewsPerArticle: number;
}

export interface ExpertiseArea {
  category: string;
  articleCount: number;
  percentage: number;
  level: "expert" | "advanced" | "intermediate" | "beginner";
}

export type AuthorRating = "S" | "A+" | "A" | "B" | "C" | "New";

// ─── Main API ────────────────────────────────────────────────

export async function analyzeAuthor(authorId: string): Promise<AuthorAuthority | null> {
  try {
    const author = await prisma.author.findUnique({ where: { id: authorId } });
    if (!author) return null;

    const profile: AuthorProfile = {
      id: author.id, name: author.name, slug: author.slug,
      avatar: author.avatar, bio: author.bio, isBot: author.isBot, specialty: author.specialty,
    };

    const articles = await prisma.article.findMany({
      where: { authorId: author.id },
      select: { id: true, status: true, content: true, publishedAt: true, viewCount: true, category: { select: { name: true, slug: true } } },
      orderBy: { publishedAt: "desc" },
      take: 100,
    });

    const published = articles.filter(a => a.status === "published");

    const stats = calculateStats(articles, published);
    const expertise = calculateExpertise(published);
    const scores = calculateAuthorScores(author, stats, expertise);

    // E-E-A-T: Experience, Expertise, Authoritativeness, Trustworthiness
    const eeatCompliant = (
      !!author.bio && author.bio.length > 20 &&  // Experience
      scores.expertise >= 50 &&                    // Expertise
      scores.authority >= 50 &&                    // Authoritativeness
      scores.trust >= 50                           // Trustworthiness
    );

    return { profile, scores, stats, expertise, rating: getAuthorRating(scores.total), eeatCompliant };
  } catch { return null; }
}

export async function listTopAuthors(minArticles = 5): Promise<AuthorAuthority[]> {
  try {
    const authors = await prisma.author.findMany();
    const results: AuthorAuthority[] = [];
    for (const a of authors) {
      const auth = await analyzeAuthor(a.id);
      if (auth && auth.stats.publishedArticles >= minArticles) results.push(auth);
    }
    return results.sort((a, b) => b.scores.total - a.scores.total);
  } catch { return []; }
}

// ─── Stats ───────────────────────────────────────────────────

function calculateStats(allArticles: Array<{ status: string; content: string; publishedAt: Date | null; viewCount: number; category: { name: string; slug: string } | null }>, published: typeof allArticles): AuthorStats {
  const totalViews = published.reduce((s, a) => s + (a.viewCount || 0), 0);
  const dates = published.map(a => a.publishedAt).filter(Boolean) as Date[];
  const wordCounts = published.map(a => a.content.replace(/<[^>]*>/g, "").split(/\s+/).length);
  const avgWords = wordCounts.length > 0 ? Math.round(wordCounts.reduce((s, c) => s + c, 0) / wordCounts.length) : 0;
  const categories = getCategoryDistribution(published);

  return {
    totalArticles: allArticles.length,
    publishedArticles: published.length,
    avgWordsPerArticle: avgWords,
    firstArticleAt: dates[dates.length - 1] || null,
    lastArticleAt: dates[0] || null,
    categories,
    totalViews,
    avgViewsPerArticle: published.length > 0 ? Math.round(totalViews / published.length) : 0,
  };
}

// ─── Expertise ───────────────────────────────────────────────

function calculateExpertise(articles: Array<{ category: { name: string; slug: string } | null }>): ExpertiseArea[] {
  const counts = new Map<string, number>();
  for (const a of articles) {
    if (a.category) counts.set(a.category.name, (counts.get(a.category.name) || 0) + 1);
  }
  const total = articles.length || 1;
  return [...counts.entries()]
    .map(([category, count]) => ({
      category, articleCount: count, percentage: Math.round((count / total) * 100),
      level: count >= 20 ? "expert" as const : count >= 10 ? "advanced" as const : count >= 5 ? "intermediate" as const : "beginner" as const,
    }))
    .sort((a, b) => b.articleCount - a.articleCount)
    .slice(0, 6);
}

// ─── Scoring ─────────────────────────────────────────────────

function calculateAuthorScores(author: { isBot: boolean; specialty: string | null }, stats: AuthorStats, expertise: ExpertiseArea[]): AuthorScores {
  const authority = Math.min(100, stats.publishedArticles * 2 + (author.specialty ? 20 : 0) + (expertise.filter(e => e.level === "expert").length * 15));
  const consistency = stats.publishedArticles >= 30 ? 90 : stats.publishedArticles >= 10 ? 70 : stats.publishedArticles >= 3 ? 50 : 20;
  const expertiseScore = Math.min(100, expertise.reduce((s, e) => s + (e.level === "expert" ? 30 : e.level === "advanced" ? 20 : 10), 0));
  const engagement = stats.totalViews > 10000 ? 90 : stats.totalViews > 1000 ? 60 : stats.totalViews > 100 ? 30 : 10;
  const trust = author.isBot ? Math.min(80, authority - 10) : Math.min(100, authority);
  const total = Math.round((authority * 0.3 + consistency * 0.2 + expertiseScore * 0.25 + engagement * 0.1 + trust * 0.15));
  return { authority, consistency, expertise: expertiseScore, engagement, trust, total };
}

function getAuthorRating(score: number): AuthorRating {
  if (score >= 90) return "S"; if (score >= 80) return "A+"; if (score >= 70) return "A";
  if (score >= 50) return "B"; if (score >= 30) return "C"; return "New";
}

function getCategoryDistribution(articles: Array<{ category: { name: string; slug: string } | null }>): Array<{ name: string; count: number; percentage: number }> {
  const counts = new Map<string, number>();
  for (const a of articles) {
    if (a.category) counts.set(a.category.name, (counts.get(a.category.name) || 0) + 1);
  }
  const total = articles.length || 1;
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6).map(([name, count]) => ({ name, count, percentage: Math.round((count / total) * 100) }));
}

export const authorAuthority = { analyzeAuthor, listTopAuthors };
export default authorAuthority;
