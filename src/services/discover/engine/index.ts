/** Google Discover Engine — Main Engine */

import type { DiscoverAnalysis, DiscoverScore, DiscoverMetadata, DiscoverValidation } from "../types";

export function analyzeForDiscover(params: {
  title: string;
  content: string;
  featuredImage?: string | null;
  publishedAt?: Date | null;
  category?: string;
  originalUrl?: string | null;
  viewCount?: number;
}): { score: DiscoverScore; metadata: DiscoverMetadata; validation: DiscoverValidation } {
  const { title, content, featuredImage, publishedAt, category, originalUrl } = params;
  const wordCount = content.replace(/<[^>]*>/g, "").split(/\s+/).filter(Boolean).length;

  // Freshness
  const hoursSincePub = publishedAt ? (Date.now() - new Date(publishedAt).getTime()) / 3600000 : 720;
  const freshness = hoursSincePub <= 6 ? 100 : hoursSincePub <= 24 ? 85 : hoursSincePub <= 72 ? 60 : hoursSincePub <= 168 ? 35 : 15;

  // Headline quality
  const headlineQuality = Math.min(100, title.length >= 10 && title.length <= 110 ? (title.length >= 30 && title.length <= 70 ? 90 : 70) : 40);

  // Image
  const imageQuality = featuredImage ? 85 : 20;

  // Content length
  const contentLength = wordCount >= 800 ? 90 : wordCount >= 500 ? 70 : wordCount >= 300 ? 50 : 25;

  // Entity coverage (basitleştirilmiş)
  const entities = (content.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/g) || []).length;
  const entityCoverage = Math.min(100, entities * 8);

  // Originality
  const originality = originalUrl ? 40 : 85;

  // Source authority
  const sourceAuthority = 50;

  // Category match
  const categoryMatch = category ? 70 : 40;

  // Breaking news
  const breakingNews = hoursSincePub <= 3 ? 95 : hoursSincePub <= 12 ? 60 : hoursSincePub <= 48 ? 25 : 5;

  const analysis: DiscoverAnalysis = {
    freshness, headlineQuality, imageQuality, contentLength,
    entityCoverage, topicTrend: 55, originality, sourceAuthority,
    updateFrequency: 50, categoryMatch, breakingNews,
  };

  const weights = { freshness: 0.25, headlineQuality: 0.20, imageQuality: 0.20, contentLength: 0.10, entityCoverage: 0.10, originality: 0.05, sourceAuthority: 0.05, breakingNews: 0.05 };
  const total = Math.round(
    freshness * weights.freshness + headlineQuality * weights.headlineQuality +
    imageQuality * weights.imageQuality + contentLength * weights.contentLength +
    entityCoverage * weights.entityCoverage + originality * weights.originality +
    sourceAuthority * weights.sourceAuthority + breakingNews * weights.breakingNews
  );

  const metadata: DiscoverMetadata = {
    isTrending: hoursSincePub <= 24 && total >= 60,
    isBreaking: hoursSincePub <= 3,
    isEvergreen: hoursSincePub > 168,
    freshnessHours: Math.round(hoursSincePub),
    editorialPriority: total >= 80 ? 9 : total >= 60 ? 6 : total >= 40 ? 3 : 1,
    discoverPriority: total,
  };

  // Validation
  const issues: string[] = [];
  const recommendations: string[] = [];
  if (imageQuality < 50) { issues.push("Görsel kalitesi düşük"); recommendations.push("1200x675+ piksel görsel ekleyin"); }
  if (headlineQuality < 60) { issues.push("Başlık optimize değil"); recommendations.push("30-70 karakter arası başlık kullanın"); }
  if (freshness < 30) { issues.push("İçerik güncel değil"); recommendations.push("Discover için taze içerik gerekli"); }
  if (wordCount < 300) { issues.push("İçerik çok kısa"); recommendations.push("En az 500 kelime hedefleyin"); }

  return {
    score: { analysis, total, level: total >= 80 ? "excellent" : total >= 60 ? "high" : total >= 40 ? "medium" : "low" },
    metadata,
    validation: { valid: issues.length === 0, score: total, issues, recommendations },
  };
}
