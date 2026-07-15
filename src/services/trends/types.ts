/** Trend Intelligence — Types */

export const TREND_SOURCE = {
  GOOGLE_TRENDS: "google_trends", REDDIT: "reddit", X: "x",
  YOUTUBE: "youtube", RSS: "rss", HACKER_NEWS: "hacker_news",
  GITHUB: "github_trending", PRODUCT_HUNT: "product_hunt",
} as const;
export type TrendSource = (typeof TREND_SOURCE)[keyof typeof TREND_SOURCE];

export interface TrendSignal {
  id: string; topic: string; source: TrendSource;
  score: TrendScore; firstSeen: string; lastSeen: string;
  metadata: { mentions: number; velocity: number; acceleration: number };
}
export interface TrendScore {
  volume: number; velocity: number; acceleration: number;
  relevance: number; authority: number; overall: number;
}
export interface TrendReport {
  generatedAt: string; trending: TrendSignal[];
  emerging: TrendSignal[]; declining: TrendSignal[];
  topTopics: string[];
}
