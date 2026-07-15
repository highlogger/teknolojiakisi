/** Google Discover Engine — Types */

export interface DiscoverAnalysis {
  freshness: number;       // 0-100
  headlineQuality: number;  // 0-100
  imageQuality: number;     // 0-100
  contentLength: number;    // 0-100
  entityCoverage: number;   // 0-100
  topicTrend: number;       // 0-100
  originality: number;      // 0-100
  sourceAuthority: number;  // 0-100
  updateFrequency: number;  // 0-100
  categoryMatch: number;    // 0-100
  breakingNews: number;     // 0-100
}

export interface DiscoverScore {
  analysis: DiscoverAnalysis;
  total: number; // 0-100
  level: "low" | "medium" | "high" | "excellent";
}

export interface DiscoverMetadata {
  isTrending: boolean;
  isBreaking: boolean;
  isEvergreen: boolean;
  freshnessHours: number;
  editorialPriority: number; // 0-10
  discoverPriority: number;  // 0-100
}

export interface DiscoverValidation {
  valid: boolean;
  score: number;
  issues: string[];
  recommendations: string[];
}
