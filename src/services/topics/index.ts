/**
 * Topic Hub System — Merkezi Konu Yönetimi
 *
 * Konu sayfaları, topic ilişkileri, topic bazlı içerik sorguları.
 * SEO, internal linking, Discover, Entity Engine ve Google News için temel.
 *
 * Kullanım:
 *   import { topicHub } from "@/services/topics";
 *   const topic = topicHub.getTopic("openai");
 *   const stats = await topicHub.getTopicStats("openai");
 */
import prisma from "@/lib/db";
import type { TopicDefinition, TopicStats, TopicQuery } from "./types";
import { TOPIC_CONFIGS, getTopicConfig } from "./config";

// ─── Re-export ───────────────────────────────────────────────

export { TOPIC_CONFIGS as TOPIC_REGISTRY, getTopicConfig } from "./config";
export type { TopicDefinition, TopicStats, TopicQuery } from "./types";
export { generateTopicMetadata, generateTopicSEO, generateTopicBreadcrumbs, generateTopicSitemapEntry } from "./metadata";
export { generateAllTopicSchemas, generateTopicCollectionPage, generateTopicBreadcrumbSchema } from "./schema";
export { validateTopic, validateAllTopics, checkDuplicateSlugs, findBrokenSlugs, findLowContentTopics } from "./validator";

// ─── Topic Queries ───────────────────────────────────────────

export function getTopic(slug: string): TopicDefinition | null {
  return getTopicConfig(slug);
}

export function getAllTopics(): TopicDefinition[] {
  return Object.values(TOPIC_CONFIGS);
}

export function getTopicsByCategory(category: string): TopicDefinition[] {
  return Object.values(TOPIC_CONFIGS).filter(t => t.category === category);
}

export function searchTopics(query: string): TopicDefinition[] {
  const lower = query.toLowerCase();
  return Object.values(TOPIC_CONFIGS).filter(t =>
    t.name.toLowerCase().includes(lower) || t.keywords.some(k => k.toLowerCase().includes(lower))
  );
}

export function queryTopics(params: TopicQuery = {}): TopicDefinition[] {
  let results = Object.values(TOPIC_CONFIGS);
  if (params.category) results = results.filter(t => t.category === params.category);
  if (params.search) {
    const q = params.search.toLowerCase();
    results = results.filter(t => t.name.toLowerCase().includes(q) || t.keywords.some(k => k.toLowerCase().includes(q)));
  }
  if (params.sortBy === "name") results.sort((a, b) => a.name.localeCompare(b.name, "tr"));
  if (params.sortOrder === "desc") results.reverse();
  if (params.offset) results = results.slice(params.offset);
  if (params.limit) results = results.slice(0, params.limit);
  return results;
}

// ─── Topic Stats ─────────────────────────────────────────────

export async function getTopicStats(slug: string): Promise<TopicStats | null> {
  const topic = getTopic(slug);
  if (!topic) return null;
  try {
    const searchTerm = topic.name;
    const [articleCount, latestArticle, popularArticles, categoryData, sourceData] = await Promise.all([
      prisma.article.count({ where: { status: "published", OR: [{ title: { contains: searchTerm } }, { excerpt: { contains: searchTerm } }] } }),
      prisma.article.findFirst({ where: { status: "published", title: { contains: searchTerm } }, select: { title: true, slug: true, publishedAt: true, excerpt: true, featuredImage: true, category: { select: { name: true, color: true } } }, orderBy: { publishedAt: "desc" } }),
      prisma.article.findMany({ where: { status: "published", title: { contains: searchTerm } }, select: { title: true, slug: true, publishedAt: true, viewCount: true, featuredImage: true, category: { select: { name: true, color: true } } }, orderBy: { viewCount: "desc" }, take: 5 }),
      prisma.article.findMany({ where: { status: "published", title: { contains: searchTerm } }, select: { category: { select: { name: true, slug: true } } }, take: 50 }),
      prisma.article.findMany({ where: { status: "published", title: { contains: searchTerm } }, select: { source: { select: { name: true } } }, take: 50, distinct: ["sourceId"] }),
    ]);

    // Kategori sayımları
    const catCounts = new Map<string, { name: string; slug: string; count: number }>();
    for (const a of categoryData) {
      if (a.category) {
        const existing = catCounts.get(a.category.slug);
        if (existing) existing.count++;
        else catCounts.set(a.category.slug, { ...a.category, count: 1 });
      }
    }
    const topCategories = [...catCounts.values()].sort((a, b) => b.count - a.count).slice(0, 6);

    // Kaynaklar
    const relatedSources = sourceData.filter(a => a.source?.name).map(a => ({ name: a.source!.name, slug: a.source!.name.toLowerCase().replace(/\s+/g, "-") }));
    const uniqueSources = relatedSources.filter((s, i, arr) => arr.findIndex(x => x.name === s.name) === i).slice(0, 8);

    const related = findRelatedTopics(slug, topic);
    const now = new Date().toISOString();

    return {
      articleCount,
      guideCount: 0,
      reviewCount: 0,
      comparisonCount: 0,
      totalContent: articleCount,
      latestArticle: latestArticle ? { title: latestArticle.title, slug: latestArticle.slug, publishedAt: latestArticle.publishedAt?.toISOString() || now, excerpt: latestArticle.excerpt || undefined, featuredImage: latestArticle.featuredImage, category: latestArticle.category || undefined } : null,
      popularArticles: popularArticles.map(a => ({ title: a.title, slug: a.slug, publishedAt: a.publishedAt?.toISOString() || now, featuredImage: a.featuredImage, category: a.category || undefined })),
      topCategories: topCategories.map(c => ({ name: c.name, slug: c.slug, count: c.count })),
      relatedTopics: related.map(r => ({ ...r, icon: getTopic(r.slug)?.icon || "📌" })),
      relatedEntities: [],
      relatedSources: uniqueSources,
      lastUpdatedAt: latestArticle?.publishedAt?.toISOString() || null,
    };
  } catch { return null; }
}

// ─── Related Topics ──────────────────────────────────────────

function findRelatedTopics(slug: string, topic: TopicDefinition): Array<{ slug: string; name: string; relevance: number }> {
  const related: Array<{ slug: string; name: string; relevance: number }> = [];
  for (const [key, other] of Object.entries(TOPIC_CONFIGS)) {
    if (key === slug) continue;
    const sharedKeywords = topic.keywords.filter(k => other.keywords?.some(ok => ok.toLowerCase().includes(k.toLowerCase()) || k.toLowerCase().includes(ok.toLowerCase())));
    const sameCategory = topic.category === other.category ? 1 : 0;
    const relevance = sharedKeywords.length * 25 + sameCategory * 20;
    if (relevance > 0) related.push({ slug: key, name: other.name, relevance: Math.min(100, relevance) });
  }
  return related.sort((a, b) => b.relevance - a.relevance).slice(0, 8);
}

export const topicHub = {
  getTopic, getAllTopics, getTopicsByCategory, searchTopics, queryTopics, getTopicStats,
  TOPIC_REGISTRY: TOPIC_CONFIGS,
  validate: () => import("./validator").then(m => m.validateAllTopics()),
};
export default topicHub;
