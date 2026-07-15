/**
 * Topic Hub System — Type Definitions
 *
 * Merkezi konu yönetimi için tüm tip tanımları.
 * SEO, Entity Engine, Internal Link Engine ile uyumlu.
 */

// ─── Topic Model ────────────────────────────────────────────

export interface Topic {
  id: string;
  name: string;
  slug: string;
  description: string;
  coverImage: string | null;
  icon: string;
  seoTitle: string | null;
  seoDescription: string | null;
  color: string;
  status: TopicStatus;
  category: string;
  keywords: string[];
  articleCount: number;
  guideCount: number;
  reviewCount: number;
  comparisonCount: number;
  totalContent: number;
  createdAt: string;
  updatedAt: string;
}

export type TopicStatus = "active" | "inactive" | "draft";

// ─── Topic Definition (Registry) ────────────────────────────

export interface TopicDefinition {
  name: string;
  slug: string;
  category: string;
  keywords: string[];
  icon: string;
  description?: string;
  color?: string;
  coverImage?: string;
  seoTitle?: string;
  seoDescription?: string;
}

// ─── Topic Stats ────────────────────────────────────────────

export interface TopicStats {
  articleCount: number;
  guideCount: number;
  reviewCount: number;
  comparisonCount: number;
  totalContent: number;
  latestArticle: TopicArticleRef | null;
  popularArticles: TopicArticleRef[];
  topCategories: Array<{ name: string; slug: string; count: number }>;
  relatedTopics: Array<{ slug: string; name: string; icon: string; relevance: number }>;
  relatedEntities: Array<{ name: string; type: string; slug: string }>;
  relatedSources: Array<{ name: string; slug: string }>;
  lastUpdatedAt: string | null;
}

export interface TopicArticleRef {
  title: string;
  slug: string;
  publishedAt: string;
  excerpt?: string;
  featuredImage?: string | null;
  category?: { name: string; color: string };
}

// ─── Topic SEO Metadata ─────────────────────────────────────

export interface TopicSEO {
  title: string;
  description: string;
  canonical: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  ogType: "website";
  twitterCard: "summary_large_image";
  twitterTitle: string;
  twitterDescription: string;
  twitterImage: string;
}

// ─── Topic Validation ───────────────────────────────────────

export interface TopicValidation {
  valid: boolean;
  errors: TopicValidationError[];
  warnings: string[];
}

export interface TopicValidationError {
  field: string;
  message: string;
  severity: "error" | "warning";
}

// ─── Topic Query ────────────────────────────────────────────

export interface TopicQuery {
  category?: string;
  status?: TopicStatus;
  search?: string;
  minArticles?: number;
  sortBy?: "name" | "articleCount" | "updatedAt" | "relevance";
  sortOrder?: "asc" | "desc";
  limit?: number;
  offset?: number;
}
