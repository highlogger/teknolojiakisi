/**
 * Internal Link Engine — Type Definitions
 */

export const LINK_TYPE = {
  ARTICLE: "article",
  CATEGORY: "category",
  TAG: "tag",
  AUTHOR: "author",
  GUIDE: "guide",
  COMPARISON: "comparison",
  REVIEW: "review",
  STATIC_PAGE: "static_page",
} as const;

export type LinkType = (typeof LINK_TYPE)[keyof typeof LINK_TYPE];

export const LINK_SOURCE = {
  ENTITY: "entity",
  CATEGORY: "category",
  TAG: "tag",
  AUTHOR: "author",
  TITLE: "title",
  SLUG: "slug",
  KEYWORD: "keyword",
  CONTENT: "content",
} as const;

export type LinkSource = (typeof LINK_SOURCE)[keyof typeof LINK_SOURCE];

export interface LinkSuggestion {
  id: string;
  sourceArticleId: string;
  targetArticleId: string;
  targetTitle: string;
  targetSlug: string;
  targetUrl: string;
  linkType: LinkType;
  matchSource: LinkSource;
  score: number; // 0-100
  anchorText?: string;
  matchDetails: Record<string, number>;
}

export interface LinkScoreBreakdown {
  entityMatch: number;
  keywordMatch: number;
  categoryMatch: number;
  tagMatch: number;
  freshness: number;
  popularity: number;
  authority: number;
  semanticSimilarity: number;
  total: number;
}

export interface LinkRule {
  id: string;
  name: string;
  description: string;
  check: (source: any, target: any) => boolean;
}

export interface LinkRecommendationResult {
  articleId: string;
  suggestions: LinkSuggestion[];
  top5: LinkSuggestion[];
  top10: LinkSuggestion[];
  generatedAt: string;
}
