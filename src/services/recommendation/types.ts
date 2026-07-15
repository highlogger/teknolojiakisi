/** Related Content Engine — Types */

export const RECOMMENDATION_TYPE = {
  RELATED_NEWS: "related_news",
  RELATED_REVIEW: "related_review",
  RELATED_GUIDE: "related_guide",
  RELATED_COMPARISON: "related_comparison",
  TRENDING: "trending",
  LATEST: "latest",
  EDITORS_PICKS: "editors_picks",
} as const;

export type RecommendationType = (typeof RECOMMENDATION_TYPE)[keyof typeof RECOMMENDATION_TYPE];

export interface ContentSimilarity {
  entitySimilarity: number;
  categorySimilarity: number;
  tagSimilarity: number;
  keywordSimilarity: number;
  semanticSimilarity: number;
  titleSimilarity: number;
  totalSimilarity: number;
}

export interface RecommendationScore {
  entityMatch: number;
  semantic: number;
  category: number;
  freshness: number;
  popularity: number;
  author: number;
  total: number;
}

export interface ContentRecommendation {
  articleId: string;
  title: string;
  slug: string;
  score: RecommendationScore;
  similarity: ContentSimilarity;
  type: RecommendationType;
}

export interface RecommendationResult {
  sourceArticleId: string;
  relatedNews: ContentRecommendation[];
  relatedGuides: ContentRecommendation[];
  trending: ContentRecommendation[];
  latest: ContentRecommendation[];
  generatedAt: string;
}
