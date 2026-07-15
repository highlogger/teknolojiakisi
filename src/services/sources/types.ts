/**
 * Source Intelligence System — Type Definitions
 */
export interface SourceProfile {
  id: string; name: string; slug: string; description: string | null;
  website: string; rssUrl: string | null; logo: string | null; favicon: string | null;
  country: string; language: string; category: string | null;
  verified: boolean; active: boolean;
  authorityScore: number; trustScore: number; freshnessScore: number;
  publishFrequency: number; overallScore: number;
  lastCrawled: string | null; lastPublished: string | null;
  articleCount: number; createdAt: string; updatedAt: string;
}

export interface SourceScores {
  authority: number; trust: number; freshness: number;
  frequency: number; reliability: number; overall: number;
}

export interface SourceStats {
  totalArticles: number; publishedArticles: number;
  avgArticlesPerDay: number; lastPublishedAt: string | null;
  topCategories: Array<{ name: string; slug: string; count: number }>;
  topTopics: Array<{ slug: string; name: string; count: number }>;
  successRate: number;
}

export interface SourceValidation {
  valid: boolean; errors: SourceValidationError[]; warnings: string[];
}

export interface SourceValidationError {
  field: string; message: string; severity: "error" | "warning";
}

export type SourceRating = "AAA" | "AA" | "A" | "B" | "C" | "D" | "F";

export interface SourceIntelligence {
  profile: SourceProfile;
  scores: SourceScores;
  stats: SourceStats;
  rating: SourceRating;
  googleNewsReady: boolean;
}
