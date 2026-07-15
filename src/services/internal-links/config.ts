/** Internal Link Engine — Configuration */
import type { LinkScoreBreakdown } from "./types";

export const LINK_SCORE_WEIGHTS: Record<keyof LinkScoreBreakdown, number> = {
  entityMatch: 0.25,
  keywordMatch: 0.20,
  categoryMatch: 0.15,
  tagMatch: 0.10,
  semanticSimilarity: 0.10,
  freshness: 0.08,
  popularity: 0.07,
  authority: 0.05,
  total: 0,
};

export const LINK_RULES = {
  minScore: 20,
  maxPerArticle: 20,
  top5MinScore: 40,
  top10MinScore: 25,
  excludeStatuses: ["draft", "archived", "deleted"],
  maxAnchorLength: 60,
};
